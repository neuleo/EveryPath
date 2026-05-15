# Specification - Coverage History Overlay and Persistence

## Overview
Implement the ability to save generated routes to a user's profile and display a visual overlay of all previously covered paths on the map.

## Goals
- Add database models to store generated routes (Polylines) associated with a User.
- Implement an API endpoint to fetch a user's accumulated coverage.
- Add a map layer in the frontend to display the coverage history.
- Ensure the history overlay remains visible during new planning sessions.

## Acceptance Criteria
- Saving a route associates it with the logged-in user.
- The map displays a distinct visual layer (e.g., bright purple or neon orange) showing all past routes.
- The history overlay can be toggled on/off via the UI.