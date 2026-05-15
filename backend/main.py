from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import networkx as nx
from routing import RoutingService

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
