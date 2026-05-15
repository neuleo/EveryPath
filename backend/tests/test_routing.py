import pytest
import networkx as nx
from routing import RoutingService

@pytest.fixture
def routing_service():
    return RoutingService()

def test_find_eulerian_circuit_simple(routing_service):
    # Create a simple Eulerian graph (a square)
    G = nx.Graph()
    G.add_edge(0, 1, weight=1)
    G.add_edge(1, 2, weight=1)
    G.add_edge(2, 3, weight=1)
    G.add_edge(3, 0, weight=1)
    
    circuit = routing_service.solve_cpp(G)
    
    # Check if it's a valid circuit
    assert len(circuit) == 5
    assert circuit[0] == circuit[-1]
    # Check if all edges are covered (undirected)
    edges_covered = set()
    for i in range(len(circuit) - 1):
        u, v = sorted((circuit[i], circuit[i+1]))
        edges_covered.add((u, v))
    assert len(edges_covered) == 4

def test_find_odd_degree_nodes(routing_service):
    # Graph with 2 odd degree nodes
    G = nx.Graph()
    G.add_edge(0, 1)
    G.add_edge(1, 2)
    
    odd_nodes = routing_service.get_odd_degree_nodes(G)
    assert set(odd_nodes) == {0, 2}

def test_solve_cpp_non_eulerian(routing_service):
    # Graph requiring one edge addition (0-2 via shortest path)
    # 0 -- 1 -- 2
    G = nx.Graph()
    G.add_edge(0, 1, weight=10)
    G.add_edge(1, 2, weight=10)
    
    circuit = routing_service.solve_cpp(G)
    
    # Eulerian circuit should be 0-1-2-1-0
    assert len(circuit) == 5
    assert circuit == [0, 1, 2, 1, 0] or circuit == [2, 1, 0, 1, 2] # or other starts
