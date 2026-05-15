import pytest
import networkx as nx
from routing import RoutingService

@pytest.fixture
def routing_service():
    return RoutingService()

def test_find_eulerian_circuit_simple(routing_service):
    G = nx.Graph()
    G.add_edge(0, 1, weight=1)
    G.add_edge(1, 2, weight=1)
    G.add_edge(2, 3, weight=1)
    G.add_edge(3, 0, weight=1)
    
    circuit, is_disconnected = routing_service.solve_cpp(G)
    assert len(circuit) == 5
    assert circuit[0] == circuit[-1]
    assert is_disconnected is False

def test_solve_cpp_non_eulerian(routing_service):
    # 0 -- 1 -- 2
    G = nx.Graph()
    G.add_edge(0, 1, weight=10)
    G.add_edge(1, 2, weight=10)
    
    circuit, is_disconnected = routing_service.solve_cpp(G)
    assert len(circuit) == 5
    # Should be 0-1-2-1-0 or similar
    assert set(circuit) == {0, 1, 2}
    assert circuit.count(1) == 2
    assert is_disconnected is False

def test_filter_dead_ends(routing_service):
    # 0 -- 1 -- 2 (dead end)
    #      |
    #      3 (dead end)
    G = nx.Graph()
    G.add_edge(0, 1, weight=10)
    G.add_edge(1, 2, weight=10)
    G.add_edge(1, 3, weight=10)
    
    filtered_G = routing_service.filter_dead_ends(G)
    # Only 0-1 remains? No, actually dead ends are nodes with degree 1.
    # If we remove nodes with degree 1, we might lose everything if it's a tree.
    # The requirement is "Sackgassen einbeziehen oder ignorieren".
    # Ignoring dead ends usually means trimming branches.
    assert filtered_G.number_of_nodes() < G.number_of_nodes()
