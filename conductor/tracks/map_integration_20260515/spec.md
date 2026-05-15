# Specification - Map Integration and OSM Data Fetching

## Overview
This track focuses on integrating an interactive map into the frontend and implementing the backend logic to fetch road and path data from OpenStreetMap (OSM) for a user-defined area (polygon).

## Goals
- Integrate MapLibre GL JS into the React frontend.
- Allow users to draw a polygon on the map to select an area.
- Implement a backend service to fetch OSM data (nodes and ways) within the polygon.
- Convert OSM data into a graph format (NetworkX) suitable for CPP solving.
- Visualize the fetched road network on the map.

## Technical Requirements
- **Frontend:**
  - MapLibre GL JS for map rendering.
  - MapLibre-gl-draw (or similar) for polygon drawing.
  - React Query for fetching data from the backend.
- **Backend:**
  - Overpass API client (or direct HTTP requests) to fetch OSM data.
  - OSMnx or custom logic to process OSM data into NetworkX graphs.
  - SpatiaLite for storing the fetched segments and user polygons.

## Acceptance Criteria
- Map is displayed in high-contrast dark mode.
- User can draw and edit a polygon.
- Backend can successfully fetch OSM data for a small polygon and return the graph.
- The fetched paths are displayed as an overlay on the map.
