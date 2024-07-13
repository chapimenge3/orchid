from sqlalchemy import text
from sqlmodel import Session, create_engine


def create_db_connection(db_url: str):
    engine = create_engine(db_url, echo=True)
    # if the db is sqlite enable wal mode
    if db_url.startswith("sqlite"):
        with Session(engine) as session:
            session.exec(text("PRAGMA journal_mode=WAL"))
    return engine
