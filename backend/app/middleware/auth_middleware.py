from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from app.auth.jwt_handler import (
    verify_access_token
)

from app.core.database import (
    get_database
)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_access_token(
        token
    )

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    db = get_database()

    user = await db.users.find_one(
        {"email": payload["sub"]}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    if not user.get("is_active", True):
        raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User account is inactive"
    )
    return user 