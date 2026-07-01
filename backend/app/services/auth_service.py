from datetime import datetime

from fastapi import HTTPException

from app.core.database import get_database

from app.models.user_model import user_document

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
)

from app.auth.password import (
    hash_password,
    verify_password,
)

from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token
)


async def register_user_service(
    user: UserRegister
) -> UserResponse:

    db = get_database()

    existing_user = await db.users.find_one(
        {
            "email": user.email.lower()
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = user_document(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )

    result = await db.users.insert_one(
        new_user
    )

    created_user = await db.users.find_one(
        {
            "_id": result.inserted_id
        }
    )

    return UserResponse(
        id=str(created_user["_id"]),
        name=created_user["name"],
        email=created_user["email"],
        role=created_user["role"],
        is_active=created_user["is_active"],
        created_at=created_user["created_at"],
        last_login=created_user["last_login"]
    )


async def login_user_service(
    user: UserLogin
) -> TokenResponse:

    db = get_database()

    existing_user = await db.users.find_one(
        {
            "email": user.email.lower()
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not existing_user.get(
        "is_active",
        True
    ):
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    await db.users.update_one(
        {
            "_id": existing_user["_id"]
        },
        {
            "$set": {
                "last_login": datetime.utcnow()
            }
        }
    )

    access_token = create_access_token(
        {
            "sub": existing_user["email"],
            "role": existing_user["role"]
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": existing_user["email"]
        }
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


async def get_current_user_service(
    current_user
) -> UserResponse:

    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"],
        last_login=current_user["last_login"]
    )

async def refresh_token_service(
    refresh_token: str
):

    payload = verify_refresh_token(
        refresh_token
    )

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    db = get_database()

    user = await db.users.find_one(
        {
            "email": payload["sub"]
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not user.get(
        "is_active",
        True
    ):
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    new_access_token = create_access_token(
        {
            "sub": user["email"],
            "role": user["role"]
        }
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

async def logout_service():

    return {
        "message": "Logged out successfully"
    }