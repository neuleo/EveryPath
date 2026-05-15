from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class Polygon(Base):
    __tablename__ = "polygons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    # WKT representation of the polygon for SpatiaLite
    # Note: In a real project with GeoAlchemy2 it would be simpler, 
    # but we are using raw SpatiaLite via SQLAlchemy
    geom_wkt = Column(String) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
