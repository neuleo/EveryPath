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

    def solve_cpp(self, G: nx.Graph):
        """
        Solves the Chinese Postman Problem (CPP) for an undirected graph.
        Returns a tuple of (list of nodes, is_disconnected flag).
        """
        is_disconnected = False
        if not nx.is_connected(G):
            is_disconnected = True
            G = self.connect_components(G)

        odd_nodes = self.get_odd_degree_nodes(G)

        if not odd_nodes:
            # Graph is already Eulerian
            edges = self._optimized_eulerian_circuit(nx.MultiGraph(G), list(G.nodes())[0])
            return self._edges_to_nodes(edges), is_disconnected
        
        # 1. Calculate all pairs shortest paths between odd nodes
        odd_node_pairs = list(itertools.combinations(odd_nodes, 2))
        
        # 2. Find min weight perfect matching
        complete_graph = nx.Graph()
        for u, v in odd_node_pairs:
            try:
                weight = nx.shortest_path_length(G, u, v, weight='weight')
                complete_graph.add_edge(u, v, weight=-weight) # NX uses max weight matching
            except nx.NetworkXNoPath:
                continue
            
        matching = nx.max_weight_matching(complete_graph, maxcardinality=True, weight='weight')
        
        # 3. Augment the original graph
        augmented_G = nx.MultiGraph(G)
        for u, v in matching:
            path = nx.shortest_path(G, u, v, weight='weight')
            for i in range(len(path) - 1):
                # Copy attributes from original edge
                attr = G[path[i]][path[i+1]]
                augmented_G.add_edge(path[i], path[i+1], **attr)
        
        # 4. Find Eulerian circuit
        edges = self._optimized_eulerian_circuit(augmented_G, list(G.nodes())[0])
        return self._edges_to_nodes(edges), is_disconnected

