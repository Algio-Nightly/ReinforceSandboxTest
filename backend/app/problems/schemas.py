"""
Pydantic schemas for the Problems API.
"""
from pydantic import BaseModel
from typing import List, Optional


class ProblemSummary(BaseModel):
    """Lightweight problem listing — used in GET /problems."""
    id: str
    title: str
    difficulty: str  # "Easy", "Medium", "Hard"
    tags: List[str] = []


class ProblemDetail(BaseModel):
    """Full problem detail — used in GET /problems/{id}."""
    id: str
    title: str
    difficulty: str
    tags: List[str] = []
    description_markdown: str
    starter_code: str
    constraints: Optional[str] = None
