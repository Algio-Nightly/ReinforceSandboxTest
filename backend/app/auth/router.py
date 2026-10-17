"""
Authentication router — handles email/password registration, login,
and Google OAuth token exchange.
"""
from datetime import datetime, timezone
import bcrypt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from firebase_admin import auth as firebase_auth

from app.firebase_client import get_db
from app.auth.jwt import create_access_token

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


# ── Request / Response Schemas ──

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str  # Firebase ID token from frontend Google Sign-In


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


# ── Endpoints ──

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    """Register a new user with email and password."""
    db = get_db()

    # Check if email already exists
    existing = db.collection("users").where("email", "==", body.email).limit(1).get()
    if len(existing) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user document
    password_hash = hash_password(body.password)
    user_ref = db.collection("users").document()
    user_id = user_ref.id

    user_ref.set({
        "email": body.email,
        "password_hash": password_hash,
        "display_name": body.display_name or body.email.split("@")[0],
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Issue JWT
    token = create_access_token(user_id, body.email)
    return AuthResponse(access_token=token, user_id=user_id, email=body.email)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """Login with email and password."""
    db = get_db()

    # Find user by email
    users = db.collection("users").where("email", "==", body.email).limit(1).get()
    if len(users) == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_doc = users[0]
    user_data = user_doc.to_dict()

    # Verify password
    if not verify_password(body.password, user_data.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Issue JWT
    token = create_access_token(user_doc.id, body.email)
    return AuthResponse(access_token=token, user_id=user_doc.id, email=body.email)


@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest):
    """
    Exchange a Firebase ID token (from Google Sign-In on the frontend)
    for our app's JWT. Creates the user in Firestore if it's their first login.
    """
    db = get_db()

    try:
        # Verify the Firebase ID token using Admin SDK
        decoded_token = firebase_auth.verify_id_token(body.id_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
        )

    firebase_uid = decoded_token["uid"]
    email = decoded_token.get("email", "")
    display_name = decoded_token.get("name", email.split("@")[0])

    # Check if user already exists (by firebase_uid)
    existing = db.collection("users").where("firebase_uid", "==", firebase_uid).limit(1).get()

    if len(existing) > 0:
        user_doc = existing[0]
        user_id = user_doc.id
    else:
        # First-time Google login — create user record
        user_ref = db.collection("users").document()
        user_id = user_ref.id
        user_ref.set({
            "email": email,
            "display_name": display_name,
            "firebase_uid": firebase_uid,
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Issue our app JWT
    token = create_access_token(user_id, email)
    return AuthResponse(access_token=token, user_id=user_id, email=email)
