# Specification - Foundation: Docker Setup and Core Routing API

## Overview
This track establishes the structural foundation of the EveryPath application. It focuses on the containerized development environment, the portable database setup, and the initial backend API for solving the Chinese Postman Problem (CPP).

## Goals
- Scaffold a multi-container Docker environment (Backend, Frontend).
- Integrate SQLite with the SpatiaLite extension for geospatial data.
- Implement the core routing service skeleton using Python, FastAPI, and NetworkX.
- Ensure the project is ready for iterative feature development following the Conductor workflow.

## Technical Requirements
- **Docker Compose:** Define services for `backend` (FastAPI) and `frontend` (React/Vite).
- **Python Backend:**
  - FastAPI for the web framework.
  - SQLAlchemy for ORM.
  - NetworkX for graph theory and CPP algorithms.
- **Geospatial Database:** SQLite + SpatiaLite extension.
- **Frontend Scaffold:** React with TypeScript and Tailwind CSS using Vite.

## Acceptance Criteria
- Both frontend and backend containers start successfully via `docker-compose up`.
- A "Hello World" API endpoint is accessible.
- SpatiaLite queries can be executed against the SQLite database.
- A dummy graph can be processed by a NetworkX-based service.
