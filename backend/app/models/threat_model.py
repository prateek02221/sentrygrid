from datetime import datetime


def threat_document(
    event_type: str,
    ip_address: str,
    country: str,
    risk_score: int,
    severity: str,
    description: str,
    detection_rule: str,
    detection_engine: str,
    detection_status: str,
    ioc_match: bool = False,
    ioc_threat_level: str = None,
    ioc_description: str = None
):
    return {
        "event_type": event_type,
        "ip_address": ip_address,
        "country": country,
        "risk_score": risk_score,
        "severity": severity,

        "detection_rule": detection_rule,
        "detection_engine": detection_engine,
        "detection_status": detection_status,

        "ioc_match": ioc_match,
        "ioc_threat_level": ioc_threat_level,
        "ioc_description": ioc_description,

        "description": description,
        "status": "detected",
        "created_at": datetime.utcnow()
    }