"""
Submissions router — handles code submission and result polling.

POST /submissions → 202 Accepted (kicks off Docker in background)
GET /submissions/{id}/status → current status + sanitized results
"""
import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.firebase_client import get_db
from app.submissions.schemas import SubmissionCreate, SubmissionCreated, SubmissionStatus, TestResult
from app.submissions.sandbox import run_in_sandbox
from app.submissions.sanitizer import sanitize_report

router = APIRouter()


def _execute_submission(submission_id: str, code: str, grader_code: str):
    """
    Synchronous function that runs Docker sandbox and updates Firestore.
    Called from BackgroundTasks — runs in a thread pool, NOT on the event loop.
    """
    db = get_db()

    # Update status to "running"
    db.collection("submissions").document(submission_id).update({
        "status": "running",
    })

    try:
        # Run in Docker sandbox (synchronous — docker-py)
        raw_report = run_in_sandbox(
            submission_id=submission_id,
            submission_code=code,
            grader_code=grader_code,
        )

        # Sanitize the report (separate public vs hidden)
        sanitized = sanitize_report(raw_report)

        # Update Firestore with results
        db.collection("submissions").document(submission_id).update({
            "status": "completed",
            "overall": sanitized["overall"],
            "execution_time_ms": sanitized["execution_time_ms"],
            "public_results": sanitized["public_tests"],
            "hidden_results": sanitized["hidden_tests"],
            "hidden_summary": sanitized["hidden_summary"],
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })

    except Exception as e:
        # Mark as errored in Firestore
        db.collection("submissions").document(submission_id).update({
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
    Submit code for evaluation. Returns 202 Accepted immediately.

    The Docker sandbox runs in the background. Poll GET /submissions/{id}/status
    to check progress.
    """
    db = get_db()

    # 1. Fetch grader from the private collection (Admin SDK only)
    grader_doc = db.collection("problem_graders").document(body.problem_id).get()
    if not grader_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No grader found for problem '{body.problem_id}'",
        )

    grader_data = grader_doc.to_dict()
    grader_code = grader_data.get("grader_code", "")

    if not grader_code:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Grader code is empty — contact an administrator",
        )

    # 2. Create submission record in Firestore with status="queued"
    sub_ref = db.collection("submissions").document()
    submission_id = sub_ref.id

    sub_ref.set({
        "user_id": user["user_id"],
        "problem_id": body.problem_id,
        "code": body.code,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # 3. Kick off Docker execution in background — returns immediately
    background_tasks.add_task(_execute_submission, submission_id, body.code, grader_code)

    # 4. Return the submission ID right away
    return SubmissionCreated(submission_id=submission_id)


@router.get("/{submission_id}/status", response_model=SubmissionStatus)
async def get_submission_status(
    submission_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Poll submission status. Only the owning user can view their results.
    """
    db = get_db()

    doc = db.collection("submissions").document(submission_id).get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    data = doc.to_dict()

    # Ensure user can only see their own submissions
    if data.get("user_id") != user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own submissions",
        )

    # Build response based on current status
    current_status = data.get("status", "queued")

    public_tests = []
    hidden_tests = []

    if current_status == "completed":
        for t in data.get("public_results", []):
            public_tests.append(TestResult(**t))
        for t in data.get("hidden_results", []):
            hidden_tests.append(TestResult(**t))

    return SubmissionStatus(
        submission_id=submission_id,
        status=current_status,
        overall=data.get("overall"),
        execution_time_ms=data.get("execution_time_ms"),
        public_tests=public_tests,
        hidden_tests=hidden_tests,
    )
