"""
Problems router — public read access to problem listings and details.
Never exposes grader code.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List

from app.firebase_client import get_db
from app.problems.schemas import ProblemSummary, ProblemDetail

router = APIRouter()


@router.get("/", response_model=List[ProblemSummary])
async def list_problems():
    """List all available problems (title, difficulty, tags only)."""
    db = get_db()
    docs = db.collection("problems").stream()
    
    problems = []
    for doc in docs:
        data = doc.to_dict()
        problems.append(ProblemSummary(
            id=doc.id,
            title=data.get("title", ""),
            difficulty=data.get("difficulty", "Medium"),
            tags=data.get("tags", []),
        ))
    
    return problems


@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem(problem_id: str):
    """
    Get full problem details including description and starter code.
    Does NOT return grader code — that lives in the problem_graders collection
    which is only accessible via the Admin SDK.
    """
    db = get_db()
    doc = db.collection("problems").document(problem_id).get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem '{problem_id}' not found",
        )
    
    data = doc.to_dict()
    return ProblemDetail(
        id=doc.id,
        title=data.get("title", ""),
        difficulty=data.get("difficulty", "Medium"),
        tags=data.get("tags", []),
        description_markdown=data.get("description_markdown", ""),
        starter_code=data.get("starter_code", ""),
        constraints=data.get("constraints"),
    )
