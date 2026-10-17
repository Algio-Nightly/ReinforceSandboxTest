"""
ML Code Judge — FastAPI Backend
================================
Main application entry point. Configures CORS, mounts routers,
and initializes the Firebase Admin SDK on startup.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.firebase_client import init_firebase
from app.auth.router import router as auth_router
from app.problems.router import router as problems_router
from app.submissions.router import router as submissions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup, clean up on shutdown."""
    init_firebase()
    yield


app = FastAPI(
    title="ML Code Judge API",
    description="Problem-agnostic Machine Learning code evaluation platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(problems_router, prefix="/problems", tags=["Problems"])
app.include_router(submissions_router, prefix="/submissions", tags=["Submissions"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ml-code-judge"}
