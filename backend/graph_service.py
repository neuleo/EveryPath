import math
from typing import List, Dict, Any, Tuple, Optional
from shapely.geometry import Polygon, Point, LineString

class GraphService:
    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculates the great-circle distance between two points in meters.
        """
        R = 6371000  # Earth radius in meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        
        a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def convert_osm_to_graph(self, osm_data: Dict[str, Any], polygon: Optional[Polygon] = None, buffered_polygon: Optional[Polygon] = None) -> Dict[str, Any]:
        """
        Converts OSM JSON data into a graph format (nodes and edges).
        Nodes are strictly filtered to the buffered_polygon to prevent the graph from growing infinitely.
        Edges are tagged as 'required' if they significantly intersect the original polygon.
        """
        nodes = {}
        for element in osm_data.get("elements", []):
            if element["type"] == "node":
                pt = Point(element["lon"], element["lat"])
                # Strictly limit graph nodes to the buffered area to prevent overflow
                if buffered_polygon is None or buffered_polygon.intersects(pt):
                    nodes[element["id"]] = {
                        "id": element["id"],
                        "lat": element["lat"],
                        "lon": element["lon"]
                    }
        
        edges = []
        graph_nodes = set()
        
        for element in osm_data.get("elements", []):
            if element["type"] == "way":
                way_nodes = element.get("nodes", [])
                tags = element.get("tags", {})
                
                for i in range(len(way_nodes) - 1):
                    u_id = way_nodes[i]
                    v_id = way_nodes[i+1]
                    
                    if u_id in nodes and v_id in nodes:
                        u = nodes[u_id]
                        v = nodes[v_id]
                        
                        is_required = True
                        if polygon is not None:
                            line = LineString([(u["lon"], u["lat"]), (v["lon"], v["lat"])])
                            if not polygon.intersects(line):
                                is_required = False
                            else:
                                # Check how much of the line is inside
                                intersection = polygon.intersection(line)
                                # Approximate length in meters (1 deg ~ 111000m)
                                length_inside_m = intersection.length * 111000
                                line_length_m = line.length * 111000
                                
                                # Required if >50% inside, OR if more than 15 meters inside
                                # This avoids 'pokes' at junctions while ensuring small segments inside are kept
                                if length_inside_m > 15 or (length_inside_m > 0.5 * line_length_m):
                                    is_required = True
                                else:
                                    is_required = False
                        
                        weight = self.haversine_distance(u["lat"], u["lon"], v["lat"], v["lon"])
                        
                        edges.append({
                            "u": u_id,
                            "v": v_id,
                            "weight": weight,
                            "required": is_required,
                            "metadata": tags
                        })
                        graph_nodes.add(u_id)
                        graph_nodes.add(v_id)
        
        return {
            "nodes": [nodes[node_id] for node_id in graph_nodes],
            "edges": edges
        }
