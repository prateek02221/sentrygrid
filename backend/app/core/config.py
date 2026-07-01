from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool
    API_PREFIX: str

    MONGODB_URL: str = ""
    DATABASE_NAME: str

    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    ALLOWED_ORIGINS: str

    AUTO_THREAT_GENERATION_ENABLED: bool = True
    AUTO_THREAT_GENERATION_INTERVAL_HOURS: float = 2

    class Config:
        env_file = ".env"


settings = Settings()