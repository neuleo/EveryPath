import pytest
from graph_service import GraphService

def test_osm_to_graph_conversion():
    processor = GraphService()
    osm_data = {
        "elements": [
            {"type": "node", "id": 1, "lat": 48.1, "lon": 11.5},
            {"type": "node", "id": 2, "lat": 48.2, "lon": 11.5},
            {"type": "way", "id": 10, "nodes": [1, 2], "tags": {"highway": "residential", "name": "Main St"}}
        ]
    }
    
    graph_data = processor.convert_osm_to_graph(osm_data)
    
    assert len(graph_data["nodes"]) == 2
    assert len(graph_data["edges"]) == 1
    assert graph_data["edges"][0]["u"] == 1
    assert graph_data["edges"][0]["v"] == 2
    # Check if weight (distance) is calculated
    assert graph_data["edges"][0]["weight"] > 0
    assert "name" in graph_data["edges"][0]["metadata"]
    assert graph_data["edges"][0]["metadata"]["name"] == "Main St"

def test_osm_to_graph_missing_nodes():
    processor = GraphService()
    # Way refers to node 3 which is not in elements
    osm_data = {
        "elements": [
            {"type": "node", "id": 1, "lat": 48.1, "lon": 11.5},
            {"type": "way", "id": 10, "nodes": [1, 3]}
        ]
    }
    graph_data = processor.convert_osm_to_graph(osm_data)
    assert len(graph_data["edges"]) == 0
