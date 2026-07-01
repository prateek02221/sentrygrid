from bson import ObjectId
from app.core.database import get_database
from app.models.ioc_model import ioc_document


async def create_ioc_service(data):
    db = get_database()

    ioc = ioc_document(
        value=data.value,
        ioc_type=data.type,
        threat_level=data.threat_level,
        description=data.description
    )

    result = await db.iocs.insert_one(ioc)

    return {
        "message": "IOC created",
        "id": str(result.inserted_id)
    }


async def get_all_iocs_service():
    db = get_database()

    iocs = []

    async for item in db.iocs.find():
        item["id"] = str(item["_id"])
        del item["_id"]
        iocs.append(item)

    return iocs