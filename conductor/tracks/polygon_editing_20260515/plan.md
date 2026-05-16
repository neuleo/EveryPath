# Implementation Plan - Enhanced Polygon Editing

## Phase 1: Vertex Dragging Support
- [ ] Task: Update Map component to support vertex selection
    - [ ] Write failing test for vertex selection
    - [ ] Implement vertex selection logic using MapLibre/MapboxDraw
- [ ] Task: Implement vertex dragging logic
    - [ ] Write failing test for vertex dragging
    - [ ] Implement dragging logic with "ghost vertex" visual feedback
- [ ] Task: Conductor - User Manual Verification 'Vertex Dragging Support' (Protocol in workflow.md)

## Phase 2: Midpoint Plus Icons
- [ ] Task: Calculate segment midpoints
    - [ ] Write failing test for midpoint calculation
    - [ ] Implement utility to calculate midpoints between all polygon vertices
- [ ] Task: Render '+' icons at midpoints
    - [ ] Write failing test for midpoint icon rendering
    - [ ] Implement rendering of '+' icons on the map layer
- [ ] Task: Conductor - User Manual Verification 'Midpoint Plus Icons' (Protocol in workflow.md)

## Phase 3: Add Vertex Interaction
- [ ] Task: Implement click handler for '+' icons
    - [ ] Write failing test for adding vertex via click
    - [ ] Implement logic to insert new vertex into polygon coordinates array
- [ ] Task: Update OSM data fetching and routing
    - [ ] Write failing test for trigger refresh on polygon change
    - [ ] Ensure `updatePolygon` is called when a vertex is added or moved
- [ ] Task: Conductor - User Manual Verification 'Add Vertex Interaction' (Protocol in workflow.md)

## Phase 4: Final Integration & Mobile Optimization
- [ ] Task: Mobile touch interaction polish
    - [ ] Write failing test for touch-based dragging
    - [ ] Ensure '+' icons are large enough for touch targets
- [ ] Task: Final verification and cleanup
    - [ ] Run full test suite
    - [ ] Verify UX consistency with project guidelines
- [ ] Task: Conductor - User Manual Verification 'Final Integration & Mobile Optimization' (Protocol in workflow.md)
