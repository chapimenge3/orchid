import pathlib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routes.main import api_router
from .lifespan import lifespan

project_description = """Project Orchid

FastAPI based API for monitoring celery workers, tasks and queues.
"""

app = FastAPI(
    title="Orchid",
    description=project_description,
    version="0.1.0",
    lifespan=lifespan,
    contact={
        "name": "Chapi Menge",
        "url": "https://github.com/chapimenge3",
        "email": "hey@chapimenge.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://github.com/chapimenge3/orchid/blob/main/LICENSE",
    },
    openapi_url="/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/redoc",
)

app.include_router(api_router, prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=pathlib.Path(__file__).parent / "static"), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
