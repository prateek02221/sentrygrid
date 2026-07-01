from app.core.database import get_database


async def check_ioc_match(value: str):

    print(f"Checking IOC: {value}")

    db = get_database()

    ioc = await db.iocs.find_one({
        "value": value
    })

    print(f"IOC Found: {ioc is not None}")

    if ioc:
        return {
            "matched": True,
            "threat_level": ioc["threat_level"],
            "description": ioc.get(
                "description",
                ""
            )
        }

    return {
        "matched": False,
        "threat_level": None,
        "description": None
    }