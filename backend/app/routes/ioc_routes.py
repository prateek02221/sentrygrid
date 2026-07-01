from fastapi import APIRouter, Depends

from app.schemas.ioc_schema import (
    IOCCreate
)

from app.services.ioc_service import (
    create_ioc_service,
    get_all_iocs_service
)

from app.auth.role_checker import RoleChecker


router = APIRouter(
    prefix="/iocs",
    tags=["Threat Intelligence"]
)

admin_or_analyst = RoleChecker(
    ["admin", "security_analyst"]
)


@router.post("/")
async def create_ioc(
    data: IOCCreate,
    user=Depends(admin_or_analyst)
):
    return await create_ioc_service(data)


@router.get("/")
async def get_all_iocs(
    user=Depends(admin_or_analyst)
):
    return await get_all_iocs_service()