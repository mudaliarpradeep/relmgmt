# Release Management System - Backend Dockerfile
# Multi-stage build for production optimization

# Stage 1: Build stage
FROM eclipse-temurin:21-jdk AS builder

# Set working directory
WORKDIR /app

# Copy gradle wrapper and configuration files
COPY backend/gradlew .
COPY backend/gradle gradle/
COPY backend/build.gradle .
COPY backend/settings.gradle .

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies (this layer will be cached if dependencies don't change)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY backend/src src/

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

# Create startup script to handle database URL construction
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'export SPRING_PROFILES_ACTIVE=prod' >> /app/start.sh && \
    echo 'if [ -n "$RENDER_DB_HOST" ] && [ -n "$RENDER_DB_PORT" ] && [ -n "$RENDER_DB_NAME" ]; then' >> /app/start.sh && \
    echo '  export SPRING_DATASOURCE_URL="jdbc:postgresql://${RENDER_DB_HOST}:${RENDER_DB_PORT}/${RENDER_DB_NAME}?sslmode=require"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
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
