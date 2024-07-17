from sqlalchemy import text
from sqlmodel import Session, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession


def create_db_connection(db_url: str, execute: bool = False):
    engine = create_engine(db_url, echo=True)
    # if the db is sqlite enable wal mode
    if db_url.startswith("sqlite") and execute:
        with Session(engine) as session:
            session.exec(text("PRAGMA journal_mode=WAL"))
    return engine


async def create_async_db_connection(db_url: str):
    engine = create_async_engine(db_url, echo=True)
    # if the db is sqlite enable wal mode
    if db_url.startswith("sqlite"):
        async with AsyncSession(engine) as session:
            await session.execute(text("PRAGMA journal_mode=WAL"))
            await session.commit()

    return engine
