# Implementation Plan - Foundation: Docker Setup and Core Routing API

## Phase 1: Project Scaffolding & Dockerization
- [x] Task: Create root-level Docker and Docker Compose configuration (00c7d80)
    - [x] Write `docker-compose.yml` defining `backend` and `frontend` services
    - [x] Create `backend/Dockerfile` (Python 3.11-slim)
    - [x] Create `frontend/Dockerfile` (Node.js/Nginx)
- [ ] Task: Initialize Python Backend
    - [ ] Setup `requirements.txt` with FastAPI, Uvicorn, SQLAlchemy, NetworkX, and GeoPandas
    - [ ] Create basic `main.py` with a health check endpoint
- [ ] Task: Initialize React Frontend
    - [ ] Scaffold React project with Vite, TypeScript, and Tailwind CSS
    - [ ] Verify frontend connects to backend health check
- [ ] Task: Conductor - User Manual Verification 'Project Scaffolding & Dockerization' (Protocol in workflow.md)

## Phase 2: Database & SpatiaLite Integration
- [ ] Task: Setup SQLite/SpatiaLite in Backend
    - [ ] Configure Dockerfile to install `libsqlite3-mod-spatialite`
    - [ ] Create database connection utility in Python
- [ ] Task: Write Tests for Geospatial Queries
    - [ ] Write unit tests to verify spatial functions (e.g., `ST_AsText`) work in the container
- [ ] Task: Implement Database Initialization
    - [ ] Create a script to initialize the SQLite database with SpatiaLite extensions
- [ ] Task: Conductor - User Manual Verification 'Database & SpatiaLite Integration' (Protocol in workflow.md)

## Phase 3: Core Routing Service (CPP Foundation)
- [ ] Task: Write Tests for CPP Routing Service
    - [ ] Create test case with a simple Eulerian graph (4 nodes, 4 edges)
    - [ ] Create test case with a non-Eulerian graph requiring edge augmentation
- [ ] Task: Implement Routing Service Skeleton
    - [ ] Implement service using NetworkX to identify odd-degree nodes
    - [ ] Implement logic for minimum weight perfect matching on odd nodes
- [ ] Task: Conductor - User Manual Verification 'Core Routing Service (CPP Foundation)' (Protocol in workflow.md)

## Phase 4: API & Export Foundation
- [ ] Task: Implement Route Generation API Endpoint
    - [ ] Create POST endpoint that accepts a simple graph JSON and returns an Eulerian circuit
- [ ] Task: Implement GPX Export Utility
    - [ ] Write unit tests for GPX XML generation
    - [ ] Implement utility to convert a list of coordinates into a `.gpx` file
- [ ] Task: Conductor - User Manual Verification 'API & Export Foundation' (Protocol in workflow.md)
