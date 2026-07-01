from fastapi import (
    Depends,
    HTTPException,
    status
)

from app.middleware.auth_middleware import (
    get_current_user
)


class RoleChecker:
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    async def __call__(
        self,
        current_user=Depends(
            get_current_user
        )
    ):

        user_role = current_user["role"]

        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return current_user