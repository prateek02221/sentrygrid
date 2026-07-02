from bson import ObjectId

from fastapi import (
    HTTPException
)

from app.core.database import (
    get_database
)

from app.schemas.user_schema import (
    UserRole
)


async def get_all_users_service():

    db = get_database()

    users = []

    async for user in db.users.find():

        users.append(
            {
                "id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "role": user.get("role", "viewer"),
                "is_active": user.get("is_active", True),
                "created_at": user.get("created_at"),
                "last_login": user.get(
                    "last_login"
                )
            }
        )

    return users


async def get_user_by_id_service(
    user_id: str
):

    db = get_database()

    user = await db.users.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "viewer"),
        "is_active": user.get("is_active", True),
        "created_at": user.get("created_at"),
        "last_login": user.get(
            "last_login"
        )
    }


async def update_user_role_service(
    user_id: str,
    role: UserRole
):

    db = get_database()

    user = await db.users.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    await db.users.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": {
                "role": role.value
            }
        }
    )

    return {
        "message":
        f"Role updated to {role.value}"
    }


async def update_user_status_service(
    user_id: str,
    is_active: bool
):

    db = get_database()

    user = await db.users.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    await db.users.update_one(
        {
            "_id": ObjectId(user_id)
        },
        {
            "$set": {
                "is_active": is_active
            }
        }
    )

    return {
        "message":
        f"User status updated to {is_active}"
    }


async def delete_user_service(
    user_id: str
):

    db = get_database()

    user = await db.users.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    await db.users.delete_one(
        {
            "_id": ObjectId(user_id)
        }
    )

    return {
        "message":
        "User deleted successfully"
    }