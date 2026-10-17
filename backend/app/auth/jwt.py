"""
JWT token creation and verification.
Both email/password and Google OAuth flows produce the same app JWT.
"""
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.config import settings


def create_access_token(user_id: str, email: str) -> str:
    """Create a signed JWT with user_id and email as claims."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.
    Returns the payload dict with 'sub' (user_id) and 'email'.
    Raises JWTError if invalid or expired.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None:
            raise JWTError("Token missing 'sub' claim")
        return {"user_id": user_id, "email": email}
    except JWTError:
        raise
