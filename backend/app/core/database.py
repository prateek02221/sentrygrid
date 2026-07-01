from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
database = None


async def connect_to_mongo():
    global client, database

    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)

        database = client[settings.DATABASE_NAME]

        await client.admin.command("ping")

        print("MongoDB Connected Successfully")

    except Exception as e:
        print("MongoDB Connection Error:", e)


async def close_mongo_connection():
    global client

    if client:
        client.close()
        print("MongoDB Connection Closed")


async def check_database_health():
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False
def get_database():
    return database