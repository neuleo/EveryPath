# Implementation Plan - Coverage History Overlay and Persistence

## Phase 1: Backend Persistence
- [ ] Task: Create `RouteHistory` database model linked to `User`
- [ ] Task: Create endpoint to save a generated route to history
- [ ] Task: Create endpoint to fetch all historical routes for the current user

## Phase 2: Frontend Visualization
- [ ] Task: Implement API calls in frontend to save/fetch history
- [ ] Task: Add a new GeoJSON source and line layer in MapLibre for the history overlay
- [ ] Task: Add a UI toggle to show/hide the coverage overlay

## Phase 3: UX & Performance
- [ ] Task: Optimize rendering of large histories (e.g., merging GeoJSON features)
- [ ] Task: Ensure history layer persists seamlessly under newly drawn polygons/routes