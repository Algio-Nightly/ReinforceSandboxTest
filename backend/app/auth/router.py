"""
Authentication router — handles email/password registration, login,
and Google OAuth token exchange using Pydantic models.
"""
from datetime import datetime, timezone
import bcrypt
from fastapi import APIRouter, HTTPException, status
from firebase_admin import auth as firebase_auth

from app.auth.schemas import RegisterRequest, LoginRequest, GoogleAuthRequest, AuthResponse
from app.auth.jwt import create_access_token
from app.models import UserInDB
from app.database import db_service

router = APIRouter()


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    """Register a new user with email and password, validated via Pydantic."""
    existing = db_service.users.get_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Validate and construct user using UserInDB Pydantic model
    user_model = UserInDB(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name or body.email.split("@")[0],
        auth_provider="email",
    )
    saved_user = db_service.users.create(user_model)

    # Issue JWT
    token = create_access_token(saved_user.id, saved_user.email)
    return AuthResponse(
        access_token=token,
        user_id=saved_user.id,
        email=saved_user.email,
        display_name=saved_user.display_name,
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """Login with email and password."""
    user = db_service.users.get_by_email(body.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id, user.email)
    return AuthResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        display_name=user.display_name,
    )


@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest):
    """
    Exchange a Firebase ID token for an app JWT.
    Creates or retrieves the UserInDB record in Firestore.
    """
    try:
        decoded_token = firebase_auth.verify_id_token(body.id_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
        )

    firebase_uid = decoded_token["uid"]
    email = decoded_token.get("email", "")
    display_name = decoded_token.get("name", email.split("@")[0])

    user = db_service.users.get_by_firebase_uid(firebase_uid)
    if not user:
        user_model = UserInDB(
            email=email,
            password_hash="",
            display_name=display_name,
            firebase_uid=firebase_uid,
            auth_provider="google",
        )
        user = db_service.users.create(user_model)

    token = create_access_token(user.id, user.email)
    return AuthResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        display_name=user.display_name,
    )
