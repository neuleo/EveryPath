# Specification - Real-time Live Tracking and Session Recording

## Overview
As part of Phase 2, this track introduces the ability for users to record their activities live directly within the web app via the Geolocation API, comparing their actual movement against the planned route.

## Goals
- Continuously poll the browser's Geolocation API to record a GPS track.
- Visually indicate the user's progress along the planned route in real-time.
- Save the completed live session to the user's coverage history.
- Handle connection drops gracefully.

## Acceptance Criteria
- User can press a "Start Activity" button.
- The map centers on the user and leaves a trail of their actual movement.
- When finished, the track is synced to the backend and added to their global coverage.