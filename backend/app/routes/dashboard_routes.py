from fastapi import APIRouter, Depends
from app.core.database import get_database
from app.auth.role_checker import RoleChecker

router = APIRouter()

all_roles = RoleChecker(["admin", "security_analyst", "viewer"])


@router.get("/overview")
async def dashboard_overview(current_user=Depends(all_roles)):
    db = get_database()
    total_threats = await db.threat_logs.count_documents({})
    critical_threats = await db.threat_logs.count_documents(
        {
            "severity": "critical"
        }
    )
    high_threats = await db.threat_logs.count_documents(
        {
            "severity": "high"
        }
    )
    open_incidents = await db.incidents.count_documents(
        {
            "status": "open"
        }
    )
    investigating_incidents = await db.incidents.count_documents(
        {
            "status": "investigating"
        }
    )
    resolved_incidents = await db.incidents.count_documents(
        {
            "status": "resolved"
        }
    )
    return {
        "total_threats": total_threats,
        "critical_threats": critical_threats,
        "high_threats": high_threats,
        "open_incidents": open_incidents,
        "investigating_incidents": investigating_incidents,
        "resolved_incidents": resolved_incidents
    }
@router.get("/severity-distribution")
async def severity_distribution(current_user=Depends(all_roles)):

    db = get_database()

    critical = await db.threat_logs.count_documents(
        {"severity": "critical"}
    )

    high = await db.threat_logs.count_documents(
        {"severity": "high"}
    )

    medium = await db.threat_logs.count_documents(
        {"severity": "medium"}
    )

    low = await db.threat_logs.count_documents(
        {"severity": "low"}
    )

    return {
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low
    }
@router.get("/threat-type-distribution")
async def threat_type_distribution(current_user=Depends(all_roles)):

    db = get_database()

    pipeline = [
        {
            "$group": {
                "_id": "$event_type",
                "count": {
                    "$sum": 1
                }
            }
        }
    ]

    result = await db.threat_logs.aggregate(
        pipeline
    ).to_list(length=100)

    distribution = {}

    for item in result:
        distribution[item["_id"]] = item["count"]

    return distribution
@router.get("/recent-threats")
async def recent_threats(current_user=Depends(all_roles)):

    db = get_database()

    threats = await db.threat_logs.find()\
        .sort("created_at", -1)\
        .limit(10)\
        .to_list(10)

    result = []

    for threat in threats:

        threat["_id"] = str(
            threat["_id"]
        )

        result.append(
            threat
        )

    return result
@router.get("/recent-incidents")
async def recent_incidents(current_user=Depends(all_roles)):

    db = get_database()

    incidents = await db.incidents.find()\
        .sort("created_at", -1)\
        .limit(10)\
        .to_list(10)

    result = []

    for incident in incidents:

        incident["_id"] = str(
            incident["_id"]
        )

        result.append(
            incident
        )

    return result
@router.get("/health-summary")
async def health_summary(current_user=Depends(all_roles)):

    db = get_database()

    total_threats = await db.threat_logs.count_documents({})

    open_incidents = await db.incidents.count_documents(
        {"status": "open"}
    )

    investigating_incidents = await db.incidents.count_documents(
        {"status": "investigating"}
    )

    resolved_incidents = await db.incidents.count_documents(
        {"status": "resolved"}
    )

    critical_threats = await db.threat_logs.count_documents(
        {"severity": "critical"}
    )

    return {
        "system_status": "healthy",
        "total_threats": total_threats,
        "critical_threats": critical_threats,
        "open_incidents": open_incidents,
        "investigating_incidents": investigating_incidents,
        "resolved_incidents": resolved_incidents
    }