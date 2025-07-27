# Release Management System: CI/CD and Deployment Guide

This guide provides configuration and instructions for setting up Continuous Integration, Continuous Deployment (CI/CD), and deploying the Release Management System to Render.

## Table of Contents

1. [GitHub Actions CI/CD Configuration](#github-actions-cicd-configuration)
2. [Render Deployment Configuration](#render-deployment-configuration)
3. [Environment Variables](#environment-variables)
4. [Deployment Process](#deployment-process)
5. [Monitoring and Logging](#monitoring-and-logging)

## GitHub Actions CI/CD Configuration

Create the following GitHub Actions workflow files in the `.github/workflows` directory of your repository:

### Backend CI/CD Workflow

Create a file named `.github/workflows/backend-ci-cd.yml`:

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci-cd.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci-cd.yml'

jobs:
  build:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: relmgmt_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven
    
    - name: Build with Maven
      run: |
        cd backend
        mvn -B clean package -DskipTests
    
    - name: Run Tests
      run: |
        cd backend
        mvn -B test
    
    - name: Generate Test Coverage Report
      run: |
        cd backend
        mvn -B jacoco:report
    
    - name: Upload Test Coverage Report
      uses: actions/upload-artifact@v3
      with:
        name: test-coverage-report
        path: backend/target/site/jacoco/
    
    - name: Build and Push Docker Image
      if: github.event_name != 'pull_request'
      env:
        RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
      run: |
        cd backend
        docker build -t relmgmt-backend:latest .
        # The following would be used if you're using a container registry
        # docker tag relmgmt-backend:latest your-registry/relmgmt-backend:latest
        # docker push your-registry/relmgmt-backend:latest
        
        # Instead, we'll trigger a Render deploy
        curl -X POST https://api.render.com/v1/services/${{ secrets.RENDER_BACKEND_SERVICE_ID }}/deploys \
          -H "Authorization: Bearer $RENDER_API_KEY"
```

### Frontend CI/CD Workflow

Create a file named `.github/workflows/frontend-ci-cd.yml`:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci-cd.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci-cd.yml'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install Dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Lint
      run: |
        cd frontend
        npm run lint
    
    - name: Type Check
      run: |
        cd frontend
        npm run type-check
    
    - name: Run Tests
      run: |
        cd frontend
        npm test -- --coverage
    
    - name: Upload Test Coverage Report
      uses: actions/upload-artifact@v3
      with:
        name: frontend-test-coverage
        path: frontend/coverage/
    
    - name: Build
      run: |
        cd frontend
        npm run build
    
    - name: Deploy to Render
      if: github.event_name != 'pull_request'
      env:
        RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
      run: |
        # Trigger a deploy on Render
        curl -X POST https://api.render.com/v1/services/${{ secrets.RENDER_FRONTEND_SERVICE_ID }}/deploys \
          -H "Authorization: Bearer $RENDER_API_KEY"
```

## Render Deployment Configuration

### Backend Service Configuration

1. Create a new Web Service in Render
2. Connect to your GitHub repository
3. Configure the service with the following settings:

```
Name: relmgmt-backend
Environment: Docker
Region: (Choose the region closest to your users)
Branch: main
Dockerfile Path: backend/Dockerfile
Health Check Path: /api/v1/actuator/health
```

4. Add the following environment variables:

```
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://your-postgres-host:5432/relmgmt
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your-secure-password
APP_JWT_SECRET=your-secure-jwt-secret
APP_JWT_EXPIRATION=86400000
```

### Frontend Service Configuration

1. Create a new Static Site in Render
2. Connect to your GitHub repository
3. Configure the service with the following settings:

```
Name: relmgmt-frontend
Branch: main
Build Command: cd frontend && npm ci && npm run build
Publish Directory: frontend/dist
```

4. Add the following environment variables:

```
VITE_API_URL=https://your-backend-service-url.onrender.com/api/v1
```

### Database Configuration

1. Create a new PostgreSQL database in Render
2. Configure the database with the following settings:

```
Name: relmgmt-db
PostgreSQL Version: 17
Region: (Same region as your backend service)
```

3. After creation, note the connection details to use in your backend service environment variables

## Environment Variables

### Required Environment Variables

#### Backend Service

| Variable | Description | Example |
|----------|-------------|---------|
| SPRING_PROFILES_ACTIVE | Active Spring profile | prod |
| SPRING_DATASOURCE_URL | PostgreSQL connection URL | jdbc:postgresql://postgres:5432/relmgmt |
| SPRING_DATASOURCE_USERNAME | Database username | postgres |
| SPRING_DATASOURCE_PASSWORD | Database password | your-secure-password |
| APP_JWT_SECRET | Secret key for JWT token generation | your-secure-jwt-secret |
| APP_JWT_EXPIRATION | JWT token expiration time in milliseconds | 86400000 |

#### Frontend Service

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://relmgmt-backend.onrender.com/api/v1 |

### GitHub Secrets

Set up the following secrets in your GitHub repository:

| Secret | Description | Example |
|--------|-------------|---------|
| RENDER_API_KEY | API key for Render | key_abcdefghijklmnopqrstuvwxyz |
| RENDER_BACKEND_SERVICE_ID | ID of the backend service in Render | srv-abcdefghijklmn |
| RENDER_FRONTEND_SERVICE_ID | ID of the frontend service in Render | srv-opqrstuvwxyz |

## Deployment Process

### Initial Deployment

1. Push your code to the main branch of your GitHub repository
2. GitHub Actions will build and test your code
3. If all tests pass, GitHub Actions will trigger a deployment to Render
4. Render will build and deploy your services

### Continuous Deployment

1. Make changes to your code
2. Create a pull request
3. GitHub Actions will build and test your code
4. If all tests pass, merge the pull request to the main branch
5. GitHub Actions will trigger a deployment to Render
6. Render will build and deploy your services

## Monitoring and Logging

### Render Dashboard

Monitor your services through the Render dashboard:
- View service status
- View logs
- Monitor resource usage

### Application Monitoring

1. Access Spring Boot Actuator endpoints for backend monitoring:
   - Health: `/api/v1/actuator/health`
   - Info: `/api/v1/actuator/info`
   - Metrics: `/api/v1/actuator/metrics`

2. Set up custom monitoring using Prometheus and Grafana (optional):
   - Add Prometheus dependencies to the backend
   - Configure Prometheus to scrape metrics from the backend
   - Set up Grafana dashboards to visualize metrics

### Log Management

1. View logs in the Render dashboard
2. Set up a log aggregation service (optional):
   - Configure the backend to send logs to a service like Papertrail or Loggly
   - Set up alerts for error conditions 