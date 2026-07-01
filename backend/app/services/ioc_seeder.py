from app.core.database import get_database

IOC_IPS = [
    {"value": f"185.220.101.{i}", "type": "ip", "threat_level": "critical",
     "description": "Known malicious infrastructure"}
    for i in range(1, 51)
]

IOC_DOMAINS = [
    {
        "value": f"malicious-domain-{i}.com",
        "type": "domain",
        "threat_level": "high",
        "description": "Phishing infrastructure"
    }
    for i in range(1, 21)
]

IOC_HASHES = [
    {
        "value": f"malwarehash{i:03}",
        "type": "hash",
        "threat_level": "critical",
        "description": "Known malware sample"
    }
    for i in range(1, 11)
]

async def seed_iocs():
    print("IOC Seeder Started")

    db = get_database()

    existing = await db.iocs.count_documents({})
    if existing >= 80:
        print("IOC records already seeded")
        return

    data = []

    data.extend(IOC_IPS)
    data.extend(IOC_DOMAINS)
    data.extend(IOC_HASHES)

    await db.iocs.insert_many(data)

    print(
        f"[IOC Seeder] Loaded {len(data)} IOC records"
    )