# Specification - Routing Algorithm Optimization and Route Animation UX

## Overview
This track addresses user feedback regarding the routing logic and the user experience of visualizing the generated route. Currently, the algorithm leaves gaps, skips segments, and creates illogical turnarounds. Additionally, the final route is a static line, making it impossible to see the direction or order of traversal.

## Goals
- **Algorithm Fixes:**
  - Prevent paths from being dropped or skipped due to strict polygon boundary cutting (missing edge nodes) or graph disconnection logic.
  - Optimize the Eulerian circuit traversal to minimize sharp turns or U-turns (e.g., using heuristic path ordering).
- **UX Enhancements:**
  - Add direction indicators (arrows) to the rendered route on the map.
  - Optionally add a "play" animation to trace the route visually.

## Technical Requirements
- **Backend (`osm_service.py`, `routing.py`):**
  - Adjust Overpass QL query to ensure all nodes of boundary-crossing ways are fetched.
  - Rework `nx.connected_components` handling. Instead of dropping smaller components, try to connect them to the main graph (e.g., via shortest geometric distance) before solving the CPP.
  - Implement a turn-penalty heuristic when extracting the Eulerian circuit from the augmented graph.
- **Frontend (`Map.tsx`):**
  - Use MapLibre's `symbol` layer with a directional icon (e.g., arrows) along the `route` source.
  - Implement an animated point traversing the `route` source using `requestAnimationFrame`.
