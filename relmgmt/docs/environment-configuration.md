# Release Management System: Environment Configuration

This document provides detailed information about environment configuration for the Release Management System across different environments (development, testing, staging, and production).

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Environment Variables](#environment-variables)
3. [Configuration Files](#configuration-files)
4. [Secrets Management](#secrets-management)
5. [Database Configuration](#database-configuration)
6. [Sample Configuration Files](#sample-configuration-files)

## Environment Overview

The Release Management System supports the following environments:

| Environment | Purpose | Description |
|-------------|---------|-------------|
| Development | Local development | Used by developers for day-to-day development work |
| Testing | Automated testing | Used for running automated tests in CI/CD pipelines |
| Staging | Pre-production testing | Mirrors production environment for final testing |
| Production | Live application | The environment used by end users |

## Environment Variables

### Common Environment Variables

These variables are required across all environments:

#### Backend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | Yes | - | `dev`, `test`, `staging`, `prod` |
| `SERVER_PORT` | Port for the backend server | No | `8080` | `8080` |
| `SPRING_DATASOURCE_URL` | JDBC URL for database connection | Yes | - | `jdbc:postgresql://localhost:5432/relmgmt` |
| `SPRING_DATASOURCE_USERNAME` | Database username | Yes | - | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | Yes | - | `password` |
| `APP_JWT_SECRET` | Secret key for JWT token generation | Yes | - | `your-jwt-secret-key` |
| `APP_JWT_EXPIRATION` | JWT token expiration time in milliseconds | No | `86400000` | `86400000` (24 hours) |
| `LOGGING_LEVEL_ROOT` | Root logging level | No | `INFO` | `INFO`, `DEBUG`, `WARN`, `ERROR` |
| `LOGGING_LEVEL_COM_POLYCODER_RELMGMT` | Application-specific logging level | No | `INFO` | `INFO`, `DEBUG`, `WARN`, `ERROR` |

#### Frontend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `VITE_API_URL` | URL for the backend API | Yes | `http://localhost:8080/api` | `http://localhost:8080/api` |
| `VITE_APP_TITLE` | Application title | No | `Release Management System` | `Release Management System - Dev` |
| `VITE_LOG_LEVEL` | Client-side logging level | No | `info` | `debug`, `info`, `warn`, `error` |

### Environment-Specific Variables

#### Development Environment

##### Backend

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Activates development profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/relmgmt` | Local database connection |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Automatically update schema |
| `SPRING_FLYWAY_CLEAN_ON_VALIDATION_ERROR` | `true` | Clean database on validation error |
| `LOGGING_LEVEL_COM_POLYCODER_RELMGMT` | `DEBUG` | Detailed logging for development |
| `SPRING_DEVTOOLS_RESTART_ENABLED` | `true` | Enable hot reload |

##### Frontend

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `http://localhost:8080/api` | Local backend API (CORS configured) |
| `VITE_LOG_LEVEL` | `debug` | Verbose logging for development |
| `VITE_MOCK_API` | `false` | Use real API instead of mocks |

#### Testing Environment

##### Backend

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `test` | Activates testing profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/relmgmt_test` | Test database connection |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `create-drop` | Recreate schema for each test run |
| `SPRING_FLYWAY_ENABLED` | `false` | Disable Flyway migrations for tests |
| `SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL` | `true` | Format SQL logs for readability |

##### Frontend

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `http://localhost:8080/api` | Test backend API (CORS configured) |
| `VITE_MOCK_API` | `true` | Use mock API for component tests |

#### Staging Environment

##### Backend

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `staging` | Activates staging profile |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `validate` | Validate schema only |
| `SPRING_FLYWAY_CLEAN_DISABLED` | `true` | Prevent accidental database cleaning |
| `LOGGING_LEVEL_ROOT` | `INFO` | Standard logging level |

##### Frontend

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://staging-api.example.com/api/v1` | Staging backend API |
| `VITE_APP_TITLE` | `Release Management System - Staging` | Staging environment indicator |

#### Production Environment

##### Backend

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `none` | No automatic schema changes |
| `SPRING_FLYWAY_CLEAN_DISABLED` | `true` | Prevent accidental database cleaning |
| `LOGGING_LEVEL_ROOT` | `WARN` | Minimal logging |
| `SERVER_TOMCAT_MAX_THREADS` | `200` | Increased thread pool for production |
| `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE` | `10` | Database connection pool size |

##### Frontend

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.example.com/api/v1` | Production backend API |
| `VITE_LOG_LEVEL` | `error` | Minimal logging in production |

## Configuration Files

### Backend Configuration

Spring Boot uses a hierarchical approach to configuration:

1. `application.yml`: Base configuration for all environments
2. `application-{profile}.yml`: Environment-specific configuration
3. Environment variables: Override configuration properties

#### Location of Configuration Files

- Development: `backend/src/main/resources/`
- Docker: Mounted as volumes or environment variables
- Render: Environment variables in the service configuration

### Frontend Configuration

Vite uses environment variables for configuration:

1. `.env`: Base configuration for all environments
2. `.env.local`: Local overrides (not committed to repository)
3. `.env.{mode}`: Environment-specific configuration (development, production)

#### Location of Configuration Files

- Development: Root of the frontend directory
- Docker: Built into the image during build process
- Render: Environment variables in the service configuration

## Secrets Management

### Development Environment

For local development, secrets can be stored in:

1. `.env.local` file (frontend)
2. `application-dev.yml` file (backend)

These files should be added to `.gitignore` to prevent committing secrets to the repository.

### CI/CD and Deployment Environments

For CI/CD pipelines and deployment environments, secrets should be stored in:

1. GitHub Secrets for GitHub Actions workflows
2. Render Environment Variables for Render deployments

Never commit secrets to the repository. Always use environment variables or secure secret management systems.

## Database Configuration

### Development Database

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/relmgmt
    username: postgres
    password: bBzp16eHfA29wZUvr
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
    clean-on-validation-error: true
```

### Testing Database

```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/relmgmt_test
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: false
```

### Production Database

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 30000
      connection-timeout: 30000
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
    clean-disabled: true
```

## CORS Configuration

The backend is configured with CORS (Cross-Origin Resource Sharing) to allow the frontend application to communicate with the backend API. The CORS configuration is defined in `SecurityConfig.java` and includes:

### CORS Settings

- **Allowed Origins**: `http://localhost:3000`, `http://127.0.0.1:3000`
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: All headers (including Authorization for JWT tokens)
- **Allow Credentials**: Enabled for authentication
- **Exposed Headers**: Authorization, Content-Type
- **Max Age**: 3600 seconds (1 hour) for preflight request caching

### Environment-Specific CORS Configuration

For different environments, you may need to update the allowed origins in `SecurityConfig.java`:

```java
// Development
configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));

// Staging
configuration.setAllowedOriginPatterns(Arrays.asList("https://staging.yourapp.com"));

// Production
configuration.setAllowedOriginPatterns(Arrays.asList("https://yourapp.com", "https://www.yourapp.com"));
```

## Sample Configuration Files

### Backend Configuration

#### application.yml (Base Configuration)

```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: relmgmt-backend
  jackson:
    serialization:
      write-dates-as-timestamps: false
  jpa:
    open-in-view: false

app:
  jwt:
    expiration: 86400000

logging:
  level:
    root: INFO
    com.polycoder.relmgmt: INFO
```

#### application-dev.yml (Development Configuration)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/relmgmt
    username: postgres
    password: bBzp16eHfA29wZUvr
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
    clean-on-validation-error: true
  devtools:
    restart:
      enabled: true

app:
  jwt:
    secret: dev-jwt-secret-key-should-be-at-least-64-bytes-long-for-security-reasons

logging:
  level:
    com.polycoder.relmgmt: DEBUG
    org.hibernate.SQL: DEBUG
```

#### application-prod.yml (Production Configuration)

```yaml
server:
  tomcat:
    max-threads: 200
    min-spare-threads: 20

spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 30000
      connection-timeout: 30000
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
    clean-disabled: true

app:
  jwt:
    secret: ${JWT_SECRET}

logging:
  level:
    root: WARN
    com.polycoder.relmgmt: INFO
  file:
    name: /var/log/relmgmt/application.log
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

### Frontend Configuration

#### .env (Base Configuration)

```
VITE_APP_TITLE=Release Management System
VITE_LOG_LEVEL=info
VITE_MOCK_API=false
```

#### .env.development (Development Configuration)

```
VITE_API_URL=http://localhost:8080/api/v1
VITE_LOG_LEVEL=debug
```

#### .env.production (Production Configuration)

```
VITE_API_URL=/api/v1
VITE_LOG_LEVEL=error
```

### Docker Environment Variables

Create a `.env` file in the docker directory:

```
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=bBzp16eHfA29wZUvr
POSTGRES_DB=relmgmt

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=devpgadmin

# Backend
SPRING_PROFILES_ACTIVE=dev
SPRING_DATASOURCE_URL=jdbc:postgresql://relmgmtpostgres:5432/relmgmt
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=bBzp16eHfA29wZUvr
APP_JWT_SECRET=dev-jwt-secret-key-should-be-at-least-64-bytes-long-for-security-reasons

# Frontend
VITE_API_URL=http://localhost:8080/api/v1
``` 