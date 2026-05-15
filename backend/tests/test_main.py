from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "OK"}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to EveryPath API"}

def test_generate_route():
    # Simple graph: 0-1-2
    graph_data = {
        "nodes": [0, 1, 2],
        "edges": [
            {"u": 0, "v": 1, "weight": 10},
            {"u": 1, "v": 2, "weight": 10}
        ]
    }
    response = client.post("/generate-route", json=graph_data)
    assert response.status_code == 200
    data = response.json()
    assert "route" in data
    assert data["route"] == [0, 1, 2, 1, 0] or data["route"] == [2, 1, 0, 1, 2]

def test_fetch_osm():
    # Mock OSM data
    mock_osm = {
        "elements": [
            {"type": "node", "id": 1, "lat": 48.1, "lon": 11.5},
            {"type": "node", "id": 2, "lat": 48.2, "lon": 11.5},
            {"type": "way", "id": 10, "nodes": [1, 2], "tags": {"highway": "residential"}}
        ]
    }
    
    import respx
    from httpx import Response
    
    with respx.mock:
        respx.post("https://overpass-api.de/api/interpreter").mock(return_value=Response(200, json=mock_osm))
        
        response = client.post("/fetch-osm", json={"coordinates": [[11.5, 48.1], [11.5, 48.2], [11.6, 48.2]]})
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert len(data["nodes"]) == 2
        assert len(data["edges"]) == 1
