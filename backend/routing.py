import networkx as nx
import itertools

class RoutingService:
    def get_odd_degree_nodes(self, G: nx.Graph):
        """Returns a list of nodes with an odd degree."""
        return [v for v, d in G.degree() if d % 2 == 1]

    def solve_cpp(self, G: nx.Graph):
        """
        Solves the Chinese Postman Problem (CPP) for an undirected graph.
        Returns a list of nodes representing the Eulerian circuit.
        """
        if not nx.is_connected(G):
            raise ValueError("Graph must be connected to solve CPP")

        odd_nodes = self.get_odd_degree_nodes(G)

        if not odd_nodes:
            # Graph is already Eulerian
            return list(nx.eulerian_circuit(G, source=list(G.nodes())[0], keys=False))
        
        # 1. Calculate all pairs shortest paths between odd nodes
        odd_node_pairs = list(itertools.combinations(odd_nodes, 2))
        
        # 2. Find min weight perfect matching
        # Note: NetworkX has min_weight_matching which works on general graphs
        # We need to create a complete graph of odd nodes where edge weights are shortest paths
        complete_graph = nx.Graph()
        for u, v in odd_node_pairs:
            weight = nx.shortest_path_length(G, u, v, weight='weight')
            complete_graph.add_edge(u, v, weight=-weight) # NX uses max weight matching, so negate
            
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
        # nx.eulerian_circuit returns edges, we want nodes
        edges = list(nx.eulerian_circuit(augmented_G, source=list(G.nodes())[0]))
        
        route = [edges[0][0]]
        for edge in edges:
            route.append(edge[1])
            
        return route

    def _edges_to_nodes(self, edges):
        if not edges:
            return []
        nodes = [edges[0][0]]
        for edge in edges:
            nodes.append(edge[1])
        return nodes

    def solve_cpp(self, G: nx.Graph):
        # Redefining to use internal helper for circuit to nodes conversion
        if not nx.is_connected(G):
            raise ValueError("Graph must be connected to solve CPP")

        odd_nodes = self.get_odd_degree_nodes(G)

        if not odd_nodes:
            edges = list(nx.eulerian_circuit(G, source=list(G.nodes())[0]))
            return self._edges_to_nodes(edges)
        
        odd_node_pairs = list(itertools.combinations(odd_nodes, 2))
        
        complete_graph = nx.Graph()
        for u, v in odd_node_pairs:
            weight = nx.shortest_path_length(G, u, v, weight='weight')
            complete_graph.add_edge(u, v, weight=-weight) 
            
        matching = nx.max_weight_matching(complete_graph, maxcardinality=True, weight='weight')
        
        augmented_G = nx.MultiGraph(G)
        for u, v in matching:
            path = nx.shortest_path(G, u, v, weight='weight')
            for i in range(len(path) - 1):
                attr = G[path[i]][path[i+1]]
                augmented_G.add_edge(path[i], path[i+1], **attr)
        
        edges = list(nx.eulerian_circuit(augmented_G, source=list(G.nodes())[0]))
        return self._edges_to_nodes(edges)
