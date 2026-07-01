from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routes.auth_routes import router as auth_router
from app.routes.threat_routes import router as threat_router
from app.routes.incident_routes import router as incident_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.user_routes import router as user_router
from app.websocket.websocket_routes import router as websocket_router
from app.routes.ioc_routes import (router as ioc_router)
from app.services.ioc_seeder import seed_iocs
from app.routes.threat_intelligence_routes import (
    router as threat_intelligence_router
)

from app.core.config import settings

from app.core.database import (
    connect_to_mongo,
    close_mongo_connection,
    check_database_health
)

from app.core.scheduler import start_scheduler, stop_scheduler

import logging
logging.basicConfig(
       level=logging.INFO,
       format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
   )

@asynccontextmanager
async def lifespan(app: FastAPI):

    await connect_to_mongo()

    await seed_iocs()

    start_scheduler()

    yield

    stop_scheduler()

    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.ALLOWED_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix=settings.API_PREFIX
)

app.include_router(
    threat_router,
    prefix=settings.API_PREFIX
)

app.include_router(
    incident_router,
    prefix="/api/v1/incidents",
    tags=["Incidents"]
)

app.include_router(
    dashboard_router,
    prefix="/api/v1/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    user_router,
    prefix="/api/v1"
)

app.include_router(
    websocket_router
)

app.include_router(
    ioc_router,
    prefix="/api/v1"
)

app.include_router(
    threat_intelligence_router,
    prefix="/api/v1"
)

@app.get("/health")
async def health_check():

    db_status = await check_database_health()

    return {
        "server": "healthy",
        "database": (
            "connected"
            if db_status
            else "disconnected"
        )
    }


# -------------------------------
# Serve the built frontend (if present)
# -------------------------------
# In production, the frontend's `dist/` build output is copied into
# app/static before the server starts (see deployment docs). When that
# folder exists, requests fall through to it after all API routes have
# had a chance to match, so client-side routes like /incidents still
# resolve to index.html on a hard refresh. If app/static doesn't exist
# (e.g. running the backend alone during local development), we keep a
# simple JSON status message at "/" instead.

STATIC_DIR = Path(__file__).resolve().parent / "static"


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


if STATIC_DIR.exists():
    app.mount(
        "/",
        SPAStaticFiles(directory=STATIC_DIR, html=True),
        name="frontend"
    )
else:
    @app.get("/")
    def root():
        return {
            "message": "Mini SOC Platform Backend Running",
            "version": settings.APP_VERSION,
            "status": "success"
        }
