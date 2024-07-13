import time
from pathlib import Path
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel

from .settings import settings
from celery import Celery
from .logger import get_logger
from .db_connection import create_db_connection
from .monitor import monitor_celery

logger = get_logger(__name__)

BASE_DIR = Path(__file__).resolve().parent


def setup_celery_control(app: FastAPI):
    celery_app = Celery(
        settings.APP_NAME,
        broker=settings.CELERY_BROKER_URL,
        backend=settings.CELERY_RESULT_BACKEND,
    )
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


def start_sqlite_db():
    logger.info("Starting SQLite DB")
    engine = create_db_connection(settings.DB_URL)

    from .models.tasks import TaskInfo  # noqa

    # load all the models
    SQLModel.metadata.create_all(engine)
    logger.info("DB models loaded and created")
    return engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_time = time.perf_counter()
    logger.info("Lifespan is starting...")
    setup_celery_control(app)
    db_engine = start_sqlite_db()
    app.state.db_engine = db_engine
    # start monitoring celery
    monitor_thread = threading.Thread(
        target=monitor_celery, args=(app.state.celery_app, db_engine)
    )
    monitor_thread.start()
    logger.info("Lifespan start-up complete!")
    logger.info(f"Lifespan startup time: {time.perf_counter() - start_time:0.2f}sec")
    yield
    logger.info("Shutdown")
