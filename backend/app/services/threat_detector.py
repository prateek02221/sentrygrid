from datetime import datetime, timedelta

from app.services.ioc_matcher import (
    check_ioc_match
)

# How far back to look when counting repeated attempts from the same source.
BRUTE_FORCE_WINDOW_MINUTES = 15


async def evaluate_threat(
    event_type: str,
    source: str,
    db
):

    # Scope the count to the same source IP within a recent time window,
    # so escalation reflects "this IP is currently misbehaving" rather
    # than "this event type has ever happened before, from anyone."
    window_start = datetime.utcnow() - timedelta(
        minutes=BRUTE_FORCE_WINDOW_MINUTES
    )

    count = await db.threat_logs.count_documents(
        {
            "event_type": event_type,
            "ip_address": source,
            "created_at": {"$gte": window_start}
        }
    )

    if event_type == "failed_login":

        result = None

        if count >= 8:
            result = {
                "risk_score": 90,
                "severity": "critical",
                "rule_name": "FAILED_LOGIN_CRITICAL"
            }

        elif count >= 4:
            result = {
                "risk_score": 70,
                "severity": "high",
                "rule_name": "FAILED_LOGIN_ESCALATED"
            }

        else:
            result = {
                "risk_score": 40,
                "severity": "medium",
                "rule_name": "FAILED_LOGIN_THRESHOLD"
            }

    else:

        rules = {
            "unknown_location": {
                "risk_score": 60,
                "severity": "high",
                "rule_name": "UNKNOWN_LOCATION_LOGIN"
            },

            "suspicious_ip": {
                "risk_score": 70,
                "severity": "high",
                "rule_name": "SUSPICIOUS_IP_ACTIVITY"
            },

            "brute_force": {
                "risk_score": 80,
                "severity": "critical",
                "rule_name": "BRUTE_FORCE_ATTACK"
            },

            "traffic_spike": {
                "risk_score": 85,
                "severity": "critical",
                "rule_name": "TRAFFIC_SPIKE_DETECTED"
            },

            "unauthorized_access": {
                "risk_score": 90,
                "severity": "critical",
                "rule_name": "UNAUTHORIZED_ACCESS"
            }
        }

        result = rules.get(
            event_type,
            {
                "risk_score": 10,
                "severity": "low",
                "rule_name": "UNKNOWN_RULE"
            }
        )

    result.update({
        "detection_engine": "rule_based_v2",
        "detection_status": "confirmed",
        "ioc_match": False
    })

    ioc_result = await check_ioc_match(source)

    if ioc_result and ioc_result["matched"]:

        result["ioc_match"] = True
        result["ioc_threat_level"] = (
            ioc_result["threat_level"]
        )
        result["ioc_description"] = (
            ioc_result["description"]
        )

        result["risk_score"] += 30

        if result["risk_score"] > 100:
            result["risk_score"] = 100

    return result