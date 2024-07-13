import asyncio
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Request
from pydantic import BaseModel
from sqlmodel import select, Session, func

from ..logger import get_logger
from ..models.tasks import TaskInfo

logger = get_logger(__name__)

tasks_router = APIRouter()


class Task(BaseModel):
    name: str
    worker: str


class TaskInfoResponse(BaseModel):
    tasks: List[TaskInfo]
    count: int
    total: int
    total_pages: int


class TaskFilterRequest(BaseModel):
    status: List[str] = [
        "PENDING",
        "STARTED",
        "SUCCEEDED",
        "FAILED",
    ]
    sort_by: List[str] = list(TaskInfo.__fields__.keys())
    sort_order: List[str] = [
        "asc",
        "desc",
    ]
    page: int = 1
    per_page: int = 10


@tasks_router.get("/registered-tasks")
async def registered_tasks(request: Request) -> List[Task]:
    workers_details = request.app.state.celery_inspect.registered_tasks()
    logger.info("Workers details: %s", workers_details)
    resp = []
    for worker, tasks in workers_details.items():
        for task in tasks:
            resp.append(Task(name=task, worker=worker))

    return resp


@tasks_router.get("/")
async def tasks(request: Request) -> TaskInfoResponse:
    # workers_details = request.app.state.celery_inspect.registered_tasks()
    status = request.query_params.get("status")
    sort_by = request.query_params.get("sort_by", "created_at")
    sort_order = request.query_params.get("sort_order", "desc")
    page = int(request.query_params.get("page", 1))
    per_page = int(request.query_params.get("per_page", 10))

    try:
        sort_by = getattr(TaskInfo, sort_by)
        if sort_order == "desc":
            sort_by = -sort_by
    except AttributeError:
        sort_by = -TaskInfo.created_at

    logger.debug("Workers details: %s", status)
    logger.debug("Request query params: %s", request.query_params)

    if isinstance(status, str):
        status = [status.upper()]

    methods = ["registered", "active", "reserved", "scheduled"]
    if status:
        logger.debug("Filtering Requested status: %s", status)
        methods = [method for method in methods if method in status]

    logger.debug("Requested status: %s", methods)
    with Session(request.app.state.db_engine) as session:
        stmt = select(TaskInfo)
        if status:
            stmt = stmt.where(TaskInfo.status.in_(status))
        stmt = stmt.order_by(sort_by)
        stmt = stmt.offset((page - 1) * per_page)
        stmt = stmt.limit(per_page)
        tasks_info = session.exec(stmt).all()
        logger.debug("Found %s number of tasks", len(tasks_info))
        total = session.exec(select(func.count("*")).select_from(TaskInfo)).first()

    return TaskInfoResponse(
        tasks=tasks_info,
        count=len(tasks_info),
        total=total,
        total_pages=total // per_page + 1,
    )


@tasks_router.get("/filter")
async def filter_tasks(request: Request) -> TaskFilterRequest:
    return TaskFilterRequest()
