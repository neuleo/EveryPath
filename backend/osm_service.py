import httpx
import asyncio
from typing import List, Tuple, Dict, Any

class OSMService:
    def __init__(self, overpass_url: str = "https://lz4.overpass-api.de/api/interpreter"):
        self.overpass_url = overpass_url

    def _build_query(self, polygon_coords: List[Tuple[float, float]]) -> str:
        """
        Builds an Overpass QL query to fetch roads/paths within a polygon.
        """
        poly_str = " ".join([f"{lat} {lon}" for lat, lon in polygon_coords])
        query = f"""
        [out:json][timeout:25];
        (
          way["highway"](poly:"{poly_str}");
        );
        out body;
        >;
        out skel qt;
        """
        return query.strip()

    async def fetch_within_polygon(self, polygon_coords: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Fetches OSM data within the specified polygon.
        """
        query = self._build_query(polygon_coords)
        headers = {
            "User-Agent": "EveryPath/1.0 (https://everypath-test.neuleo.de)",
            "Referer": "https://everypath-test.neuleo.de"
        }
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(self.overpass_url, data={"data": query}, headers=headers)
                    response.raise_for_status()
                    return response.json()
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(1.0 * (attempt + 1)) # Exponential backoff

