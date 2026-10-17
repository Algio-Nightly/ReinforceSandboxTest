"""
Submissions router — handles code submission and result polling using Pydantic models.

POST /submissions → 202 Accepted (kicks off Docker in background)
GET /submissions/{id}/status → current status + sanitized results
"""
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.submissions.schemas import SubmissionCreate, SubmissionCreated, SubmissionStatus, TestResult
from app.submissions.sandbox import run_in_sandbox
from app.submissions.sanitizer import sanitize_report
from app.models import SubmissionInDB, TestResultDoc, HiddenSummaryDoc
from app.database import db_service

router = APIRouter()


def _execute_submission(submission_id: str, code: str, grader_code: str):
    """
    Synchronous worker called from BackgroundTasks.
    Runs Docker sandbox and updates Firestore record with Pydantic-validated results.
    """
    db_service.submissions.update(submission_id, {"status": "running"})

    try:
        # Run in Docker sandbox
        raw_report = run_in_sandbox(
            submission_id=submission_id,
            submission_code=code,
            grader_code=grader_code,
        )

        # Sanitize the report
        sanitized = sanitize_report(raw_report)

        # Validate results with Pydantic models
        public_docs = [TestResultDoc.model_validate(t).model_dump() for t in sanitized["public_tests"]]
        hidden_docs = [TestResultDoc.model_validate(t).model_dump() for t in sanitized["hidden_tests"]]
        hidden_summary_doc = HiddenSummaryDoc.model_validate(sanitized["hidden_summary"]).model_dump()

        db_service.submissions.update(submission_id, {
            "status": "completed",
            "overall": sanitized["overall"],
            "execution_time_ms": sanitized["execution_time_ms"],
            "public_results": public_docs,
            "hidden_results": hidden_docs,
            "hidden_summary": hidden_summary_doc,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })

    except Exception as e:
        db_service.submissions.update(submission_id, {
            "status": "error",
            "error_message": str(e),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })


@router.post("/", response_model=SubmissionCreated, status_code=status.HTTP_202_ACCEPTED)
async def submit_code(
    body: SubmissionCreate,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    """
    Submit code for evaluation. Validates via Pydantic and returns 202 Accepted immediately.
    """
    grader = db_service.graders.get_by_problem_id(body.problem_id)
    if not grader or not grader.grader_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No grader found for problem '{body.problem_id}'",
        )

    # Create submission record via SubmissionInDB Pydantic model
    submission_model = SubmissionInDB(
        user_id=user["user_id"],
        problem_id=body.problem_id,
        code=body.code,
        status="queued",
    )
    submission_id = db_service.submissions.create(submission_model)

    # Launch background Docker evaluation
    background_tasks.add_task(_execute_submission, submission_id, body.code, grader.grader_code)

    return SubmissionCreated(submission_id=submission_id)


@router.get("/{submission_id}/status", response_model=SubmissionStatus)
async def get_submission_status(
    submission_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Poll submission status. Returns strongly-typed Pydantic response.
    """
    sub = db_service.submissions.get_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    if sub.user_id != user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own submissions",
        )

    public_tests = [TestResult.model_validate(t.model_dump()) for t in sub.public_results]
    hidden_tests = [TestResult.model_validate(t.model_dump()) for t in sub.hidden_results]

    return SubmissionStatus(
        submission_id=submission_id,
        status=sub.status,
        overall=sub.overall,
        execution_time_ms=sub.execution_time_ms,
        public_tests=public_tests,
        hidden_tests=hidden_tests,
    )
