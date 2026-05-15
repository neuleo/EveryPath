from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////data/everypath.sqlite")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

def load_spatialite(dbapi_conn, connection_record):
    dbapi_conn.enable_load_extension(True)
    # Common paths for SpatiaLite on Debian/Ubuntu
    paths = [
        "/usr/lib/x86_64-linux-gnu/mod_spatialite.so",
        "/usr/lib/x86_64-linux-gnu/mod_spatialite",
        "mod_spatialite"
    ]
    for path in paths:
        try:
            dbapi_conn.load_extension(path)
            return
        except Exception:
            continue
    # If we reach here, we couldn't load the extension
    raise RuntimeError(
        "Could not load SpatiaLite extension. tried paths: " + ", ".join(paths)
    )

event.listen(engine, "connect", load_spatialite)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
