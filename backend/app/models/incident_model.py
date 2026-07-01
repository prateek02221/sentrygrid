from datetime import datetime


def incident_document(
    threat_id: str,
    event_type: str,
    severity: str,
    title: str,
    description: str,
    priority: str = "P2",
    incident_type: str = "STANDARD_THREAT"
):
    return {
        "threat_id": threat_id,
        "event_type": event_type,
        "severity": severity,
        "title": title,
        "description": description,

        "priority": priority,
        "incident_type": incident_type,

        "status": "open",
        "analyst_notes": [],

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }