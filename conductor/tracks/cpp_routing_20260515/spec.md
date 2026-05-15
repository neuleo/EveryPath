# Specification - CPP Routing Implementation and Sackgassen-Toggle

## Overview
This track focuses on implementing the Chinese Postman Problem (CPP) algorithm in the backend to generate an efficient route that covers every road segment within the user's defined polygon. It also includes a "Sackgassen-Toggle" (Dead-end Toggle) to include or ignore dead-ends.

## Goals
- Refine the `RoutingService` to solve the CPP on the graphs fetched from OSM.
- Implement the "Sackgassen-Toggle" logic to filter out dead-ends before routing.
- Integrate the routing calculation into the frontend flow.
- Visualize the final calculated route as a distinct layer on the map.
- Add a button to trigger route calculation and export GPX.

## Technical Requirements
- **Backend:**
  - `RoutingService` using NetworkX's Eulerian circuit algorithms.
  - Logic to handle non-Eulerian graphs by finding minimum weight perfect matchings on odd-degree nodes.
  - Filtering logic based on node degree for the "Sackgassen-Toggle".
- **Frontend:**
  - Toggle UI element for dead-ends.
  - "Generate Route" button.
  - Visualization layer for the final path.
  - Integration of GPX export endpoint.

## Acceptance Criteria
- User can toggle dead-ends on/off.
- Backend returns a valid Eulerian circuit covering all (filtered) segments.
- The route is displayed clearly on the map (e.g., as a blue path).
- User can download the route as a `.gpx` file.
