# Specification - Progress Dashboard and Route Elevation Profile

## Overview
Enhance the user experience by providing analytical data about their routes: a dashboard showing overall completion progress and an elevation profile for specific generated routes.

## Goals
- Calculate and display overall coverage progress (e.g., percentage of roads in a saved polygon that have been covered).
- Fetch elevation data for generated routes using a free API (e.g., Open-Elevation or Open-Meteo).
- Visualize the elevation profile in the frontend.

## Acceptance Criteria
- User can see a progress metric (e.g., "75% of Forest X completed").
- A chart or graph displays the elevation changes along the calculated route.
- Elevation data is included in the exported GPX file.