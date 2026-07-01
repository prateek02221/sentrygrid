from datetime import datetime


def ioc_document(
    value: str,
    ioc_type: str,
    threat_level: str,
    description: str = None
):
    return {
        "value": value,
        "type": ioc_type,
        "threat_level": threat_level,
        "description": description,
        "created_at": datetime.utcnow()
    }