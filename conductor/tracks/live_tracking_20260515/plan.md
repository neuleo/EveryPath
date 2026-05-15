# Implementation Plan - Real-time Live Tracking

## Phase 1: Browser Geolocation
- [ ] Task: Implement `navigator.geolocation.watchPosition` logic in frontend
- [ ] Task: Create a React state to hold the live coordinate array
- [ ] Task: Draw the live track as a distinct LineString layer on the map

## Phase 2: Session Management
- [ ] Task: Add UI controls (Start, Pause, Resume, Finish Activity)
- [ ] Task: Calculate live distance and duration in the UI

## Phase 3: Backend Sync
- [ ] Task: Create endpoint `/api/sessions/save` to receive the recorded track
- [ ] Task: Merge the saved session into the user's overall Coverage History layer