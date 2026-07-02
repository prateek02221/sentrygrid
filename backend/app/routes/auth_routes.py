from fastapi import (
    APIRouter,
    Depends,
    Request,
    status
)

from app.core.limiter import limiter

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest
)

from app.middleware.auth_middleware import (
    get_current_user
)

from app.auth.role_checker import (
    RoleChecker
)

from app.services.auth_service import (
    register_user_service,
    login_user_service,
    get_current_user_service,
    refresh_token_service,
    logout_service
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# -------------------------------
# Role Based Access
# -------------------------------

admin_only = RoleChecker(
    ["admin"]
)

analyst_or_admin = RoleChecker(
    [
        "admin",
        "security_analyst"
    ]
)

all_roles = RoleChecker(
    [
        "admin",
        "security_analyst",
        "viewer"
    ]
)

# -------------------------------
# Authentication
# -------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
@limiter.limit("10/hour")
async def register_user(
    request: Request,
    user: UserRegister
):
    return await register_user_service(user)

@router.post(
    "/login",
    response_model=TokenResponse
)
@limiter.limit("5/minute")
async def login_user(
    request: Request,
    user: UserLogin
):
    return await login_user_service(user)

@router.post(
    "/refresh"
)
async def refresh_token(
    request: RefreshTokenRequest
):
    return await refresh_token_service(
        request.refresh_token
    )

@router.post(
    "/logout"
)
async def logout():

    return await logout_service()


@router.get(
    "/me",
    response_model=UserResponse
)
async def get_me(
    current_user=Depends(get_current_user)
):
    return await get_current_user_service(
        current_user
    )


# -------------------------------
# Role Based Routes
# -------------------------------

@router.get(
    "/admin-dashboard"
)
async def admin_dashboard(
    current_user=Depends(admin_only)
):
    return {
        "message": "Welcome Admin Dashboard"
    }


@router.get(
    "/analyst-dashboard"
)
async def analyst_dashboard(
    current_user=Depends(analyst_or_admin)
):
    return {
        "message": "Welcome Security Dashboard"
    }


@router.get(
    "/viewer-dashboard"
)
async def viewer_dashboard(
    current_user=Depends(all_roles)
):
    return {
        "message": "Welcome Viewer Dashboard"
    }