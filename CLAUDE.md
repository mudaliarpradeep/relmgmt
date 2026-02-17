# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Release Management System (RMS) - A full-stack application for project and staffing planning. 3-tier architecture: React 19 + Spring Boot 3.5.4 + PostgreSQL 17.5.

## Essential Commands

### Backend (Java/Gradle)
```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=dev'  # Start dev server
./gradlew test                                            # Run all tests
./gradlew test --tests "*.ResourceServiceTest"            # Run single test class
./gradlew test --tests "*ResourceServiceTest.testMethod"  # Run single test method
./gradlew jacocoTestReport                                # Generate coverage report
```

### Frontend (React/Vite)
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Dev server at http://localhost:3000
npm test                       # Run tests
npm test -- ResourceList       # Run tests matching pattern
npm run lint                   # ESLint (zero warnings enforced)
npm run format                 # Prettier formatting
npm run storybook              # Component docs at http://localhost:6006
```

### Docker
```bash
cd docker
docker-compose up -d           # Start all services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

## Architecture

### Backend Structure (`backend/src/main/java/com/polycoder/relmgmt/`)
- **controller/v1/** - REST endpoints (versioned at `/api/v1/*`)
- **service/impl/** - Business logic with interfaces
- **repository/** - Spring Data JPA repositories
- **entity/** - JPA domain entities
- **dto/** - Data Transfer Objects
- **config/** - Spring configuration (Security, OpenAPI)
- **security/** - JWT authentication (`JwtTokenProvider`, `JwtAuthenticationFilter`)

### Frontend Structure (`frontend/src/`)
- **pages/** - Route-level components (releases, scope, resources, allocation)
- **components/** - Reusable UI (layout, forms, charts, ui/)
- **hooks/** - Custom hooks (`useAuth`, `useNotifications`)
- **lib/** - Utilities including `capacity.ts` for calculations
- **types/** - TypeScript type definitions
- **test/** - Test setup with MSW mock server

### Key Patterns
- **State Management**: React Query for server state, Context for auth/notifications
- **Forms**: React Hook Form + Zod validation
- **API Mocking**: MSW (Mock Service Worker) for tests
- **Database Migrations**: Flyway SQL in `backend/src/main/resources/db/migration/`

## Testing

- **Backend**: JUnit 5 + Mockito + TestContainers (PostgreSQL)
- **Frontend**: Vitest + React Testing Library + MSW
- **Test profiles**: `application-test.yml` uses H2 in-memory database
- **Frontend test setup**: `frontend/src/test/setup.ts` with MSW server

## Configuration

- **Profiles**: `dev` (local PostgreSQL), `test` (H2/TestContainers), `prod` (optimized)
- **JWT**: Configured in `SecurityConfig`, tokens via `JwtTokenProvider`
- **CORS**: Configured in Spring Security

## Key Documentation

Before making significant changes, review:
- `docs/PRD-Release_Management_System.md` - Product requirements
- `docs/system-architecture.md` - Component relationships
- `docs/backend-technical-specification.md` - Backend implementation details
- `docs/frontend-technical-specification.md` - Frontend implementation details
- `docs/status.md` - Current project state

## Development Workflow

This project uses TDD:
1. Write tests first
2. Implement to pass tests
3. Update `docs/status.md` with progress

Commit convention: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
