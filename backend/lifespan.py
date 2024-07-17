import asyncio
import threading
import time
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel

from .settings import settings
from celery import Celery
from .logger import get_logger
from .db_connection import create_async_db_connection
from .monitor import CeleryMonitor

logger = get_logger(__name__)

BASE_DIR = Path(__file__).resolve().parent
CELERY_APP = None
MONITORING_APP = None


def get_celery_app():
    global CELERY_APP
    if CELERY_APP is None:
        CELERY_APP = Celery(
            settings.APP_NAME,
            broker=settings.CELERY_BROKER_URL,
            backend=settings.CELERY_RESULT_BACKEND,
        )
        CELERY_APP.conf.timezone = "UTC"
    return CELERY_APP


def setup_celery_control(app: FastAPI) -> Celery:
    celery_app = get_celery_app()
    celery_app.conf.timezone = "UTC"
    control = celery_app.control
    inspect = celery_app.control.inspect()
    app.state.celery_app = celery_app
    app.state.celery_control = control
    app.state.celery_inspect = inspect
    ping = inspect.ping()
    if ping is None:
        raise RuntimeError("Could not ping the celery broker")

    logger.info(f"successfully connected to celery broker: {ping}")
    return celery_app


# def setup_monitoring(celery_app: Celery = None):
#     global MONITORING_APP
#     if MONITORING_APP is None:
#         MONITORING_APP = CeleryMonitor(celery_app)
#     return MONITORING_APP


# def start_sqlite_db():
#     logger.info("Starting SQLite DB")
#     engine = create_db_connection(settings.DB_URL)

#     from .models.tasks import TaskInfo  # noqa

#     # load all the models
#     SQLModel.metadata.create_all(engine)
#     logger.info("DB models loaded and created")
#     return engine


async def get_db_engine():
    logger.info("Starting SQLite DB")
    engine = await create_async_db_connection(settings.DB_URL)

    from .models.tasks import TaskInfo  # noqa

    # load all the models
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    logger.info("DB models loaded and created")
    return engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    global MONITORING_APP
    start_time = time.perf_counter()
    logger.info("Lifespan is starting...")
    celery_app = setup_celery_control(app)
    db_engine = await get_db_engine()
    app.state.db_engine = db_engine
    monitor_celery = CeleryMonitor(celery_app, settings.DB_SYNC_URL)
    monitor_celery.start()
    app.state.monitor_celery = monitor_celery
    MONITORING_APP = monitor_celery
    # start monitoring celery
    # monitor_thread = threading.Thread(
    #     target=monitor_celery, args=(celery_app, db_engine), daemon=True
    # )
    # monitor_thread.start()

    logger.info("Lifespan start-up complete!")
    logger.info(f"Lifespan startup time: {time.perf_counter() - start_time:0.2f}sec")
    yield
    logger.info("Lifespan is stopping...")
    monitor_celery.stop()
    logger.info("Lifespan shutdown complete!")
