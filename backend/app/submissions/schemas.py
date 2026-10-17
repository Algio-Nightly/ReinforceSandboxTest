"""
Pydantic schemas for the Submissions API.
"""
from pydantic import BaseModel
from typing import List, Optional


class SubmissionCreate(BaseModel):
    """Request body for POST /submissions."""
    problem_id: str
    code: str


class TestResult(BaseModel):
    """A single test result (public or hidden)."""
    name: str
    docstring: Optional[str] = None
    status: str  # "passed", "failed", "error"
    duration_ms: Optional[int] = None
    message: Optional[str] = None
    stdout: Optional[str] = None


class SubmissionStatus(BaseModel):
    """Response for GET /submissions/{id}/status."""
    submission_id: str
    status: str  # "queued", "running", "completed", "error"
    overall: Optional[str] = None  # e.g. "4/5 passed"
    execution_time_ms: Optional[int] = None
    public_tests: List[TestResult] = []
    hidden_tests: List[TestResult] = []


class SubmissionCreated(BaseModel):
    """Response for POST /submissions (202 Accepted)."""
    submission_id: str
