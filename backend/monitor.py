import logging
from os import error
import threading
from queue import Queue
from datetime import datetime, timedelta, timezone

from celery import Celery
from celery.events import EventReceiver
from sqlalchemy import Engine
from sqlmodel import Session, select

from .logger import get_logger
from .models.tasks import TaskInfo

# Just to make the monitoring log different from the default logger
COLORS = {
    logging.DEBUG: "\033[93m",  # Yellow
    logging.INFO: "\033[95m",  # Magenta
    logging.WARNING: "\033[93m",  # Yellow
    logging.ERROR: "\033[91m",  # Red
    logging.CRITICAL: "\033[95m",  # Magenta
}

logger = get_logger(__name__, COLORS)

DB_QUEUE = Queue()


def write_to_db(engine):
    while True:
        event = DB_QUEUE.get()
        with Session(engine) as db_session:
            try:
                error = None
                logger.info(f"Writing event to DB: {event}")
                event_type = event["type"]
                if event_type == "task-received":
                    submitted_time = event["timestamp"]
                    utcoffset = event["utcoffset"]
                    tz = timezone(timedelta(hours=utcoffset))
                    submitted_time = datetime.fromtimestamp(submitted_time, tz=tz)
                    task = TaskInfo(
                        id=event["uuid"],
                        name=event["name"],
                        hostname=event["hostname"],
                        submitted_time=str(submitted_time),
                        status="PENDING",
                        args=event["args"],
                        kwargs=event["kwargs"],
                        retries=event["retries"],
                    )
                    db_session.add(task)
                    db_session.commit()
                elif event_type == "task-started":
                    statement = select(TaskInfo).where(TaskInfo.id == event["uuid"])
                    task = db_session.exec(statement).first()
                    logger.info(f"Task found in DB: {task}")
                    if task is None:
                        logger.error(f"Task {event['uuid']} not found in DB")
                        continue
                    task.status = "STARTED"
                    start_time = event["timestamp"]
                    utcoffset = event["utcoffset"]
                    tz = timezone(timedelta(hours=utcoffset))
                    start_time = datetime.fromtimestamp(start_time, tz=tz)
                    task.start_time = str(start_time)
                    db_session.add(task)
                    db_session.commit()
                elif event_type == "task-succeeded":
                    statement = select(TaskInfo).where(TaskInfo.id == event["uuid"])
                    task = db_session.exec(statement).first()
                    logger.info(f"Task found in DB: {task}")
                    if task is None:
                        logger.error(f"Task {event['uuid']} not found in DB")
                        continue
                    task.status = "SUCCEEDED"
                    task.result = str(event["result"])
                    end_time = event["timestamp"]
                    utcoffset = event["utcoffset"]
                    tz = timezone(timedelta(hours=utcoffset))
                    end_time = datetime.fromtimestamp(end_time, tz=tz)
                    task.end_time = str(end_time)
                    if event.get("runtime"):
                        task.runtime = event["runtime"]
                    else:
                        total = end_time - datetime.fromisoformat(task.start_time)
                        task.runtime = str(total.total_seconds())
                    db_session.add(task)

                elif event_type == "task-failed":
                    stmt = select(TaskInfo).where(TaskInfo.id == event["uuid"])
                    task = db_session.exec(stmt).first()
                    logger.info(f"Task found in DB: {task}")
                    if task is None:
                        logger.error(f"Task {event['uuid']} not found in DB")
                        continue
                    end_time = event["timestamp"]
                    utcoffset = event["utcoffset"]
                    tz = timezone(timedelta(hours=utcoffset))
                    end_time = datetime.fromtimestamp(end_time, tz=tz)
                    task.end_time = str(end_time)
                    task.status = "FAILED"
                    task.exception = str(event["exception"])
                    task.traceback = str(event["traceback"])
                    if event.get("runtime"):
                        task.runtime = event["runtime"]
                    else:
                        total = end_time - datetime.fromisoformat(task.start_time)
                        task.runtime = str(total.total_seconds())
                    db_session.add(task)
                elif event_type == "task-revoked":
                    stmt = select(TaskInfo).where(TaskInfo.id == event["uuid"])
                    task = db_session.exec(stmt).first()
                    logger.info(f"Task found in DB: {task}")
                    if task is None:
                        logger.error(f"Task {event['uuid']} not found in DB")
                        continue

                    end_time = event["timestamp"]
                    utcoffset = event["utcoffset"]
                    tz = timezone(timedelta(hours=utcoffset))
                    end_time = datetime.fromtimestamp(end_time, tz=tz)
                    task.end_time = str(end_time)
                    task.status = "REVOKED"
                    db_session.add(task)
                    db_session.commit()
                else:
                    logger.info(f"Unknown event type: <{event_type}> -> {event}")

                logger.info(f"Task {event['uuid']} added to DB")
            except Exception as e:
                error = e
                logger.error(f"Error writing to DB: {e}", exc_info=True)
                continue
            finally:
                DB_QUEUE.task_done()
                if error is not None:
                    db_session.rollback()
                else:
                    db_session.commit()


def handle_event(event):
    event_type = event["type"]
    if not event_type.startswith("task-"):
        logger.info(f"Ignoring event type: {event_type}")
        return
    logger.info(f"[{event_type}] Task event: {event}\n")
    DB_QUEUE.put(event)


def monitor_celery(celery_app: Celery, db_engine: Engine):
    logger.info("Starting celery event monitor in a separate thread")
    write_to_db_thread = threading.Thread(
        target=write_to_db, args=(db_engine,), daemon=True
    )
    write_to_db_thread.start()
    logger.info("Writing to DB thread started")
    with celery_app.connection() as connection:
        handler = EventReceiver(
            connection,
            app=celery_app,
            handlers={
                "*": handle_event,
            },
        )
        handler.capture(limit=None, timeout=None, wakeup=True)
