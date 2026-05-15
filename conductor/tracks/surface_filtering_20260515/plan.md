# Implementation Plan - Surface Filtering

## Phase 1: Data Extraction & Categorization
- [ ] Task: Modify `OSMService` Overpass query to explicitly request `surface` tags
- [ ] Task: Implement mapping logic in backend to categorize raw OSM tags into standardized types (Paved, Unpaved, Unknown)

## Phase 2: API & Routing Logic
- [ ] Task: Update `GraphData` model to accept `allowed_surfaces` list
- [ ] Task: Modify `RoutingService` to pre-filter edges based on the `allowed_surfaces` list before solving CPP

## Phase 3: UI Integration
- [ ] Task: Add surface toggle/checkboxes to the UI overlay
- [ ] Task: Pass selected surfaces to `/generate-route` payload
- [ ] Task: Visually distinguish surfaces on the rendered map (optional but helpful)