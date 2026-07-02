from fastapi import APIRouter, Depends
from app.core.database import get_database
from bson import ObjectId
from datetime import datetime
from app.schemas.incident_schema import IncidentStatusUpdate
from app.schemas.incident_schema import IncidentNoteRequest
from app.auth.role_checker import RoleChecker

from app.services.incident_service import (
    update_incident_status,
    add_analyst_note)

router = APIRouter()

all_roles = RoleChecker(["admin", "security_analyst", "viewer"])
analyst_or_admin = RoleChecker(["admin", "security_analyst"])


@router.get("")
@router.get("/")
async def get_all_incidents(current_user=Depends(all_roles)):
    db = get_database()
    incidents = await db.incidents.find().sort("created_at", -1).to_list(100)
    result = []
    for incident in incidents:
        incident["_id"] = str(incident["_id"])
        result.append(incident)

    return result

@router.put("/{incident_id}/status")
async def change_incident_status(
    incident_id: str,
    status_update: IncidentStatusUpdate,
    current_user=Depends(analyst_or_admin)):
    db = get_database()

    valid_statuses = [
        "open",
        "investigating",
        "resolved",
        "closed"]

    if status_update.status not in valid_statuses:
        return {
            "error": "Invalid status"}

    result = await db.incidents.update_one(
        {"_id": ObjectId(incident_id)},
        {
            "$set": {
                "status": status_update.status,
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.modified_count == 0:
        return {
            "message": "No incident updated"}

    updated_incident = await db.incidents.find_one(
        {"_id": ObjectId(incident_id)})

    updated_incident["_id"] = str(
        updated_incident["_id"])

    return {
        "message": "Incident updated successfully",
        "incident": updated_incident
    }
@router.put("/{incident_id}/add-note")
async def add_note(
    incident_id: str,
    request: IncidentNoteRequest,
    current_user=Depends(analyst_or_admin)
):
    db = get_database()

    updated = await add_analyst_note(
        incident_id,
        request.note,
        db
    )

    if not updated:
        return {
            "message": "Incident not found"
        }

    return {
        "message": "Note added successfully"
    }
@router.put("/{incident_id}/resolve")
async def resolve_incident(
    incident_id: str,
    current_user=Depends(analyst_or_admin)
):
    db = get_database()

    updated = await update_incident_status(
        incident_id,
        "resolved",
        db
    )

    if not updated:
        return {
            "message": "Incident not found"
        }

    return {
        "message": "Incident resolved successfully"
    }