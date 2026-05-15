import pytest
import networkx as nx
from routing import RoutingService

def test_hierholzer():
    service = RoutingService()
    G = nx.MultiGraph()
    G.add_node(0, lat=0, lon=0)
    G.add_node(1, lat=1, lon=0)
    G.add_node(2, lat=2, lon=0)
    G.add_edge(0, 1)
    G.add_edge(1, 2)
    G.add_edge(2, 1)
    G.add_edge(1, 0)
    
    circuit = service._optimized_eulerian_circuit(G, 0)
    assert len(circuit) == 4
