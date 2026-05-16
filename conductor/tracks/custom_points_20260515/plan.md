# Implementation Plan - Custom Start and End Points

## Phase 1: Backend API Enhancements [checkpoint: c38cc90]
- [x] Task: Update `GraphData` and `RoutingService` to accept optional start/end coordinates
- [x] Task: Implement 'Nearest Node' lookup logic in the backend
- [x] Task: Update routing logic to connect start/end points to the main Eulerian circuit
- [x] Task: Write tests for start/end point connectivity in the graph
- [x] Task: Conductor - User Manual Verification 'Backend API Enhancements' (Protocol in workflow.md)

## Phase 2: Frontend Map Interaction [checkpoint: 7676e64]
- [x] Task: Implement long-press event handling in `Map.tsx` to set markers
- [x] Task: Create UI buttons in the overlay for manual point setting
- [x] Task: Visualize start and end markers on the map
- [x] Task: Write component tests for point selection logic
- [x] Task: Conductor - User Manual Verification 'Frontend Map Interaction' (Protocol in workflow.md)

## Phase 3: Integration & Fallbacks
- [~] Task: Implement auto-detection logic using user's current location if no start point is set
- [ ] Task: Pass coordinates to the `/generate-route` call
- [ ] Task: Final verification of the end-to-end routing flow with custom points
- [ ] Task: Conductor - User Manual Verification 'Integration & Fallbacks' (Protocol in workflow.md)
