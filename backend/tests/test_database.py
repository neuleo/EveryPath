import pytest
from sqlalchemy import text
from database import engine, DATABASE_URL
import os

def test_spatialite_version():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT spatialite_version()"))
        version = result.scalar()
        assert version is not None

def test_spatial_query():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT ST_AsText(ST_GeomFromText('POINT(1 1)', 4326))"))
        wkt = result.scalar()
        assert wkt == "POINT(1 1)"

def test_spatial_metadata_exists():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='spatial_ref_sys'"))
        assert result.scalar() == 1
