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
   - Check for CORS issues

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