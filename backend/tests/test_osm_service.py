import pytest
import respx
from httpx import Response
from osm_service import OSMService

@pytest.mark.asyncio
async def test_fetch_osm_data_basic():
    service = OSMService()
    polygon_coords = [(48.1, 11.5), (48.2, 11.5), (48.2, 11.6), (48.1, 11.6), (48.1, 11.5)]
    
    # Mock Overpass API response
    mock_response = {
        "elements": [
            {"type": "node", "id": 1, "lat": 48.15, "lon": 11.55},
            {"type": "node", "id": 2, "lat": 48.16, "lon": 11.56},
            {"type": "way", "id": 10, "nodes": [1, 2], "tags": {"highway": "residential"}}
        ]
    }
    
    with respx.mock:
        respx.post("https://overpass-api.de/api/interpreter").mock(return_value=Response(200, json=mock_response))
        
        data = await service.fetch_within_polygon(polygon_coords)
        
        assert "elements" in data
        assert len(data["elements"]) == 3
        assert data["elements"][2]["type"] == "way"

def test_generate_overpass_query():
    service = OSMService()
    polygon_coords = [(48.1, 11.5), (48.2, 11.5), (48.2, 11.6)]
    query = service._build_query(polygon_coords)
    
    assert "[out:json]" in query
    assert 'poly:"48.1 11.5 48.2 11.5 48.2 11.6"' in query
    assert 'way["highway"]' in query
