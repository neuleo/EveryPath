# EveryPath - Technology Stack

## Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Key Libraries:**
    - **NetworkX:** For graph theory operations and solving the Chinese Postman Problem.
    - **GeoPandas / Shapely:** For processing geospatial polygons and path segments.
    - **SQLAlchemy:** As the ORM for database interaction.
- **API Design:** RESTful API with automated Swagger/OpenAPI documentation.

## Frontend
- **Framework:** React 18+ (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (for the High-Contrast Dark Mode)
- **Mapping:** MapLibre GL JS (Vector maps with WebGL acceleration)
- **State Management:** React Query (for API data fetching) or Zustand.

## Database
- **Engine:** SQLite with **SpatiaLite** extension.
- **Rationale:** Portability is the priority. The entire application state (users, polygons, coverage history) is stored in a single `.sqlite` file, allowing the instance to be easily backed up or moved between machines.

## Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose.
- **Environment:**
    - `backend` container (Python/FastAPI)
    - `frontend` container (React/Vite/Nginx)
- **Development:** Volume-mounts and hot-reloading for both frontend and backend.
- **Navigation Export:** GPX (XML-based) format.
