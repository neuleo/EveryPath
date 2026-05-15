from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import networkx as nx
from routing import RoutingService
from osm_service import OSMService
from graph_service import GraphService
from database import get_db
from models import Polygon
from sqlalchemy.orm import Session
from fastapi import Depends
from shapely.geometry import Polygon as ShapelyPolygon

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

class GraphData(BaseModel):
    nodes: List[int]
    edges: List[Edge]

class RouteResponse(BaseModel):
    route: List[int]

class PolygonRequest(BaseModel):
    coordinates: List[List[float]] # [[lon, lat], ...]

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
        G.add_nodes_from(data.nodes)
        for edge in data.edges:
            G.add_edge(edge.u, edge.v, weight=edge.weight)
        
        if not nx.is_connected(G):
            raise HTTPException(status_code=400, detail="Graph must be connected")
            
        service = RoutingService()
        route = service.solve_cpp(G)
        return {"route": route}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fetch-osm")
async def fetch_osm(data: PolygonRequest, db: Session = Depends(get_db)):
    try:
        # Mapbox/GeoJSON uses [lon, lat], OSMService expects [(lat, lon), ...]
        polygon_coords = [(c[1], c[0]) for c in data.coordinates]
        
        # Save polygon to DB
        shapely_poly = ShapelyPolygon(data.coordinates)
        db_poly = Polygon(geom_wkt=shapely_poly.wkt)
        db.add(db_poly)
        db.commit()
        
        osm_service = OSMService()
        graph_service = GraphService()
        
        raw_osm = await osm_service.fetch_within_polygon(polygon_coords)
        graph_data = graph_service.convert_osm_to_graph(raw_osm)
        
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
