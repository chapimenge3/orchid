import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List

from celery.exceptions import CeleryError
from fastapi import APIRouter, HTTPException, Request, WebSocket
from fastapi.websockets import WebSocketDisconnect
from pydantic import BaseModel

from ..logger import get_logger

logger = get_logger(__name__)

worker_router = APIRouter()


# Register routes here
class Worker(BaseModel):
    name: str
    tasks: List[str] = []


class PoolStatResponse(BaseModel):
    implementation: str = None
    max_concurrency: int = None
    pool_size: int = None
    processes: List[int] = None
    max_tasks_per_child: int = None
    put_guarded_by_semaphore: bool = None
    timeout: List[int] = None
    write: Dict[str, Any] = None


class BrokerStatResponse(BaseModel):
    hostname: str
    userid: str | None
    virtual_host: str | None
    port: int | None
    insist: bool | None
    ssl: bool | None
    transport: str | None
    connect_timeout: int | None
    transport_options: Dict[str, Any] | None
    login_method: str | None | None
    uri_prefix: str | None
    heartbeat: float | None
    failover_strategy: str | None
    alternates: List[str] | None


class RusageResponse(BaseModel):
    utime: float | None
    stime: float | None
    maxrss: int | None
    ixrss: int | None
    idrss: int | None
    isrss: int | None
    minflt: int | None
    majflt: int | None
    nswap: int | None
    inblock: int | None
    oublock: int | None
    msgsnd: int | None
    msgrcv: int | None
    nsignals: int | None
    nvcsw: int | None


class WorkerStatResponse(BaseModel):
    name: str
    tasks: List[str]
    total: Dict[str, int]
    pid: int
    clock: str
    pool: PoolStatResponse
    broker: BrokerStatResponse
    rusage: RusageResponse
    prefetch_count: int
    report: Dict[str, Any]
    memdump: str


class WorkerActionRequest(BaseModel):
    action: str
    worker: str = None
    args: List[Any] = []
    kwargs: Dict[str, Any] = {}


@worker_router.get("/")
async def workers(request: Request) -> List[WorkerStatResponse]:
    inspect = request.app.state.celery_inspect

    async def fetch_worker_data():
        process = {
            "tasks": inspect.registered_tasks,
            "stats": inspect.stats,
            "report": inspect.report,
            "memdump": inspect.memdump,
        }
        with ThreadPoolExecutor(max_workers=len(process)) as executor:
            futures = {executor.submit(val): key for key, val in process.items()}

            results = {}
            for future in as_completed(futures):
                key = futures[future]
                try:
                    results[key] = future.result()
                except CeleryError as e:
                    logger.error(f"Celery error while fetching {key}: {e}")
                    raise HTTPException(
                        status_code=503, detail=f"Celery service unavailable: {str(e)}"
                    )
                except Exception as e:
                    logger.error(
                        f"Unexpected error while fetching {key}: {e}", exc_info=True
                    )
                    raise HTTPException(
                        status_code=500,
                        detail=f"Internal server error while fetching {key}",
                    )

            return results

    try:
        data = await fetch_worker_data()
        tasks = data["tasks"]
        stats = data["stats"]
        report = data["report"]
        memdump = data["memdump"]

        if not tasks or not stats:
            raise HTTPException(status_code=404, detail="No worker data available")

        response = []
        for hostname in set(tasks.keys()) | set(stats.keys()) | set(report.keys()):
            worker_tasks = tasks.get(hostname, [])
            worker_stats = stats.get(hostname, {})
            worker_report = report.get(hostname, {})
            memdump = memdump.get(hostname, {})
            logger.info(f"Fetched worker data for {hostname}")
            logger.info(f"Worker tasks: {worker_tasks}")
            logger.info(f"Worker stats: {worker_stats}")
            logger.info(f"Worker report: {worker_report}")
            response.append(
                WorkerStatResponse(
                    **worker_stats,
                    name=hostname,
                    tasks=worker_tasks,
                    report=worker_report,
                    memdump=memdump,
                )
            )

        logger.info(f"Successfully fetched data for {len(response)} workers")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in workers endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@worker_router.post("/action")
async def worker_action(body: WorkerActionRequest, request: Request):
    try:
        action = body.action
        worker = body.worker
        logger.debug("Action: %s", action)
        logger.debug("Worker: %s", worker)
        inspect = request.app.state.celery_inspect
        control = request.app.state.celery_control
        if action == "purge":
            control.purge()
        elif action == "shutdown":
            control.shutdown()
        elif action == "pool_grow":
            inspect.pool_grow(*body.args, **body.kwargs)
        elif action == "pool_shrink":
            inspect.pool_shrink(*body.args, **body.kwargs)

        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error invoking worker action: {e}", exc_info=True)
        return HTTPException(status_code=500, detail="Internal server error")


@worker_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        from ..lifespan import MONITORING_APP as monitor  # noqa
        from queue import Queue  # noqa

        await websocket.accept()

        heart_beat = {}
        event_queue = Queue()
        monitor.register_event("worker-heartbeat", event_queue.put, 2)

        while True:
            try:
                if not event_queue.empty():
                    data = event_queue.get(block=False)
                    heart_beat[data["hostname"]] = data
                    await websocket.send_json(heart_beat)
                    event_queue.task_done()

                await asyncio.sleep(1)
            except WebSocketDisconnect:
                logger.info("Client disconnected")
                break
            except RuntimeError as e:
                logger.error(f"RuntimeError in /workers/ws: {e}")
                break
            except Exception as e:
                logger.error(f"Error in websocket endpoint: {e}", exc_info=True)

    except Exception as e:
        logger.error(f"Error in websocket endpoint: {e}")
