# Release Management System: Local Development Setup Guide

This guide provides step-by-step instructions for setting up the Release Management System development environment on your local machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Docker Environment Setup](#docker-environment-setup)
6. [Running the Application](#running-the-application)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Git** (2.30.0 or later)
- **Docker** (20.10.0 or later) and **Docker Compose** (2.0.0 or later)
- **Java Development Kit (JDK)** (21 or later)
- **Gradle** (7.0 or later, or use included wrapper)
- **Node.js** (20.0.0 or later) and **npm** (9.0.0 or later)
- **IDE** of your choice (IntelliJ IDEA, VS Code, Eclipse, etc.)

You can verify the installations with the following commands:

```bash
git --version
docker --version
docker-compose --version
java --version
./gradlew --version
node --version
npm --version
```

## Repository Setup

1. Clone the repository:

```bash
git clone https://github.com/your-organization/relmgmt.git
cd relmgmt
```

2. Set up Git hooks (optional but recommended):

```bash
cp hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

## Backend Setup

### Option 1: Local Setup (without Docker)

1. Navigate to the backend directory:

```bash
cd relmgmt/backend
```

2. Install Gradle dependencies:

```bash
./gradlew build -x test
```

3. Set up the local PostgreSQL database:
   - Install PostgreSQL 17.5
   - Create a database named `relmgmt`
   - Create a user with username `postgres` and password `bBzp16eHfA29wZUvr`
   - Grant all privileges on the `relmgmt` database to the user

4. Configure the application:
   - The application uses existing configuration files in `src/main/resources/`
   - Environment-specific settings are in `application-dev.yml`, `application-test.yml`
   - Update database connection properties if using different credentials

5. Run the application:

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Option 2: Docker Setup (Recommended)

The backend can be run in a Docker container, which is covered in the [Docker Environment Setup](#docker-environment-setup) section.

## Frontend Setup

### Option 1: Local Setup (without Docker)

1. Navigate to the frontend directory:

```bash
cd relmgmt/frontend
```

2. Install npm dependencies:

```bash
npm install
```

3. Configure the application:
   - Create a `.env.local` file with environment variables
   - Set `VITE_API_URL=http://localhost:8080/api/v1`

4. Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

5. (Optional) Start Storybook for component development:

```bash
npm run storybook
```

Storybook will be available at `http://localhost:6006`.

### Option 2: Docker Setup (Recommended)

The frontend can be run in a Docker container, which is covered in the [Docker Environment Setup](#docker-environment-setup) section.

## Docker Environment Setup

The recommended way to run the application is using Docker Compose, which sets up all the required services.

1. Navigate to the docker directory:

```bash
cd relmgmt/docker
```

2. Create a `.env` file for environment variables:

```bash
# Create .env file with required variables
cat > .env << EOF
POSTGRES_PASSWORD=bBzp16eHfA29wZUvr
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=devpgadmin
EOF
```

3. Update the environment variables in the `.env` file if needed.

4. Start the Docker containers:

```bash
docker compose up -d
```

This will start the following services:
- PostgreSQL database (`relmgmtpostgres`) on port 5432
- pgAdmin (`pgadmin`) on port 5050
- Backend API (`relmgmt-backend`) on port 8080
- Frontend (`relmgmt-frontend`) on port 3000

**Note**: The backend is configured with CORS to allow cross-origin requests from the frontend. No additional configuration is required for local development.

5. Check if the containers are running:

```bash
docker compose ps
```

## Running the Application

### Using Docker (Recommended)

If you're using Docker Compose as described above, the application should already be running:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
   - pgAdmin: `http://localhost:5050` (login with email: `admin@example.com`, password: `devpgadmin`)

### Running Locally

If you're running the application locally:

1. Start the backend:

```bash
cd relmgmt/backend
./gradlew bootRun --args='--spring.profiles.active=dev'
```

2. Start the frontend (in a new terminal):

```bash
cd relmgmt/frontend
npm run dev
```

3. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8080/api/v1`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

**Note**: When running locally, ensure both frontend and backend are running on their respective ports. The backend CORS configuration allows requests from `http://localhost:3000`.

## Development Workflow

### Test-Driven Development

The project follows a Test-Driven Development (TDD) approach:

1. Write a failing test for the feature you're implementing
2. Run the test to verify it fails
3. Implement the feature
4. Run the test again to verify it passes
5. Refactor your code if needed, ensuring tests still pass

### Backend Development

1. Create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

2. Write tests for your feature in the appropriate test directory.

3. Implement your feature, following the TDD approach.

4. Run tests:

```bash
./gradlew test
```

5. Run the application to manually test:

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Frontend Development

1. Create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

2. Write tests for your component or feature:

```bash
npm run test
```

3. Implement your feature, following the TDD approach.

4. Run the development server:

```bash
npm run dev
```

5. Lint your code:

```bash
npm run lint
```

### Database Changes

1. Create a new Flyway migration script in `relmgmt/backend/src/main/resources/db/migration`:
   - Name format: `V{version}__{description}.sql`
   - Example: `V2__add_notifications_table.sql`

2. Write the SQL for your database changes.

3. Run the application to apply the migration.

## Troubleshooting

### Docker Issues

1. **Container fails to start**:
   - Check container logs: `docker compose logs [service-name]`
   - Ensure ports are not already in use
   - Verify environment variables in `.env` file

2. **Database connection issues**:
   - Ensure the PostgreSQL container is running: `docker compose ps`
   - Check database logs: `docker compose logs relmgmtpostgres`
   - Verify connection settings in application configuration

3. **Reset the environment**:
   - Stop and remove containers: `docker compose down`
   - Remove volumes (caution: this will delete all data): `docker compose down -v`
   - Rebuild and start: `docker compose up -d --build`

### Backend Issues

1. **Compilation errors**:
   - Ensure JDK 21 is installed and configured
   - Update Gradle dependencies: `./gradlew build --refresh-dependencies`

2. **Runtime errors**:
   - Check application logs
   - Verify database connection
   - Ensure all required environment variables are set

3. **Test failures**:
   - Run specific tests: `./gradlew test --tests TestClassName`
   - Check test logs for details

### Frontend Issues

1. **npm install errors**:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Build errors**:
   - Check for TypeScript errors: `npm run build`
   - Verify environment variables in `.env.local`

3. **Runtime errors**:
   - Check browser console for errors
   - Verify API connectivity
   - Check for CORS issues (see CORS troubleshooting section below)

### Common Fixes

1. **Reset database**:
   - If using Docker: `docker compose down -v && docker compose up -d`
   - If local: Drop and recreate the database

2. **Clear frontend cache**:
   - Delete `dist` directory: `rm -rf dist`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Restart development server: `npm run dev`

3. **Update dependencies**:
   - Backend: `./gradlew build --refresh-dependencies`
   - Frontend: `npm update`

4. **Restart services**:
   - Docker: `docker compose restart`
   - Local backend: Stop and restart Spring Boot application
   - Local frontend: Stop and restart development server

### CORS Issues

The application is configured to handle CORS automatically, but if you encounter CORS-related issues:

1. **Verify CORS Configuration**:
   - Backend CORS is configured in `SecurityConfig.java`
   - Allowed origins: `http://localhost:3000`, `http://127.0.0.1:3000`
   - Allowed methods: GET, POST, PUT, DELETE, OPTIONS
   - Credentials: Enabled for JWT authentication

2. **Common CORS Problems**:
   - **Wrong port**: Ensure frontend runs on port 3000 and backend on port 8080
   - **Wrong protocol**: Use `http://` not `https://` for local development
   - **Missing headers**: Backend automatically includes required CORS headers

3. **Testing CORS**:
   ```bash
   # Test preflight request
   curl -X OPTIONS -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -v http://localhost:8080/api/v1/auth/login
   
   # Test simple request
   curl -H "Origin: http://localhost:3000" \
        -v http://localhost:8080/actuator/health
   ```

4. **Debugging Steps**:
   - Check browser Network tab for CORS errors
   - Verify backend is running and accessible
   - Check backend logs for CORS-related messages
   - Ensure no proxy or firewall is blocking requests

## Production Docker Testing

The project includes production-ready Docker configurations for testing deployment scenarios locally.

### Production Docker Compose

**Location**: `relmgmt/docker/docker-compose.prod.yml`

This configuration mirrors the production environment with:
- PostgreSQL 17.5 with Alpine Linux
- Multi-stage Docker builds for both services
- Resource limits and health checks
- Production-optimized environment variables
- Security hardening (non-root users)

### Testing Production Configuration Locally

1. **Navigate to docker directory**:
   ```bash
   cd relmgmt/docker
   ```

2. **Create production environment file**:
   ```bash
   cp env.prod.example .env.prod
   # Edit .env.prod with your production values
   ```

3. **Start production environment**:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
   ```

4. **Verify services**:
   ```bash
   # Check all services are running
   docker-compose -f docker-compose.prod.yml ps
   
   # Test backend health
   curl -f http://localhost:8080/actuator/health
   
   # Test frontend health
   curl -f http://localhost:3000/health
   ```

5. **View logs**:
   ```bash
   # All services
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Individual services
   docker-compose -f docker-compose.prod.yml logs -f relmgmt-backend
   docker-compose -f docker-compose.prod.yml logs -f relmgmt-frontend
   ```

6. **Stop production environment**:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod down
   ```

### Production Docker Images

#### Backend Image Features
- **Base Image**: Eclipse Temurin 21 JRE (lightweight runtime)
- **Multi-stage Build**: JDK for building, JRE for runtime
- **Security**: Non-root user execution
- **Health Checks**: Spring Boot Actuator integration
- **Optimization**: Layer caching and JVM tuning

#### Frontend Image Features
- **Base Image**: Nginx Alpine (minimal production server)
- **Build Arguments**: Environment-specific configuration
- **Security**: Custom nginx config with security headers
- **Performance**: Gzip compression and caching headers
- **SPA Support**: Proper routing for React Router

### Build Images Locally

```bash
# Build backend image
cd relmgmt/backend
docker build -t relmgmt-backend:local .

# Build frontend image with environment variables
cd relmgmt/frontend
docker build -t relmgmt-frontend:local \
  --build-arg VITE_API_URL=http://localhost:8080/api \
  --build-arg VITE_APP_TITLE="Release Management System - Local" .

# Test built images
docker run --rm -p 8080:8080 --name test-backend \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/relmgmt \
  relmgmt-backend:local

docker run --rm -p 3000:3000 --name test-frontend \
  relmgmt-frontend:local
```

### Continuous Integration Testing

The project includes comprehensive GitHub Actions workflows for CI/CD:

#### Backend CI/CD (`relmgmt/.github/workflows/backend-ci.yml`)
- PostgreSQL service for integration tests
- Multi-platform builds (amd64/arm64)
- GitHub Container Registry publishing
- Automated deployment to staging/production

#### Frontend CI/CD (`relmgmt/.github/workflows/frontend-ci.yml`)
- Linting and testing with coverage
- Bundle analysis and optimization
- Storybook deployment to GitHub Pages
- Security scanning with Trivy

#### Security Scanning (`relmgmt/.github/workflows/security-scan.yml`)
- CodeQL analysis for Java and JavaScript
- Container vulnerability scanning
- Dependency security checks
- Secret scanning

### Environment Parity

The local development setup maintains parity with production:

| Component | Development | Production | Status |
|-----------|-------------|------------|--------|
| **Database** | PostgreSQL 17.5 (Docker) | PostgreSQL 17.5 (Render) | ✅ Matching |
| **Backend** | Spring Boot 3.5.4 | Spring Boot 3.5.4 | ✅ Matching |
| **Frontend** | Vite Dev Server | Nginx Alpine | ⚠️ Different (expected) |
| **Java Version** | OpenJDK 21 | Eclipse Temurin 21 | ✅ Compatible |
| **Node Version** | Node 20 | Node 20 Alpine | ✅ Matching |

### CI/CD Integration

Local development integrates with the CI/CD pipeline:

1. **Pre-commit Hooks**: Code quality checks before commits
2. **Branch Protection**: Automated testing on pull requests
3. **Deployment Pipeline**: Automatic deployment on main/develop pushes
4. **Security Scanning**: Automated vulnerability detection
5. **Dependency Management**: Weekly automated dependency updates

For complete CI/CD and deployment information, see:
- **CI/CD Guide**: `docs/ci-cd-deployment.md`
- **Environment Configuration**: `docs/environment-configuration.md`
- **System Architecture**: `docs/system-architecture.md` 