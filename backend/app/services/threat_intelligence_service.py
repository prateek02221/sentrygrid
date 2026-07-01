from app.core.database import get_database


async def get_threat_intelligence_summary():

    db = get_database()

    total_iocs = await db.iocs.count_documents({})

    total_threats = await db.threat_logs.count_documents({})

    ioc_matches = await db.threat_logs.count_documents(
        {
            "ioc_match": True
        }
    )

    critical_incidents = await db.incidents.count_documents(
        {
            "severity": "critical"
        }
    )

    match_rate = 0

    if total_threats > 0:
        match_rate = round(
            (ioc_matches / total_threats) * 100,
            2
        )

    return {
        "total_iocs": total_iocs,
        "total_threats": total_threats,
        "ioc_matches": ioc_matches,
        "critical_incidents": critical_incidents,
        "match_rate": match_rate
    }

async def get_top_malicious_ips():

    db = get_database()

    pipeline = [
        {
            "$match": {
                "ioc_match": True
            }
        },
        {
            "$group": {
                "_id": "$ip_address",
                "count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "count": -1
            }
        },
        {
            "$limit": 5
        }
    ]

    results = await db.threat_logs.aggregate(
        pipeline
    ).to_list(length=5)

    return [
        {
            "ip_address": item["_id"],
            "count": item["count"]
        }
        for item in results
    ]

async def get_threat_type_distribution():

    db = get_database()

    pipeline = [
        {
            "$group": {
                "_id": "$event_type",
                "count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "count": -1
            }
        }
    ]

    results = await db.threat_logs.aggregate(
        pipeline
    ).to_list(length=20)

    return [
        {
            "event_type": item["_id"],
            "count": item["count"]
        }
        for item in results
    ]