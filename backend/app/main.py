"""
ML Code Judge — FastAPI Backend
================================
Main application entry point. Configures CORS, mounts routers,
and initializes database and services on startup.
"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.firebase_client import init_firebase
from app.database import db_service
from app.auth.router import router as auth_router
from app.problems.router import router as problems_router
from app.submissions.router import router as submissions_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_judge")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and services on startup, clean up on shutdown."""
    logger.info("Starting up ML Code Judge API...")
    init_firebase()
    db_service.initialize_database()
    logger.info("API Database initialized successfully.")
    yield
    logger.info("Shutting down ML Code Judge API...")


app = FastAPI(
    title="ML Code Judge API",
    description="Problem-agnostic Machine Learning code evaluation platform with Pydantic validation & Firestore",
    version="0.2.0",
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


@app.get("/")
async def root():
    return {
        "message": "ML Code Judge API is operational",
        "docs_url": "/docs",
        "version": "0.2.0",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ml-code-judge",
        "database": "firestore",
    }
