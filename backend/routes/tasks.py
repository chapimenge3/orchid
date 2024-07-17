from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, delete, func, select

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


class TaskInvokeRequest(BaseModel):
    task_name: str
    args: List[Any] = []
    kwargs: Dict[str, Any] = {}


class TaskStatResponse(BaseModel):
    success: int
    failure: int
    pending: int
    started: int
    latest_tasks: List[TaskInfo]


@tasks_router.get("/registered-tasks")
async def registered_tasks(request: Request) -> List[Task]:
    workers_details = request.app.state.celery_inspect.registered_tasks()
    logger.info("Workers details: %s", workers_details)
    resp = []
    for worker, tasks in workers_details.items():
        for task in tasks:
            resp.append(Task(name=task, worker=worker))

    return resp


@tasks_router.get("/filter")
async def filter_tasks() -> TaskFilterRequest:
    return TaskFilterRequest()


@tasks_router.get("/")
async def tasks(request: Request) -> TaskInfoResponse:
    try:
        # workers_details = request.app.state.celery_inspect.registered_tasks()
        status = request.query_params.get("status")
        sort_by = request.query_params.get("sort_by", "-end_time")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        task_name = request.query_params.get("task_name")

        sort_stmt = []

        try:
            if "&" in sort_by:
                sort_by = sort_by.split("&")
            else:
                sort_by = [sort_by]

            logger.debug("Requested sort_by: %s", sort_by)
            for field in sort_by:
                try:
                    if field.startswith("-"):
                        sort_stmt.append(getattr(TaskInfo, field[1:]).desc())
                    else:
                        sort_stmt.append(getattr(TaskInfo, field))
                except AttributeError as e:
                    logger.error(f"Error sorting by field: {field}", exc_info=True)
                    pass

        except AttributeError:
            sort_by = Task.end_time.desc()
            sort_stmt.append(sort_by)

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
            if task_name:
                stmt = stmt.where(TaskInfo.task_name == task_name)
            # stmt = stmt.order_by(sort_by)
            if sort_stmt:
                stmt = stmt.order_by(*sort_stmt)
            stmt = stmt.offset((page - 1) * page_size)
            stmt = stmt.limit(page_size)
            tasks_info = session.exec(stmt).all()
            logger.debug("Found %s number of tasks", len(tasks_info))
            total = session.exec(select(func.count("*")).select_from(TaskInfo)).first()

            return TaskInfoResponse(
                tasks=tasks_info,
                count=len(tasks_info),
                total=total,
                total_pages=total // page_size + 1,
            )
    except Exception as e:
        logger.error(f"Error fetching tasks: {e}", exc_info=True)
        return HTTPException(status_code=500, detail="Internal server error")


@tasks_router.get("/stats")
async def stats(request: Request):
    try:
        with Session(request.app.state.db_engine) as session:
            stmt = select(TaskInfo)
            tasks_info = session.exec(stmt).all()
            logger.debug("Tasks info: %s", tasks_info)
            stmt = select(
                TaskInfo.status, func.count(TaskInfo.id).label("count")
            ).group_by(TaskInfo.status)
            result = session.exec(stmt).all()
            logger.debug("Task stats: %s", result)
            result_dict = {row.status: row.count for row in result}
            success = result_dict.get("SUCCEEDED", 0)
            failure = result_dict.get("FAILED", 0)
            pending = result_dict.get("PENDING", 0)
            started = result_dict.get("STARTED", 0)
            latest_tasks = session.exec(
                select(TaskInfo).order_by(TaskInfo.created_at.desc()).limit(5)
            ).all()

            return TaskStatResponse(
                success=success,
                failure=failure,
                pending=pending,
                started=started,
                latest_tasks=latest_tasks,
            )

    except Exception as e:
        logger.error(f"Error fetching tasks stats: {e}", exc_info=True)
        return HTTPException(status_code=500, detail="Internal server error")


@tasks_router.get("/{task_id}")
async def get_task(request: Request, task_id: str) -> TaskInfo:
    try:
        with Session(request.app.state.db_engine) as session:
            task_info = session.exec(
                select(TaskInfo).where(TaskInfo.id == task_id)
            ).first()
            logger.debug("Task info: %s", task_info)
            if not task_info:
                raise HTTPException(status_code=404, detail="Task not found")

            return task_info
    except Exception as e:
        logger.error(f"Error fetching task: {e}", exc_info=True)
        return HTTPException(status_code=500, detail="Internal server error")


@tasks_router.delete("/{task_id}")
async def delete_task(task_id: str, request: Request):
    try:
        with Session(request.app.state.db_engine) as session:
            delete_stmt = delete(TaskInfo).where(TaskInfo.id == task_id)
            res = session.exec(delete_stmt)
            logger.debug("Available methods of res object: %s", dir(res))
            logger.debug("Deleted task: %s", res.rowcount)
            if res.rowcount == 0:
                return HTTPException(status_code=404, detail="Task not found")
            session.commit()

        return {
            "status": "ok",
            "message": f"Task {task_id} deleted successfully",
        }
    except Exception as e:
        logger.error(f"Error revoking task: {e}", exc_info=True)
        return HTTPException(status_code=500, detail="Internal server error")


@tasks_router.post("/invoke")
async def invoke_task(body: TaskInvokeRequest, request: Request):
    try:
        celery_app = request.app.state.celery_app
        task_name = body.task_name
        logger.debug("Invoking task: %s", task_name)
        logger.debug("Task body: %s", body)
        result = celery_app.send_task(task_name, args=body.args, kwargs=body.kwargs)
        logger.debug("Task result: %s", result)
        return {"task_id": result.task_id}
    except Exception as e:
        logger.error(f"Error invoking task: {e}", exc_info=True)
        return HTTPException(status_code=500, detail="Internal server error")


@tasks_router.post("/{task_id}/revoke")
async def revoke_task(task_id: str, request: Request):
    try:
        celery_app = request.app.state.celery_app
        result = celery_app.control.revoke(task_id, terminate=True)
        logger.debug("Task result: %s", result)
        return {"task_id": task_id}
    except Exception as e:
        logger.error(f"Error revoking task: {e}", exc_info=True)
        return HTTPException(status_code=500, detail="Internal server error")
