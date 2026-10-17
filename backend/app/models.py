"""
Core Pydantic data models for Firestore Database documents and validation.
All reads and writes between the FastAPI backend and Firestore are strongly typed
using these schemas.
"""
from datetime import datetime, timezone
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field


# ── User Models ──

class UserInDB(BaseModel):
    """Firestore document schema for the 'users' collection."""
    id: Optional[str] = None
    email: EmailStr
    password_hash: str
    display_name: str
    auth_provider: Literal["email", "google"] = "email"
    firebase_uid: Optional[str] = None
    role: Literal["student", "admin"] = "student"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ── Problem Models ──

class ProblemInDB(BaseModel):
    """Firestore document schema for the public 'problems' collection."""
    id: str
    title: str
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    tags: List[str] = Field(default_factory=list)
    description_markdown: str
    starter_code: str
    constraints: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProblemGraderInDB(BaseModel):
    """Firestore document schema for the private 'problem_graders' collection."""
    problem_id: str
    grader_code: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ── Submission Models ──

class TestResultDoc(BaseModel):
    """Schema for individual test execution outcomes stored in submissions."""
    name: str
    docstring: Optional[str] = None
    status: Literal["passed", "failed", "error"]
    duration_ms: Optional[int] = None
    message: Optional[str] = None
    stdout: Optional[str] = None


class HiddenSummaryDoc(BaseModel):
    """Safe pass/fail counts for hidden tests."""
    passed: int
    total: int


class SubmissionInDB(BaseModel):
    """Firestore document schema for the 'submissions' collection."""
    id: Optional[str] = None
    user_id: str
    problem_id: str
    code: str
    status: Literal["queued", "running", "completed", "error"] = "queued"
    overall: Optional[str] = None
    execution_time_ms: Optional[int] = None
    public_results: List[TestResultDoc] = Field(default_factory=list)
    hidden_results: List[TestResultDoc] = Field(default_factory=list)
    hidden_summary: Optional[HiddenSummaryDoc] = None
    error_message: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None
