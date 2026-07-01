from fastapi import APIRouter, Depends

from app.services.threat_intelligence_service import (
    get_threat_intelligence_summary,
    get_top_malicious_ips,
    get_threat_type_distribution
)
from app.auth.role_checker import RoleChecker

router = APIRouter(
    prefix="/threat-intelligence",
    tags=["Threat Intelligence Analytics"]
)

all_roles = RoleChecker(["admin", "security_analyst", "viewer"])


@router.get("/summary")
async def summary(current_user=Depends(all_roles)):

    return await (
        get_threat_intelligence_summary()
    )

@router.get("/top-malicious-ips")
async def top_ips(current_user=Depends(all_roles)):

    return await (
        get_top_malicious_ips()
    )

@router.get("/threat-types")
async def threat_types(current_user=Depends(all_roles)):

    return await (
        get_threat_type_distribution()
    )