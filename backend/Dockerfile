# Release Management System - Backend Dockerfile
# Multi-stage build for production optimization

# Stage 1: Build stage
FROM eclipse-temurin:21-jdk AS builder

# Set working directory
WORKDIR /app

# Copy gradle wrapper and configuration files
COPY gradlew .
COPY gradle/wrapper gradle/wrapper/
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies (this layer will be cached if dependencies don't change)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src/

# Build the application (skip tests for faster builds - tests run in CI)
RUN ./gradlew build -x test --no-daemon

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre AS runtime

# Install wget for health checks
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Create startup script to handle database URL construction with DNS wait
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'export SPRING_PROFILES_ACTIVE=prod' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Handle database URL configuration' >> /app/start.sh && \
    echo 'if [ -n "$SPRING_DATASOURCE_URL" ]; then' >> /app/start.sh && \
    echo '  # Convert postgres:// to jdbc:postgresql:// if needed' >> /app/start.sh && \
    echo '  if echo "$SPRING_DATASOURCE_URL" | grep -q "^postgres://"; then' >> /app/start.sh && \
    echo '    export SPRING_DATASOURCE_URL=$(echo "$SPRING_DATASOURCE_URL" | sed "s|^postgres://|jdbc:postgresql://|")' >> /app/start.sh && \
    echo '    echo "Converted Render database URL to JDBC format"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  # Ensure sslmode is set for Render databases' >> /app/start.sh && \
    echo '  if ! echo "$SPRING_DATASOURCE_URL" | grep -q "sslmode="; then' >> /app/start.sh && \
    echo '    if echo "$SPRING_DATASOURCE_URL" | grep -q "?"; then' >> /app/start.sh && \
    echo '      export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL}&sslmode=require"' >> /app/start.sh && \
    echo '    else' >> /app/start.sh && \
    echo '      export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL}?sslmode=require"' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  echo "Using database URL: ${SPRING_DATASOURCE_URL%%\?*}?..."' >> /app/start.sh && \
    echo 'elif [ -n "$RENDER_DB_HOST" ] && [ -n "$RENDER_DB_PORT" ] && [ -n "$RENDER_DB_NAME" ]; then' >> /app/start.sh && \
    echo '  # Construct from individual components as fallback' >> /app/start.sh && \
    echo '  export SPRING_DATASOURCE_URL="jdbc:postgresql://${RENDER_DB_HOST}:${RENDER_DB_PORT}/${RENDER_DB_NAME}?sslmode=require"' >> /app/start.sh && \
    echo '  echo "Constructed database URL from components: ${RENDER_DB_HOST}:${RENDER_DB_PORT}/${RENDER_DB_NAME}"' >> /app/start.sh && \
    echo '  # Wait for DNS resolution of database host' >> /app/start.sh && \
    echo '  echo "Waiting for database DNS resolution..."' >> /app/start.sh && \
    echo '  for i in 1 2 3 4 5 6 7 8 9 10; do' >> /app/start.sh && \
    echo '    if getent hosts ${RENDER_DB_HOST} > /dev/null 2>&1; then' >> /app/start.sh && \
    echo '      echo "Database host ${RENDER_DB_HOST} resolved successfully"' >> /app/start.sh && \
    echo '      break' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '    echo "Attempt $i: Waiting for DNS resolution of ${RENDER_DB_HOST}..."' >> /app/start.sh && \
    echo '    sleep 2' >> /app/start.sh && \
    echo '  done' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "Warning: No database configuration found"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'exec java $JAVA_OPTS -jar app.jar' >> /app/start.sh && \
    chmod +x /app/start.sh

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Set JVM options for production
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application with startup script
ENTRYPOINT ["/app/start.sh"]
