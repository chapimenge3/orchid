from typing import List
from fastapi import APIRouter, Request
from pydantic import BaseModel

from ..logger import get_logger

logger = get_logger(__name__)

worker_router = APIRouter()


# Register routes here
class Worker(BaseModel):
    name: str
    tasks: List[str] = []


@worker_router.get("/")
async def workers(request: Request) -> List[Worker]:
    workers = request.app.state.celery_inspect.registered_tasks()
    logger.info("Workers: %s", workers)
    resp = [Worker(name=k, tasks=v) for k, v in workers.items()]
    return resp
