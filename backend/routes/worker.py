from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List

from celery.exceptions import CeleryError
from fastapi import APIRouter, HTTPException, Request
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
