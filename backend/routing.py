import networkx as nx
import itertools
import math

class RoutingService:
    def get_odd_degree_nodes(self, G: nx.Graph):
        """Returns a list of nodes with an odd degree."""
        return [v for v, d in G.degree() if d % 2 == 1]

    def _edges_to_nodes(self, edges):
        if not edges:
            return []
        nodes = [edges[0][0]]
        for edge in edges:
            nodes.append(edge[1])
        return nodes

    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def connect_components(self, G: nx.Graph) -> nx.Graph:
        G = G.copy()
        components = list(nx.connected_components(G))
        if len(components) <= 1:
            return G

        # Sort components by size descending
        components.sort(key=len, reverse=True)
        connected_nodes = set(components[0])

        for comp in components[1:]:
            min_dist = float('inf')
            best_edge = None
            for u in comp:
                if 'lat' not in G.nodes[u]: continue
                lat1, lon1 = G.nodes[u]['lat'], G.nodes[u]['lon']
                for v in connected_nodes:
                    if 'lat' not in G.nodes[v]: continue
                    lat2, lon2 = G.nodes[v]['lat'], G.nodes[v]['lon']
                    dist = self.haversine_distance(lat1, lon1, lat2, lon2)
                    if dist < min_dist:
                        min_dist = dist
                        best_edge = (u, v)
            if best_edge:
                G.add_edge(best_edge[0], best_edge[1], weight=min_dist, virtual=True)
                connected_nodes.update(comp)
                
        return G

    def filter_dead_ends(self, G: nx.Graph) -> nx.Graph:
        """
        Removes dead ends (nodes with degree 1) iteratively.
        """
        filtered_G = G.copy()
        while True:
            dead_ends = [v for v, d in filtered_G.degree() if d == 1]
            if not dead_ends:
                break
            filtered_G.remove_nodes_from(dead_ends)
        return filtered_G

    def calculate_turn_angle(self, u, v, w, G):
        if 'lat' not in G.nodes[u] or 'lat' not in G.nodes[v] or 'lat' not in G.nodes[w]:
            return 0
        lat1, lon1 = G.nodes[u]['lat'], G.nodes[u]['lon']
        lat2, lon2 = G.nodes[v]['lat'], G.nodes[v]['lon']
        lat3, lon3 = G.nodes[w]['lat'], G.nodes[w]['lon']
        
        def bearing(latA, lonA, latB, lonB):
            latA, lonA, latB, lonB = map(math.radians, [latA, lonA, latB, lonB])
            x = math.cos(latB) * math.sin(lonB - lonA)
            y = math.cos(latA) * math.sin(latB) - math.sin(latA) * math.cos(latB) * math.cos(lonB - lonA)
            return math.degrees(math.atan2(x, y))
            
        b1 = bearing(lat1, lon1, lat2, lon2)
        b2 = bearing(lat2, lon2, lat3, lon3)
        
        diff = (b2 - b1) % 360
        if diff > 180:
            diff = 360 - diff
        return diff

    def _optimized_eulerian_circuit(self, G: nx.MultiGraph, source):
        G = G.copy()
        if G.number_of_edges() == 0:
            return []
            
        circuit = []
        stack = [source]
        
        while stack:
            u = stack[-1]
            if G.degree(u) == 0:
                circuit.append(stack.pop())
            else:
                best_edge = None
                best_diff = float('inf')
                best_key = None
                
                edges = list(G.edges(u, keys=True))
                if len(stack) > 1:
                    prev_u = stack[-2]
                    for u_edge, v_edge, key in edges:
                        diff = self.calculate_turn_angle(prev_u, u, v_edge, G)
                        if diff < best_diff:
                            best_diff = diff
                            best_edge = v_edge
                            best_key = key
                
                if best_edge is None:
                    _, best_edge, best_key = edges[0]
                    
                stack.append(best_edge)
                G.remove_edge(u, best_edge, key=best_key)
                
        circuit.reverse()
        
        edges_result = []
        for i in range(len(circuit)-1):
            edges_result.append((circuit[i], circuit[i+1]))
        return edges_result

    def find_nearest_node(self, G: nx.Graph, lon: float, lat: float) -> int:
        """Finds the node in the graph closest to the given coordinates."""
        min_dist = float('inf')
        nearest_node = -1
        
        for n, data in G.nodes(data=True):
            if 'lat' in data and 'lon' in data:
                dist = self.haversine_distance(lat, lon, data['lat'], data['lon'])
                if dist < min_dist:
                    min_dist = dist
                    nearest_node = n
        return nearest_node

    def solve_rpp(self, G: nx.Graph, s_id: int, t_id: int):
        """
        Solves the Rural Postman Problem (RPP).
        G contains 'required' attribute on edges.
        """
        # 1. Subgraph of required edges
        required_edges = [(u, v, d) for u, v, d in G.edges(data=True) if d.get('required')]
        if not required_edges:
            # Fallback for old data/tests: treat all as required
            required_edges = [(u, v, d) for u, v, d in G.edges(data=True)]
            if not required_edges:
                return [], False
            
        G_R = nx.Graph()
        for u, v, d in required_edges:
            G_R.add_edge(u, v, **d)
        
        for n in G_R.nodes():
            G_R.nodes[n].update(G.nodes[n])

        # 2. Connect all components of G_R using paths from G
        # Also ensure s_id and t_id are connected to the required graph
        components = list(nx.connected_components(G_R))
        
        # We need to include s_id and t_id in the connectivity consideration
        target_nodes = set()
        if s_id != -1 and s_id in G: target_nodes.add(s_id)
        if t_id != -1 and t_id in G: target_nodes.add(t_id)
        
        while True:
            components = list(nx.connected_components(G_R))
            # Check if all components AND start/end nodes are in one component
            connected = True
            first_comp = None
            if components:
                first_comp = components[0]
                # Are all start/end nodes in G_R yet?
                if s_id != -1 and s_id not in G_R: connected = False
                elif t_id != -1 and t_id not in G_R: connected = False
                # Are all nodes of G_R connected?
                elif len(components) > 1: connected = False
            else:
                # No required edges, but maybe start/end?
                if s_id != -1: first_comp = {s_id}
                else: return [], False
            
            if connected: break
            
            # Find best connection from the "main" component to something not yet connected
            main_comp = first_comp
            best_path = None
            min_weight = float('inf')
            
            # Nodes to connect to: other components or start/end nodes
            potential_targets = set()
            for i in range(1, len(components)):
                potential_targets.update(components[i])
            if s_id != -1 and s_id not in G_R: potential_targets.add(s_id)
            if t_id != -1 and t_id not in G_R: potential_targets.add(t_id)
            
            sample_main = list(main_comp)[:20]
            sample_targets = list(potential_targets)[:20]
            
            for u in sample_main:
                for v in sample_targets:
                    try:
                        w = nx.shortest_path_length(G, u, v, weight='weight')
                        if w < min_weight:
                            min_weight = w
                            best_path = nx.shortest_path(G, u, v, weight='weight')
                    except nx.NetworkXNoPath:
                        pass
            
            if best_path:
                for i in range(len(best_path)-1):
                    u_p, v_p = best_path[i], best_path[i+1]
                    if not G_R.has_edge(u_p, v_p):
                        G_R.add_edge(u_p, v_p, **G[u_p][v_p], required=False)
                # Ensure node data is present
                for n in best_path:
                    G_R.nodes[n].update(G.nodes[n])
            else:
                # Tricky: disconnected graph. Force air-line if needed or break
                break

        # 3. Parity adjustment (Matching)
        # We need s and t to have odd degrees (if s != t) or even (if s == t)
        # and all other nodes to have even degrees.
        s = s_id if s_id != -1 and s_id in G_R else list(G_R.nodes())[0]
        t = t_id if t_id != -1 and t_id in G_R else s
        
        odd_nodes = set(self.get_odd_degree_nodes(G_R))
        if s == t:
            target_nodes = list(odd_nodes)
        else:
            target_nodes = list(odd_nodes.symmetric_difference({s, t}))
            
        if target_nodes:
            complete_graph = nx.Graph()
            for u, v in itertools.combinations(target_nodes, 2):
                try:
                    w = nx.shortest_path_length(G, u, v, weight='weight')
                    complete_graph.add_edge(u, v, weight=-w)
                except nx.NetworkXNoPath:
                    continue
            
            matching = nx.max_weight_matching(complete_graph, maxcardinality=True, weight='weight')
            
            augmented_G = nx.MultiGraph(G_R)
            for u, v in matching:
                path = nx.shortest_path(G, u, v, weight='weight')
                for i in range(len(path) - 1):
                    u_p, v_p = path[i], path[i+1]
                    augmented_G.add_edge(u_p, v_p, **G[u_p][v_p])
        else:
            augmented_G = nx.MultiGraph(G_R)

        # 4. Eulerian Path/Circuit from s to t
        edges = self._optimized_eulerian_circuit(augmented_G, s)
        return self._edges_to_nodes(edges), False

    def solve_cpp(self, G: nx.Graph, start_node_id: int = -1, end_node_id: int = -1):
        # Delegate to RPP
        return self.solve_rpp(G, start_node_id, end_node_id)
