# Specification - Surface Filtering (Asphalt vs. Gravel/Forest)

## Overview
Implement surface recognition to allow users to filter routes based on the path surface (e.g., paved vs. unpaved), tailoring the route to specific vehicles like road bikes or mountain bikes.

## Goals
- Update OSM fetch logic to extract and preserve `surface` tags.
- Categorize surfaces into broad buckets (e.g., Paved, Unpaved, Unknown).
- Add UI controls to select desired surface types.
- Update routing logic to filter out edges that do not match the selected surface criteria before calculating the Eulerian circuit.

## Acceptance Criteria
- User can toggle "Paved Only" or "Unpaved Only" in the UI.
- The backend correctly filters edges based on OSM `surface` tags.
- The resulting route only traverses paths matching the selected criteria.