# Specification - Enhanced Polygon Editing

## Overview
This feature improves the user experience for defining areas by allowing easier manipulation of the selection polygon. Users will be able to drag existing vertices and add new ones via intuitive "plus" icons on segment midpoints.

## Functional Requirements
- **Vertex Dragging:** Users can select any existing polygon vertex and drag it to a new location.
- **Midpoint Plus Icons:** The application will display a '+' icon at the midpoint of every segment between two vertices.
- **Add Vertex:** Clicking a '+' icon creates a new vertex at that location, effectively splitting the segment into two.
- **Ghost Vertex:** While dragging a vertex, a "ghost" or semi-transparent indicator should show the new position before the move is finalized.
- **Free Placement:** Vertices can be placed freely on the map (no snapping to road nodes).
- **Update Routing:** Any change to the polygon should trigger a refresh of the fetched OSM data and potentially clear the current route if it no longer fits the area.

## Non-Functional Requirements
- **Performance:** Adding/moving vertices should feel fluid and not cause lag in map rendering.
- **Touch Support:** Dragging and clicking '+' icons must work on mobile devices.

## Acceptance Criteria
- [ ] User can drag an existing vertex to change the polygon shape.
- [ ] '+' icons appear between all vertices.
- [ ] Clicking a '+' icon adds a new vertex.
- [ ] The polygon remains valid (closed) throughout editing.
- [ ] The feature works on both desktop and mobile.

## Out of Scope
- Snapping to road networks.
- Undo/Redo for individual vertex moves (clearing the polygon is already supported).
