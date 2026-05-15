from database import engine, Base
from sqlalchemy import text
import models # Ensure models are registered
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing database...")
    
    # Initialize SpatiaLite metadata
    with engine.connect() as conn:
        try:
            # Check if spatial_ref_sys already exists
            result = conn.execute(text("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='spatial_ref_sys'"))
            exists = result.scalar()
            
            if not exists:
                logger.info("Initializing SpatiaLite metadata...")
                # Use InitSpatialMetadata(1) for high-performance initialization (compressed)
                conn.execute(text("SELECT InitSpatialMetadata(1)"))
                conn.commit()
                logger.info("SpatiaLite metadata initialized.")
            else:
                logger.info("SpatiaLite metadata already exists.")
                
        except Exception as e:
            logger.error(f"Error initializing SpatiaLite: {e}")
            # We don't raise here as the core tables might still be useful
            
    # Create all SQLAlchemy tables
    # Note: For now we don't have any models defined, but this is a placeholder
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialization complete.")

if __name__ == "__main__":
    init_db()
