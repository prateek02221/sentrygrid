from app.models.incident_model import incident_document
from bson import ObjectId
from datetime import datetime
from app.websocket.connection_manager import manager


async def create_incident_if_needed(
    threat: dict,
    db
):

    severity = threat["severity"]

    incident_type = "STANDARD_THREAT"

    if threat.get("ioc_match"):

        severity = "critical"
        incident_type = "IOC_MATCH"

    if severity not in [
        "high",
        "critical"
    ]:
        return None

    incident = incident_document(
        threat_id=str(
            threat["_id"]
        ),
        event_type=threat["event_type"],
        severity=severity,
        title=f"{severity.upper()} Threat Detected",
        description=threat["description"]
    )

    incident["incident_type"] = incident_type

    if incident_type == "IOC_MATCH":

        incident["priority"] = "P1"

    else:

        incident["priority"] = "P2"

    result = await db.incidents.insert_one(
        incident
    )

    created_incident = await db.incidents.find_one(
        {
            "_id": result.inserted_id
        }
    )

    created_incident["_id"] = str(
        created_incident["_id"]
    )

    await manager.broadcast(
        {
            "type": "new_incident",
            "data": {
                "id": created_incident["_id"],
                "event_type": created_incident["event_type"],
                "severity": created_incident["severity"],
                "title": created_incident["title"],
                "status": created_incident["status"],
                "priority": created_incident["priority"],
                "incident_type": created_incident["incident_type"]
            }
        }
    )

    return created_incident


async def update_incident_status(
    incident_id: str,
    status: str,
    db
):
    result = await db.incidents.update_one(
        {
            "_id": ObjectId(incident_id)
        },
        {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.modified_count == 0:
        return 0

    updated_incident = await db.incidents.find_one(
        {
            "_id": ObjectId(incident_id)
        }
    )

    updated_incident["_id"] = str(
        updated_incident["_id"]
    )

    await manager.broadcast(
        {
            "type": "incident_status_updated",
            "data": {
                "id": updated_incident["_id"],
                "status": updated_incident["status"],
                "severity": updated_incident["severity"],
                "event_type": updated_incident["event_type"]
            }
        }
    )

    return result.modified_count


async def add_analyst_note(
    incident_id: str,
    note: str,
    db
):
    result = await db.incidents.update_one(
        {
            "_id": ObjectId(incident_id)
        },
        {
            "$push": {
                "analyst_notes": note
            },
            "$set": {
                "updated_at": datetime.utcnow()
            }
        }
    )

    return result.modified_count