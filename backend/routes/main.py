from fastapi import APIRouter

# API routers
from .worker import worker_router
from .tasks import tasks_router

api_router = APIRouter()

# Register API routers
api_router.include_router(worker_router, prefix="/workers", tags=["workers"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["tasks"])

@api_router.get("/health")
async def health():
    return {"status": "ok"}

