from datetime import datetime
from app.schemas.user_schema import UserRole


def user_document(
    name: str,
    email: str,
    hashed_password: str,
    role: UserRole = UserRole.VIEWER
):
    return {
        "name": name,
        "email": email.lower(),
        "password": hashed_password,
        "role": role.value,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login": None
    }