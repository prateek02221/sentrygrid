import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings
from app.services.threat_pipeline import generate_and_process_threat

logger = logging.getLogger("scheduler")

scheduler = AsyncIOScheduler()


async def _run_auto_threat_generation():
    try:
        result = await generate_and_process_threat()
        logger.info(
            "Auto-generated threat %s",
            result["threat"]["_id"]
        )
    except Exception:
        # A single failed run should never crash the scheduler loop —
        # log it and let the next scheduled run try again.
        logger.exception("Auto threat generation failed")


def start_scheduler():
    if not settings.AUTO_THREAT_GENERATION_ENABLED:
        logger.info("Auto threat generation is disabled")
        return

    scheduler.add_job(
        _run_auto_threat_generation,
        trigger="interval",
        hours=settings.AUTO_THREAT_GENERATION_INTERVAL_HOURS,
        id="auto_threat_generation",
        replace_existing=True,
        max_instances=1
    )

    scheduler.start()

    logger.info(
        "Auto threat generation scheduled every %s hour(s)",
        settings.AUTO_THREAT_GENERATION_INTERVAL_HOURS
    )


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
