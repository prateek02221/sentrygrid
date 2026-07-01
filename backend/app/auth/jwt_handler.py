from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings
from jose import JWTError

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
):
    """
    Create JWT access token
    """

    to_encode = data.copy()

    expire = (
        datetime.utcnow() +
        (
            expires_delta
            if expires_delta
            else timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )
    )

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt


def create_refresh_token(
    data: dict
):
    """
    Create refresh token
    """

    to_encode = data.copy()

    expire = (
        datetime.utcnow() +
        timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_REFRESH_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt
from jose import JWTError


def verify_access_token(
    token: str
):
    """
    Verify JWT access token
    """

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ]
        )

        if payload.get("type") != "access":
            return None

        return payload

    except JWTError:
        return None
    

def verify_refresh_token(
    token: str
):
    """
    Verify refresh token
    """

    try:

        payload = jwt.decode(
            token,
            settings.JWT_REFRESH_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ]
        )

        if payload.get("type") != "refresh":
            return None

        return payload

    except JWTError:
        return None