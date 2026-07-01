from fastapi import APIRouter, Depends
from app.core.database import (get_database)
from app.auth.role_checker import RoleChecker
from app.services.threat_pipeline import generate_and_process_threat

router = APIRouter(
    prefix="/threats",
    tags=["Threats"]
)

all_roles = RoleChecker(["admin", "security_analyst", "viewer"])
analyst_or_admin = RoleChecker(["admin", "security_analyst"])

@router.get("/")
async def get_threats(current_user=Depends(all_roles)):
    return {
        "message":
        "Threat routes working"
    }

@router.post("/generate")
async def generate_threat(current_user=Depends(analyst_or_admin)):
    return await generate_and_process_threat()
@router.get("/feed")
async def get_threat_feed(current_user=Depends(all_roles)):
    db = get_database()
    threats = []
    cursor = db.threat_logs.find().sort(
        "created_at",
        -1
    )
    async for threat in cursor:

        threat["_id"] = str(
            threat["_id"]
        )
        threats.append(
            threat
)
    return threats
@router.get("/stats")
async def get_threat_stats(current_user=Depends(all_roles)):
    db = get_database()
    total_threats = await db.threat_logs.count_documents({})
    critical_threats = await db.threat_logs.count_documents(
        {"severity": "critical"})
    high_threats = await db.threat_logs.count_documents(
        {"severity": "high"}
    )

    medium_threats = await db.threat_logs.count_documents(
        {"severity": "medium"}
    )

    low_threats = await db.threat_logs.count_documents(
        {"severity": "low"})
    pipeline = [
        {
            "$group": {
                "_id": None,
                "avgRisk": {
                    "$avg": "$risk_score"
                }
            }
        }
    ]
    result = await db.threat_logs.aggregate(
        pipeline).to_list(length=1)
    avg_risk_score = (
        round(result[0]["avgRisk"], 2)
        if result
        else 0)
    return {
        "total_threats": total_threats,
        "critical_threats": critical_threats,
        "high_threats": high_threats,
        "medium_threats": medium_threats,
        "low_threats": low_threats,
        "average_risk_score": avg_risk_score
    }