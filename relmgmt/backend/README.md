# Release Management System - Backend

This is the backend application for the Release Management System, built with Spring Boot 3.5.4, Java 21, and PostgreSQL.

## Technology Stack

- **Framework**: Spring Boot 3.5.4
- **Language**: Java 21
- **Database**: PostgreSQL 17
- **Build Tool**: Gradle
- **Security**: Spring Security with JWT
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Testing**: JUnit 5, Mockito, TestContainers
- **Excel Processing**: Apache POI
- **Validation**: Hibernate Validator

## Prerequisites

- Java 21 or higher
- PostgreSQL 17
- Gradle (or use the included Gradle wrapper)

## Getting Started

### Database Setup

1. Start PostgreSQL and create a database:
   ```sql
   CREATE DATABASE relmgmt;
   CREATE USER relmgmt_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE relmgmt TO relmgmt_user;
   ```

2. Or use Docker Compose (recommended for development):
   ```bash
   cd relmgmt/docker
   docker-compose up -d
   ```

### Environment Configuration

Create a `.env` file in the backend directory or set environment variables:

```env
DB_USERNAME=postgres
DB_PASSWORD=bBzp16eHfA29wZUvr
JWT_SECRET=your-secret-key-here-make-it-long-and-secure-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Running the Application

1. Navigate to the backend directory:
   ```bash
   cd relmgmt/backend
   ```

2. Run the application:
   ```bash
   ./gradlew bootRun
   ```

   Or build and run:
   ```bash
   ./gradlew build
   java -jar build/libs/relmgmt-0.0.1-SNAPSHOT.jar
   ```

The application will be available at `http://localhost:8080`

### API Documentation

Once the application is running, you can access:
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Project Structure

```
src/
├── main/
│   ├── java/com/polycoder/relmgmt/
│   │   ├── config/           # Configuration classes
│   │   ├── controller/       # REST API controllers
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entity/           # JPA entities
│   │   ├── exception/        # Custom exceptions
│   │   ├── repository/       # Spring Data repositories
│   │   ├── security/         # Security configuration
│   │   ├── service/          # Business logic services
│   │   ├── util/             # Utility classes
│   │   └── RelmgmtApplication.java
│   └── resources/
│       ├── application.yml   # Main configuration
│       ├── application-dev.yml
│       ├── application-test.yml
│       └── db/migration/     # Database migrations
└── test/
    └── java/com/polycoder/relmgmt/
        ├── controller/       # Controller tests
        ├── repository/       # Repository tests
        └── service/          # Service tests
```

## Development

### Running Tests

```bash
# Run all tests
./gradlew test

# Run tests with coverage
./gradlew test jacocoTestReport

# Run integration tests
./gradlew integrationTest
```

### Building

```bash
# Build the application
./gradlew build

# Build without tests
./gradlew build -x test

# Create a fat JAR
./gradlew bootJar
```

### Code Quality

```bash
# Check code style
./gradlew checkstyleMain

# Run SpotBugs
./gradlew spotbugsMain
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

### Resources
- `GET /api/v1/resources` - Get all resources
- `POST /api/v1/resources` - Create a new resource
- `GET /api/v1/resources/{id}` - Get resource by ID
- `PUT /api/v1/resources/{id}` - Update resource
- `DELETE /api/v1/resources/{id}` - Delete resource
- `POST /api/v1/resources/import` - Import resources from Excel

### Releases
- `GET /api/v1/releases` - Get all releases
- `POST /api/v1/releases` - Create a new release
- `GET /api/v1/releases/{id}` - Get release by ID
- `PUT /api/v1/releases/{id}` - Update release
- `DELETE /api/v1/releases/{id}` - Delete release

## Database Schema

The application uses JPA/Hibernate with automatic schema generation. Key entities include:

- **Users**: Authentication and user management
- **Resources**: Resource roster with skills and availability
- **Releases**: Release information and phases
- **Projects**: Projects within releases
- **ScopeItems**: Scope items for projects
- **Allocations**: Resource allocations to releases
- **TransactionLogs**: Audit trail for all changes

## Security

- JWT-based authentication
- Role-based access control
- CSRF protection disabled for API endpoints
- Stateless session management

## Testing Strategy

- Unit tests for all services and utilities
- Integration tests with TestContainers
- Repository tests with in-memory database
- Controller tests with MockMvc

## CI/CD

The project includes GitHub Actions workflows for:
- Automated testing with PostgreSQL
- Code quality checks
- Build verification
- Artifact upload

## Deployment

### Docker

```bash
# Build Docker image
docker build -t relmgmt-backend .

# Run with Docker Compose
docker-compose up -d
```

### Production

1. Set appropriate environment variables
2. Use a production-grade database
3. Configure proper logging
4. Set up monitoring and health checks

## Troubleshooting

### Common Issues

1. **Database connection failed**: Check PostgreSQL is running and credentials are correct
2. **Port already in use**: Change the port in `application.yml`
3. **JWT errors**: Ensure JWT_SECRET is set and consistent

### Logs

Check application logs for detailed error information:
```bash
./gradlew bootRun --debug
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write or update tests
4. Run the test suite
5. Submit a pull request

## License

This project is licensed under the MIT License. 