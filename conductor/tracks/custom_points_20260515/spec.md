# Specification - Custom Start and End Points

## Overview
Currently, the routing algorithm automatically picks a starting node from the graph. This track introduces the ability for users to manually define where their route should start and end, with an intelligent fallback to their current location if not specified.

## Functional Requirements
- **Manual Point Selection:** Users can set start and end points via a long-press on the map or dedicated sidebar buttons.
- **Visual Feedback:** Distinct markers for 'Start' (e.g., green marker) and 'End' (e.g., checkered flag) appear on the map.
- **Auto-Detection Fallback:** If no points are set, the system uses the user's current GPS location as the starting point.
- **Flexible Positioning:** Start and end points are not restricted to the polygon; the algorithm will calculate the shortest path from the start point to the coverage area and from the coverage area to the end point.
- **Independent End Points:** Supports non-looping routes where the end point differs from the start.

## Technical Requirements
- **Frontend:**
  - Add MapLibre event listeners for long-press events.
  - Integrate markers into the `Map.tsx` state.
  - Update `generate-route` API payload to include optional `start_node` and `end_node` coordinates.
- **Backend:**
  - Enhance `RoutingService` to find the nearest graph nodes to the user-defined coordinates.
  - Prepend/Append shortest paths from these points to the Eulerian circuit.

## Acceptance Criteria
- User can successfully set a start point that is visually confirmed on the map.
- If no start point is set, the route begins at the user's current location.
- The exported GPX file includes the approach and departure paths from/to the custom points.
