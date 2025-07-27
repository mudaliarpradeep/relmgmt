# Release Management System: System Architecture (MVP)

## 1. Overview

The Release Management System (RMS) is designed as a modern web application following a client-server architecture. This document outlines the technical architecture, components, data flow, and deployment considerations for the system.

## 2. High-Level Architecture

The system follows a 3-tier architecture:

1. **Presentation Layer**: React-based frontend application
2. **Application Layer**: Spring Boot REST API backend with versioning
3. **Data Layer**: PostgreSQL database with transaction logging

## 3. Component Diagram

```mermaid
flowchart TD
    PL[Presentation Layer<br>React/Vite] <-- REST API --> AL[Application Layer<br>Spring Boot]
    AL <-- JDBC --> DL[Data Layer<br>PostgreSQL]
    AL --> AS[Audit Service]
    AL --> NS[Notification Service]
    DL --> TL[Transaction Logs]
    DL --> NL[Notification Logs]
```

## 4. Detailed Component Architecture

### 4.1 Presentation Layer

The frontend is built using React 19.1.0 with the following key components:

- **Vite**: Build tool and development server
- **ShadCB UI**: Component library for consistent UI elements
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management
- **Recharts/Chart.js**: For Gantt charts and other visualizations

#### Key Frontend Modules:

1. **Authentication Module**: Handles user login and session management (simplified for MVP)
2. **Resource Management Module**: CRUD operations for resource roster
3. **Release Planning Module**: Creation and management of releases
4. **Project Management Module**: Management of projects within releases
5. **Scope Management Module**: Management of scope items and estimates
6. **Visualization Module**: Gantt charts and capacity views
7. **Dashboard Module**: Overview and summary information
8. **Reporting Module**: Generation and export of reports
9. **Notification Module**: Display and management of system notifications
10. **Audit Module**: Interface for viewing and searching transaction logs

### 4.2 Application Layer

The backend is built using Spring Boot 3.5.4 with Java 21, structured into the following layers:

- **API Controllers**: REST endpoints for client communication with versioning
- **Service Layer**: Business logic implementation
- **Repository Layer**: Data access and persistence
- **Domain Model**: Entity definitions
- **DTOs**: Data transfer objects for API communication
- **Utilities**: Helper classes and common functionality
- **Audit Aspect**: Cross-cutting concern for transaction logging
- **Notification Service**: Event-based notification generation and management

#### Key Backend Modules:

1. **Authentication**: Simple user authentication (single user for MVP)
2. **Resource Management**: Resource roster operations
3. **Release Management**: Release and phase operations
4. **Project Management**: Project operations
5. **Scope Management**: Scope items and effort estimates
6. **Allocation Engine**: Resource allocation algorithm based on defined rules
7. **File Import/Export**: Excel file processing
8. **Reporting Service**: Generation of standard reports
9. **Notification Service**: Management of system notifications
10. **Audit Service**: Transaction logging and audit trail management

### 4.3 Data Layer

The data layer uses PostgreSQL 17 with the following schema design:

- **Users**: Authentication information (simplified for MVP - single user)
- **Resources**: Resource roster data including status and project dates
- **Releases**: Release information including name and blockers
- **Projects**: Project information that belongs to releases
  - id: Primary key
  - release_id: Foreign key to releases
  - name: Project name
  - description: Project description
  - type: Project type (Day 1 or Day 2)
  - created_at: Creation timestamp
  - updated_at: Last update timestamp
- **Phases**: Release phase definitions
- **ScopeItems**: Scope items for projects
- **EffortEstimates**: Effort estimates by skill and phase
- **Allocations**: Resource allocations to releases
- **Notifications**: System notifications and their status
- **TransactionLogs**: Detailed records of all data modifications
- **AuditTrail**: System-level audit events

#### 4.3.1 Transaction Logging Schema

The transaction logging schema includes:

```sql
CREATE TABLE transaction_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action_type VARCHAR(10) NOT NULL, -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(50) NOT NULL, -- Resource, Release, Project, etc.
    entity_id INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    old_values JSONB,
    new_values JSONB,
    additional_info JSONB
);

CREATE INDEX idx_transaction_logs_entity ON transaction_logs(entity_type, entity_id);
CREATE INDEX idx_transaction_logs_user ON transaction_logs(user_id);
CREATE INDEX idx_transaction_logs_timestamp ON transaction_logs(timestamp);
```

#### 4.3.2 Notification Schema

The notification schema includes:

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- ALLOCATION_CONFLICT, OVER_ALLOCATION, DEADLINE_APPROACHING, BLOCKER_ADDED, BLOCKER_RESOLVED
    entity_type VARCHAR(50) NOT NULL, -- Resource, Release, Phase, etc.
    entity_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## 5. Data Flow

### 5.1 Resource Roster Management

1. User uploads Excel file or manually enters resource data
2. Frontend sends data to backend API
3. Backend validates data and stores in database
4. Audit service logs the transaction with before/after values
5. Confirmation returned to frontend

#### 5.1.1 Resource Deletion

1. User requests to delete a resource
2. Frontend sends deletion request to backend API
3. Backend checks if the resource is allocated to any active release (release with production go-live date in the future)
4. If resource is allocated to active release(s):
   - Backend returns HTTP 409 Conflict with details of the active allocations
   - Frontend displays error message to the user
5. If resource is not allocated to any active release:
   - Backend deletes the resource
   - Audit service logs the deletion
   - Confirmation returned to frontend

### 5.2 Release Planning

1. User creates release with name, phase information, and blockers
2. Frontend sends data to backend API
3. Backend validates and stores release data
4. Audit service logs the transaction
5. User adds projects to the release
6. Backend stores project data
7. Audit service logs the transaction

### 5.3 Project and Scope Management

1. User adds scope items to a project
2. User provides effort estimates for each scope item
3. Backend stores scope and estimate data
4. Audit service logs each transaction

### 5.4 Resource Allocation

1. User requests resource allocation for a release
2. Backend allocation engine:
   - Retrieves release, phase, project, scope, and resource data
   - Applies allocation rules
   - Generates allocation plan
   - Flags resources with over-allocation across releases
   - Stores allocation data
3. Audit service logs the allocation transactions
4. Allocation results returned to frontend
5. Frontend displays allocation in grid/Gantt views with appropriate color coding

### 5.5 Reporting and Export

1. User selects a report type to generate
2. Backend retrieves and processes relevant data
3. Report data is returned to frontend
4. Frontend displays the report with visualizations
5. User can export the report to Excel format

### 5.6 Notification Flow

1. System event triggers notification creation (e.g., allocation conflict detected)
2. Notification service creates notification record
3. Frontend polls for new notifications or receives via WebSocket (future enhancement)
4. User views notifications in notification center
5. User marks notifications as read
6. Notification service updates notification status

### 5.7 Audit Trail Access

1. User accesses the audit log interface
2. User applies filters (date range, action type, entity)
3. Backend retrieves filtered transaction logs
4. Frontend displays the audit trail with pagination
5. User can export the audit data to CSV/Excel if needed

## 6. API Design

The system exposes a RESTful API with versioning and the following key endpoints:

### 6.1 API Versioning

- All API endpoints are versioned using URL path versioning
- Format: `/api/v1/{resource}`
- Initial version is v1
- When breaking changes are required, a new version (v2) will be introduced
- Previous versions will be maintained for backward compatibility

### 6.2 Authentication

- `POST /api/v1/auth/login`: User authentication
- `POST /api/v1/auth/logout`: User logout

### 6.3 Resource Management

- `GET /api/v1/resources`: List all resources
- `POST /api/v1/resources`: Create new resource
- `PUT /api/v1/resources/{id}`: Update resource
- `DELETE /api/v1/resources/{id}`: Delete resource
- `POST /api/v1/resources/import`: Import resources from Excel
- `GET /api/v1/resources/export`: Export resource roster to Excel

### 6.4 Release Management

- `GET /api/v1/releases`: List all releases
- `POST /api/v1/releases`: Create new release
- `PUT /api/v1/releases/{id}`: Update release
- `DELETE /api/v1/releases/{id}`: Delete release
- `GET /api/v1/releases/{id}/phases`: Get phases for a release
- `POST /api/v1/releases/{id}/blockers`: Add blocker to release
- `DELETE /api/v1/releases/{id}/blockers/{blockerId}`: Remove blocker from release

### 6.5 Project Management

- `GET /api/v1/releases/{id}/projects`: Get projects for a release
- `POST /api/v1/releases/{id}/projects`: Add project to release
- `PUT /api/v1/projects/{id}`: Update project
- `DELETE /api/v1/projects/{id}`: Delete project

### 6.6 Scope Management

- `GET /api/v1/projects/{id}/scope`: Get scope items for a project
- `POST /api/v1/projects/{id}/scope`: Add scope item to project
- `PUT /api/v1/scope/{id}`: Update scope item
- `DELETE /api/v1/scope/{id}`: Delete scope item
- `POST /api/v1/scope/{id}/estimates`: Add effort estimates to scope item

### 6.7 Allocation

- `POST /api/v1/releases/{id}/allocate`: Generate resource allocation
- `GET /api/v1/releases/{id}/allocations`: Get allocations for a release
- `GET /api/v1/resources/{id}/allocations`: Get allocations for a resource
- `GET /api/v1/allocations/conflicts`: Get allocation conflicts

### 6.8 Notifications

- `GET /api/v1/notifications`: Get user notifications
- `PUT /api/v1/notifications/{id}/read`: Mark notification as read
- `PUT /api/v1/notifications/read-all`: Mark all notifications as read
- `DELETE /api/v1/notifications/{id}`: Delete notification

### 6.9 Reports

- `GET /api/v1/reports/resource-utilization`: Generate resource utilization report
- `GET /api/v1/reports/release-timeline`: Generate release timeline report
- `GET /api/v1/reports/allocation-conflicts`: Generate allocation conflicts report
- `GET /api/v1/reports/capacity-forecast`: Generate capacity forecast report
- `GET /api/v1/reports/skill-capacity-forecast`: Generate skill-based capacity forecast report
- `GET /api/v1/reports/{reportType}/export`: Export report to Excel

### 6.10 Audit Trail

- `GET /api/v1/audit/logs`: Get transaction logs with filtering
- `GET /api/v1/audit/logs/{id}`: Get details of a specific transaction
- `GET /api/v1/audit/export`: Export audit logs to CSV/Excel

## 7. Security Architecture

### 7.1 Authentication & Authorization

- Simple authentication mechanism for single user (MVP)
- JWT-based authentication
- HTTPS for all communication

### 7.2 Data Protection

- Encryption of sensitive data at rest
- Input validation to prevent injection attacks
- CSRF protection

### 7.3 Audit Security

- Immutable transaction logs (append-only)
- Audit log integrity verification
- Tamper-evident logging with cryptographic signatures

## 8. Deployment Architecture

### 8.1 Docker Containerization

The Release Management System will be deployed using Docker containers to ensure consistency across environments and simplify deployment:

1. **Docker Images**:
   - Frontend: Multi-stage build with Node.js for building and Nginx for serving
   - Backend: Multi-stage build with Maven for building and JRE for running
   - Database: PostgreSQL official image

2. **Docker Compose**:
   - Development environment configuration
   - Testing environment configuration
   - Production environment configuration

3. **Container Orchestration**:
   - Local development: Docker Compose
   - Production: Docker Compose (MVP), with potential for Kubernetes in future versions

4. **Docker Network**:
   - Dedicated network (`relmgmtnet`) for secure service communication
   - Proper isolation between components

5. **Docker Volumes**:
   - Database persistence
   - Log persistence
   - Configuration files

6. **Environment Configuration**:
   - Environment variables for different deployment environments
   - External configuration mounting

7. **CI/CD Integration**:
   - Automated Docker builds in CI/CD pipeline
   - Automated testing in containers
   - Container registry integration

The Docker-based deployment architecture provides consistency, isolation, and scalability while simplifying the development and deployment process.

### 8.2 Infrastructure Requirements

```mermaid
flowchart LR
    ReactDev[React Dev<br>Server (Vite)] --- SpringBoot[Spring Boot<br>(Local)] --- PostgreSQL[PostgreSQL<br>(Docker)]
```

### 8.3 Container Configuration

Docker Compose configuration for local development:

```yaml
version: '3.8'

services:
  relmgmtpostgres:
    image: postgres:17
    container_name: relmgmtpostgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: relmgmt
    ports:
      - '5432:5432'
    volumes:
      - relmgmt_postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d

  pgadmin:
    image: dpage/pgadmin4:8
    container_name: pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
    ports:
      - '5050:80'
    depends_on:
      - relmgmtpostgres

volumes:
  relmgmt_postgres_data:
```

## 9. Performance Considerations

### 9.1 Database Optimization

- Indexing on frequently queried fields
- Pagination for large result sets
- Query optimization for complex allocation calculations
- Partitioning of transaction logs by time period
- Separate tablespace for audit logs to minimize impact on operational performance

### 9.2 Application Optimization

- Caching of frequently accessed data
- Asynchronous processing for resource-intensive operations
- Batch processing for bulk operations
- Asynchronous transaction logging to minimize impact on response times

### 9.3 Frontend Optimization

- Code splitting for faster initial load
- Lazy loading of components
- Virtualization for large data grids
- Pagination for audit log display

## 10. Monitoring and Logging

### 10.1 Application Monitoring

- Spring Boot Actuator endpoints for health and metrics
- Prometheus for metrics collection
- Grafana for visualization

### 10.2 Logging

- Structured logging with SLF4J
- Log aggregation with ELK stack (optional)
- Transaction tracing

### 10.3 Audit Monitoring

- Alerts for unusual audit log patterns
- Regular integrity checks on transaction logs
- Monitoring of audit log storage capacity
- Periodic audit log verification

## 11. Backup and Recovery

### 11.1 Database Backup

- Regular automated backups of PostgreSQL database
- Point-in-time recovery capability
- Backup retention policy
- Separate backup strategy for transaction logs

### 11.2 Application Backup

- Configuration backup
- Deployment artifacts versioning

### 11.3 Audit Log Backup

- Immutable backups of transaction logs
- Cryptographically signed backups
- Separate retention policy for audit logs (minimum 3 years)

## 12. Scalability Considerations

### 12.1 Horizontal Scaling

- Stateless backend design for horizontal scaling
- Load balancing for API servers

### 12.2 Vertical Scaling

- Database resource allocation based on data volume
- JVM tuning for backend performance

### 12.3 Audit Log Scaling

- Partitioning strategy for transaction logs
- Archive strategy for older audit data
- Read replicas for audit reporting queries

## 13. Future Architecture Considerations

- Role-based access control for multiple users
- Microservices architecture for larger scale
- Event-driven architecture for real-time updates
- Integration with external HR and project management systems
- Advanced analytics on audit data for security intelligence
- Support for release dependencies and prerequisites
- Real-time notifications via WebSockets
- Enhanced API versioning with content negotiation 

## 10. Development Methodology

### 10.1 Test-Driven Development Approach

The Release Management System will be developed following a Test-Driven Development (TDD) approach:

1. **Write Tests First**: For each component and functionality, tests will be written before implementation.
2. **Red-Green-Refactor Cycle**:
   - Red: Write a failing test that defines the expected behavior
   - Green: Write the minimal code necessary to make the test pass
   - Refactor: Improve the code while ensuring tests continue to pass
3. **Comprehensive Test Coverage**:
   - Backend: Unit tests for services, integration tests for controllers, repository tests
   - Frontend: Component tests, hook tests, service tests, end-to-end tests
4. **Continuous Integration**:
   - Automated test execution on each commit
   - Test coverage reporting
   - Build failures on test failures or insufficient coverage

### 10.2 Test Infrastructure

1. **Backend Testing**:
   - JUnit 5 and Mockito for unit and integration tests
   - TestContainers for database integration tests
   - JaCoCo for test coverage reporting

2. **Frontend Testing**:
   - Vitest and React Testing Library for component and hook tests
   - MSW (Mock Service Worker) for API mocking
   - Cypress for end-to-end testing
   - Storybook for component documentation and visual testing

3. **Test Coverage Goals**:
   - Backend: Minimum 75% overall, 80% for service layer
   - Frontend: Minimum 75% overall, 80% for components 