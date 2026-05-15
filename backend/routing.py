import networkx as nx
import itertools

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

    def solve_cpp(self, G: nx.Graph):
        """
        Solves the Chinese Postman Problem (CPP) for an undirected graph.
        Returns a list of nodes representing the Eulerian circuit.
        """
        if not nx.is_connected(G):
            # If not connected, solve for the largest component
            components = list(nx.connected_components(G))
            if not components:
                return []
            largest_comp = max(components, key=len)
            G = G.subgraph(largest_comp).copy()

        odd_nodes = self.get_odd_degree_nodes(G)

        if not odd_nodes:
            # Graph is already Eulerian
            edges = list(nx.eulerian_circuit(G, source=list(G.nodes())[0]))
            return self._edges_to_nodes(edges)
        
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
        edges = list(nx.eulerian_circuit(augmented_G, source=list(G.nodes())[0]))
        return self._edges_to_nodes(edges)
