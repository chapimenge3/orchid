import logging
import threading
from datetime import datetime, timedelta, timezone
from queue import Queue

from celery.events import EventReceiver
from sqlmodel import Session, select

from .settings import settings

from .db_connection import create_db_connection
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

# DB_QUEUE = Queue()
# WORKER_BEAT = Queue(maxsize=10)


# def write_to_db(engine):
#     while True:
#         event = DB_QUEUE.get()
#         with Session(engine) as db_session:
#             try:
#                 error = None
#                 logger.info(f"Writing event to DB: {event}")
#                 event_type = event["type"]
#                 if event_type == "task-received":
#                     submitted_time = event["timestamp"]
#                     utcoffset = event["utcoffset"]
#                     tz = timezone(timedelta(hours=utcoffset))
#                     submitted_time = datetime.fromtimestamp(submitted_time, tz=tz)
#                     task = TaskInfo(
#                         id=event["uuid"],
#                         name=event["name"],
#                         hostname=event["hostname"],
#                         submitted_time=str(submitted_time),
#                         status="PENDING",
#                         args=event["args"],
#                         kwargs=event["kwargs"],
#                         retries=event["retries"],
#                     )
#                     db_session.add(task)
#                     db_session.commit()
#                 elif event_type == "task-started":
#                     statement = select(TaskInfo).where(TaskInfo.id == event["uuid"])
#                     task = db_session.exec(statement).first()
#                     logger.info(f"Task found in DB: {task}")
#                     if task is None:
#                         logger.error(f"Task {event['uuid']} not found in DB")
#                         continue
#                     task.status = "STARTED"
#                     start_time = event["timestamp"]
#                     utcoffset = event["utcoffset"]
#                     tz = timezone(timedelta(hours=utcoffset))
#                     start_time = datetime.fromtimestamp(start_time, tz=tz)
#                     task.start_time = str(start_time)
#                     db_session.add(task)
#                     db_session.commit()
#                 elif event_type == "task-succeeded":
#                     statement = select(TaskInfo).where(TaskInfo.id == event["uuid"])
#                     task = db_session.exec(statement).first()
#                     logger.info(f"Task found in DB: {task}")
#                     if task is None:
#                         logger.error(f"Task {event['uuid']} not found in DB")
#                         continue
#                     task.status = "SUCCEEDED"
#                     task.result = str(event["result"])
#                     end_time = event["timestamp"]
#                     utcoffset = event["utcoffset"]
#                     tz = timezone(timedelta(hours=utcoffset))
#                     end_time = datetime.fromtimestamp(end_time, tz=tz)
#                     task.end_time = str(end_time)
#                     if event.get("runtime"):
#                         task.runtime = event["runtime"]
#                     else:
#                         total = end_time - datetime.fromisoformat(task.start_time)
#                         task.runtime = str(total.total_seconds())
#                     db_session.add(task)

#                 elif event_type == "task-failed":
#                     stmt = select(TaskInfo).where(TaskInfo.id == event["uuid"])
#                     task = db_session.exec(stmt).first()
#                     logger.info(f"Task found in DB: {task}")
#                     if task is None:
#                         logger.error(f"Task {event['uuid']} not found in DB")
#                         continue
#                     end_time = event["timestamp"]
#                     utcoffset = event["utcoffset"]
#                     tz = timezone(timedelta(hours=utcoffset))
#                     end_time = datetime.fromtimestamp(end_time, tz=tz)
#                     task.end_time = str(end_time)
#                     task.status = "FAILED"
#                     task.exception = str(event["exception"])
#                     task.traceback = str(event["traceback"])
#                     if event.get("runtime"):
#                         task.runtime = event["runtime"]
#                     else:
#                         total = end_time - datetime.fromisoformat(task.start_time)
#                         task.runtime = str(total.total_seconds())
#                     db_session.add(task)
#                 elif event_type == "task-revoked":
#                     stmt = select(TaskInfo).where(TaskInfo.id == event["uuid"])
#                     task = db_session.exec(stmt).first()
#                     logger.info(f"Task found in DB: {task}")
#                     if task is None:
#                         logger.error(f"Task {event['uuid']} not found in DB")
#                         continue

#                     end_time = event["timestamp"]
#                     utcoffset = event["utcoffset"]
#                     tz = timezone(timedelta(hours=utcoffset))
#                     end_time = datetime.fromtimestamp(end_time, tz=tz)
#                     task.end_time = str(end_time)
#                     task.status = "REVOKED"
#                     db_session.add(task)
#                     db_session.commit()
#                 else:
#                     logger.info(f"Unknown event type: <{event_type}> -> {event}")

#                 logger.info(f"Task {event['uuid']} added to DB")
#             except Exception as e:
#                 error = e
#                 logger.error(f"Error writing to DB: {e}", exc_info=True)
#                 continue
#             finally:
#                 DB_QUEUE.task_done()
#                 if error is not None:
#                     db_session.rollback()
#                 else:
#                     db_session.commit()


# def handle_event(event):
#     event_type = event["type"]
#     if not event_type.startswith("task-"):
#         logger.info(f"Ignoring event type: {event_type}")
#         if event_type == "worker-heartbeat":
#             WORKER_BEAT.put(event)
#             if WORKER_BEAT.full():
#                 WORKER_BEAT.get()
#             # logger.info(f"Worker heartbeat: {event}")
#         return
#     # logger.info(f"[{event_type}] Task event: {event}\n")
#     DB_QUEUE.put(event)


# def monitor_celery(celery_app: Celery, db_engine):
#     logger.info("Starting celery event monitor in a separate thread")
#     write_to_db_thread = threading.Thread(
#         target=write_to_db, args=(db_engine,), daemon=True
#     )
#     write_to_db_thread.start()
#     logger.info("Writing to DB thread started")
#     with celery_app.connection() as connection:
#         handler = EventReceiver(
#             connection,
#             app=celery_app,
#             handlers={
#                 "*": handle_event,
#             },
#         )
#         handler.capture(limit=None, timeout=None, wakeup=True)


class CeleryMonitor:
    def __init__(self, celery_app, db_engine=None):
        self.celery_app = celery_app
        if db_engine is None:
            db_engine = settings.DB_SYNC_URL
        if isinstance(db_engine, str):
            self.db_engine = create_db_connection(db_engine)
        else:
            self.db_engine = db_engine
        self.worker_beats = {}
        self.queue = Queue()
        self._monitor_thread = threading.Thread(target=self.monitor, daemon=True)
        self._writer_thread = threading.Thread(target=self.write_to_db, daemon=True)
        self.stop_event = threading.Event()
        self._handler = None
        self.event_handler = {}
        self.event_handler_error_threshold = 10

        logger.debug("Celery monitor initialized")

    def write_to_db(self):
        while True:
            if self.stop_event.is_set():
                break
            event = self.queue.get()
            with Session(self.db_engine) as db_session:
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
                    self.queue.task_done()
                    if error is not None:
                        db_session.rollback()
                    else:
                        db_session.commit()

    def start(self):
        self._writer_thread.start()
        self._monitor_thread.start()
        logger.info("Celery monitor started")

    def monitor(self):
        logger.info("Starting Celery monitor!")
        with self.celery_app.connection() as connection:
            self._handler = EventReceiver(
                connection,
                app=self.celery_app,
                handlers={
                    "*": self.handle_event,
                },
            )
            self._handler.capture(limit=None, timeout=None, wakeup=True)
        logger.info("Celery monitor stopped")

    def handle_event(self, event):
        event_type = event["type"]
        if not event_type.startswith("task-"):
            # logger.info(f"Ignoring event type: {event_type}")
            registered_handlers = self.event_handler.get(event_type, [])
            for index, handler in enumerate(registered_handlers):
                try:
                    handler["method"](event)
                except Exception as e:
                    logger.error(f"Error handling event: {e},")
                    handler["error_rate"] += 1
                    max_threshold = handler.get(
                        "threshold", self.event_handler_error_threshold
                    )
                    if handler["error_rate"] >= max_threshold:
                        _registered_event_list = self.event_handler[event_type]
                        _registered_event_list.pop(index)
            return
        logger.info(f"[{event_type}] Task event: {event}\n")
        self.queue.put(event)
        return event

    def stop(self):
        logger.info("Stopping Celery monitor")
        if self._handler:
            self._handler.should_stop = True
        self.stop_event.set()
        logger.info("Celery monitor stopped")
        return True

    def register_event(self, event_name, method, threshold=10):
        data = {"method": method, "error_rate": 0}
        if threshold != self.event_handler_error_threshold:
            data["threshold"] = threshold

        if event_name not in self.event_handler:
            self.event_handler[event_name] = []

        self.event_handler[event_name].append(data)
