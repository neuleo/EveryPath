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
