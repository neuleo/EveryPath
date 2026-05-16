from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import networkx as nx
from sqlalchemy.orm import Session
from shapely.geometry import Polygon as ShapelyPolygon
import traceback
import logging

from routing import RoutingService
from osm_service import OSMService
from graph_service import GraphService
from gpx_exporter import GPXExporter
from database import get_db
from models import Polygon

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="EveryPath API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthCheck(BaseModel):
    status: str = "OK"

class Edge(BaseModel):
    u: int
    v: int
    weight: float = 1.0
    required: bool = True

class GraphData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Edge]
    include_dead_ends: bool = True
    start_coords: Optional[List[float]] = None # [lon, lat]
    end_coords: Optional[List[float]] = None # [lon, lat]

class RouteResponse(BaseModel):
    route: List[Dict[str, Any]]
    is_disconnected: bool = False

class PolygonRequest(BaseModel):
    coordinates: List[List[float]] # [[lon, lat], ...]

class GPXRequest(BaseModel):
    coordinates: List[List[float]] # [[lat, lon], ...]

@app.get("/health", response_model=HealthCheck)
async def health_check():
    return {"status": "OK"}

@app.get("/")
async def root():
    return {"message": "Welcome to EveryPath API"}

@app.post("/generate-route", response_model=RouteResponse)
async def generate_route(data: GraphData):
    try:
        G = nx.Graph()
        node_map = {n["id"]: n for n in data.nodes}
        for n in data.nodes:
            G.add_node(n["id"], lat=n["lat"], lon=n["lon"])
        for edge in data.edges:
            G.add_edge(edge.u, edge.v, weight=edge.weight)
        
        service = RoutingService()
        
        if not data.include_dead_ends:
            G = service.filter_dead_ends(G)
        
        if G.number_of_nodes() == 0:
             return {"route": [], "is_disconnected": False}
             
        start_node_id = -1
        if data.start_coords:
            start_node_id = service.find_nearest_node(G, data.start_coords[0], data.start_coords[1])
            
        end_node_id = -1
        if data.end_coords:
            end_node_id = service.find_nearest_node(G, data.end_coords[0], data.end_coords[1])

        route_ids, is_disconnected = service.solve_cpp(G, start_node_id, end_node_id)
        route_nodes = [node_map[node_id] for node_id in route_ids if node_id in node_map]
        
        return {"route": route_nodes, "is_disconnected": is_disconnected}
    except Exception as e:
        logger.error(f"Error in generate_route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fetch-osm")
async def fetch_osm(data: PolygonRequest, db: Session = Depends(get_db)):
    try:
        logger.info(f"Received fetch-osm request with {len(data.coordinates)} points")
        if len(data.coordinates) < 3:
            raise HTTPException(status_code=400, detail="Polygon must have at least 3 points")

        # Mapbox/GeoJSON uses [lon, lat], OSMService expects [(lat, lon), ...]
        polygon_coords = [(c[1], c[0]) for c in data.coordinates]
        
        # Save polygon to DB
        try:
            shell = list(data.coordinates)
            if shell[0] != shell[-1]:
                shell.append(shell[0])
                
            shapely_poly = ShapelyPolygon(shell)
            if not shapely_poly.is_valid:
                logger.warning("Polygon is invalid, attempting to fix with buffer(0)")
                shapely_poly = shapely_poly.buffer(0)

            db_poly = Polygon(geom_wkt=shapely_poly.wkt)
            db.add(db_poly)
            db.commit()
            logger.info(f"Polygon saved to database: {db_poly.id}")
        except Exception as poly_err:
            logger.error(f"Error saving polygon: {poly_err}")
            db.rollback()
        
        osm_service = OSMService()
        graph_service = GraphService()
        
        logger.info("Fetching from Overpass...")
        try:
            raw_osm = await osm_service.fetch_within_polygon(polygon_coords)
        except Exception as osm_err:
            logger.error(f"Overpass API error: {osm_err}")
            raise HTTPException(status_code=502, detail=f"OSM Service error: {str(osm_err)}")

        elements = raw_osm.get('elements', [])
        logger.info(f"Overpass returned {len(elements)} elements")
        
        if not elements:
            return {"nodes": [], "edges": []}

        graph_data = graph_service.convert_osm_to_graph(raw_osm, polygon=shapely_poly)
        logger.info(f"Converted to graph with {len(graph_data['edges'])} edges")
        
        return graph_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fatal error in fetch_osm: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/export-gpx")
async def export_gpx(data: GPXRequest):
    try:
        exporter = GPXExporter()
        coords = [tuple(c) for c in data.coordinates]
        gpx_content = exporter.create_gpx(coords)
        
        return Response(
            content=gpx_content,
            media_type="application/gpx+xml",
            headers={"Content-Disposition": "attachment; filename=everypath-route.gpx"}
        )
    except Exception as e:
        logger.error(f"Error in export_gpx: {e}")
        raise HTTPException(status_code=500, detail=str(e))
