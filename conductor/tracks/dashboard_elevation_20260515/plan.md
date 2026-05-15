# Implementation Plan - Progress Dashboard and Route Elevation Profile

## Phase 1: Elevation Data
- [ ] Task: Integrate an elevation API (e.g., Open-Meteo Elevation API) in the backend
- [ ] Task: Enhance `/generate-route` to append elevation data to nodes
- [ ] Task: Update `/export-gpx` to include `<ele>` tags

## Phase 2: Elevation UI
- [ ] Task: Integrate a charting library in the frontend (e.g., Recharts or Chart.js)
- [ ] Task: Render an interactive elevation profile below the map when a route is generated

## Phase 3: Coverage Dashboard
- [ ] Task: Implement backend logic to calculate coverage percentage (Covered distance / Total distance in polygon)
- [ ] Task: Build UI dashboard component to display these metrics to the user