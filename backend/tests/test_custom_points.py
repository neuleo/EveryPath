import pytest
import networkx as nx
from fastapi.testclient import TestClient
from main import app
from routing import RoutingService

client = TestClient(app)

def test_find_nearest_node():
    service = RoutingService()
    G = nx.Graph()
    G.add_node(1, lat=48.1, lon=11.5)
    G.add_node(2, lat=48.2, lon=11.6)
    
    # Near node 1
    assert service.find_nearest_node(G, 11.501, 48.101) == 1
    # Near node 2
    assert service.find_nearest_node(G, 11.599, 48.199) == 2

def test_solve_cpp_with_custom_start_end():
    service = RoutingService()
    # 0 -- 1 -- 2
    G = nx.Graph()
    G.add_node(0, lat=48.1, lon=11.5)
    G.add_node(1, lat=48.11, lon=11.51)
    G.add_node(2, lat=48.12, lon=11.52)
    G.add_edge(0, 1, weight=10)
    G.add_edge(1, 2, weight=10)
    
    # Case 1: Start at 0, End at 0 (Standard CPP)
    route, _ = service.solve_cpp(G, start_node_id=0, end_node_id=0)
    assert route[0] == 0
    assert route[-1] == 0
    assert len(route) == 5 # 0-1-2-1-0
    
    # Case 2: Start at 0, End at 2
    # G has odd nodes {0, 2}. symmetric_difference({0, 2}, {0, 2}) = {}.
    # target_nodes = []. augmented_G = G. Eulerian path from 0 to 2 exists.
    route, _ = service.solve_cpp(G, start_node_id=0, end_node_id=2)
    assert route[0] == 0
    assert route[-1] == 2
    assert len(route) == 3 # 0-1-2
    
    # Case 3: Start at 1, End at 1
    # s=1, t=1. target_nodes = {0, 2}. matching {0, 2}. augmented_G adds edge (0,2) or (0,1,2).
    # Eulerian circuit from 1.
    route, _ = service.solve_cpp(G, start_node_id=1, end_node_id=1)
    assert route[0] == 1
    assert route[-1] == 1
    assert set(route) == {0, 1, 2}

def test_api_generate_route_with_coords():
    graph_data = {
        "nodes": [
            {"id": 0, "lat": 48.1, "lon": 11.5},
            {"id": 1, "lat": 48.11, "lon": 11.51},
            {"id": 2, "lat": 48.12, "lon": 11.52}
        ],
        "edges": [
            {"u": 0, "v": 1, "weight": 10},
            {"u": 1, "v": 2, "weight": 10}
        ],
        "include_dead_ends": True,
        "start_coords": [11.501, 48.101], # lon, lat (near node 0)
        "end_coords": [11.519, 48.119]   # lon, lat (near node 2)
    }
    
    response = client.post("/generate-route", json=graph_data)
    assert response.status_code == 200
    data = response.json()
    assert "route" in data
    route = data["route"]
    assert route[0]["id"] == 0
    assert route[-1]["id"] == 2
