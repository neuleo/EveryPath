export interface OSMNode {
  id: number;
  lat: number;
  lon: number;
}

export interface OSMEdge {
  u: number;
  v: number;
  weight: number;
  metadata?: Record<string, string>;
}

export interface GraphData {
  nodes: OSMNode[];
  edges: OSMEdge[];
}

export interface RouteResponse {
  route: OSMNode[];
  is_disconnected: boolean;
}
