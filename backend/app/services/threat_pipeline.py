from app.core.database import get_database
from app.models.threat_model import threat_document
from app.services.threat_detector import evaluate_threat
from app.services.threat_generator import generate_random_event
from app.services.incident_service import create_incident_if_needed
from app.websocket.connection_manager import manager


async def generate_and_process_threat():
    """
    Generates a synthetic threat event, runs it through detection,
    persists it, broadcasts it over the websocket, and opens an
    incident if warranted. Used by both the manual /threats/generate
    endpoint and the scheduled auto-generation job.
    """

    db = get_database()

    threat = generate_random_event()

    evaluation = await evaluate_threat(
        threat["event_type"],
        threat["ip_address"],
        db
    )

    threat_data = threat_document(
        event_type=threat["event_type"],
        ip_address=threat["ip_address"],
        country=threat["country"],
        risk_score=evaluation["risk_score"],
        severity=evaluation["severity"],
        description=threat["description"],
        detection_rule=evaluation["rule_name"],
        detection_engine=evaluation["detection_engine"],
        detection_status=evaluation["detection_status"],
        ioc_match=evaluation.get("ioc_match", False),
        ioc_threat_level=evaluation.get("ioc_threat_level", None),
        ioc_description=evaluation.get("ioc_description", None)
    )

    result = await db.threat_logs.insert_one(threat_data)

    created_threat = await db.threat_logs.find_one(
        {"_id": result.inserted_id}
    )
    created_threat["_id"] = str(created_threat["_id"])

    await manager.broadcast(
        {
            "type": "new_threat",
            "data": {
                "id": created_threat["_id"],
                "event_type": created_threat["event_type"],
                "severity": created_threat["severity"],
                "risk_score": created_threat["risk_score"],
                "country": created_threat["country"]
            }
        }
    )

    incident = await create_incident_if_needed(created_threat, db)

    return {
        "threat": created_threat,
        "incident": incident
    }
