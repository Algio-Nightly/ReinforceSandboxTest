"""
Problems router — public read access to problem listings and details.
Never exposes grader code.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List

from app.database import db_service
from app.problems.schemas import ProblemSummary, ProblemDetail

router = APIRouter()


@router.get("/", response_model=List[ProblemSummary])
async def list_problems():
    """List all available problems (title, difficulty, tags only)."""
    return db_service.problems.list_all()


@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem(problem_id: str):
    """
    Get full problem details including description and starter code.
    Does NOT return grader code.
    """
    problem = db_service.problems.get_by_id(problem_id)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem '{problem_id}' not found",
        )
    return problem
