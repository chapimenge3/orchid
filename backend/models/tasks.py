import datetime
from sqlmodel import Field, SQLModel, TEXT


def get_timestamp():
    return datetime.datetime.now().timestamp()


class TaskInfo(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    name: str
    hostname: str | None
    args: str | None
    kwargs: str | None
    submitted_time: str | None
    start_time: str | None
    end_time: str | None
    runtime: float | None
    result: str | None = Field(default=None, sa_column=TEXT)
    exception: str | None = Field(default=None, sa_column=TEXT)
    traceback: str | None = Field(default=None, sa_column=TEXT)
    status: str | None
    retries: int | None

    # default timestamps
    created_at: float = Field(default_factory=get_timestamp)
