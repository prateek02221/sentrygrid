from fastapi import (
    APIRouter,
    Depends
)

from app.auth.role_checker import (
    RoleChecker
)

from app.schemas.user_schema import (
    UserRole,
    UpdateRoleRequest,
    UpdateStatusRequest
)

from app.services.user_service import (
    get_all_users_service,
    get_user_by_id_service,
    update_user_role_service,
    update_user_status_service,
    delete_user_service
)

router = APIRouter(
    prefix="/users",
    tags=["User Management"]
)

admin_only = RoleChecker(
    ["admin"]
)


@router.get("")
@router.get("/")
async def get_all_users(
    current_user=Depends(admin_only)
):
    return await get_all_users_service()


@router.get("/{user_id}")
async def get_user_by_id(
    user_id: str,
    current_user=Depends(admin_only)
):
    return await get_user_by_id_service(
        user_id
    )


@router.put("/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: UpdateRoleRequest,
    current_user=Depends(admin_only)
):
    return await update_user_role_service(
        user_id,
        body.role
    )


@router.put("/{user_id}/status")
async def update_user_status(
    user_id: str,
    body: UpdateStatusRequest,
    current_user=Depends(admin_only)
):
    return await update_user_status_service(
        user_id,
        body.is_active
    )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user=Depends(admin_only)
):
    return await delete_user_service(
        user_id
    )