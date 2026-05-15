# Implementation Plan - User Authentication, Registration, and Management

## Phase 1: Backend Auth Infrastructure
- [ ] Task: Create `User` SQLAlchemy model and migration
- [ ] Task: Implement password hashing and JWT token generation
- [ ] Task: Create `/register`, `/login`, and `/me` endpoints

## Phase 2: Frontend Auth UI
- [ ] Task: Build Login and Registration forms/modals
- [ ] Task: Implement global AuthContext/State in React
- [ ] Task: Update UI to show user status (e.g., avatar, logout button)

## Phase 3: API Protection
- [ ] Task: Add dependency injection in backend to protect sensitive routes
- [ ] Task: Handle 401 Unauthorized responses in frontend (auto-logout)