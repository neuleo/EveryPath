# Specification - User Authentication, Registration, and Management

## Overview
Implement user accounts to allow individuals to save their settings, polygons, and coverage history.

## Goals
- Create User database model.
- Implement JWT-based authentication in the FastAPI backend.
- Build Registration and Login UI in the React frontend.
- Protect API routes that require user identity.

## Acceptance Criteria
- User can register an account and log in.
- Sessions are maintained using secure JWT tokens.
- UI changes state based on authentication status (e.g., showing user profile vs login button).