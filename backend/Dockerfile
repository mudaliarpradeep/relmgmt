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

# Create startup script - simplified for Neon database
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'export SPRING_PROFILES_ACTIVE=prod' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "=== Database Configuration ==="' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Verify SPRING_DATASOURCE_URL is set' >> /app/start.sh && \
    echo 'if [ -z "$SPRING_DATASOURCE_URL" ]; then' >> /app/start.sh && \
    echo '  echo "ERROR: SPRING_DATASOURCE_URL is not set!"' >> /app/start.sh && \
    echo '  echo "Please set SPRING_DATASOURCE_URL in Render environment variables"' >> /app/start.sh && \
    echo '  echo "Format: jdbc:postgresql://host:5432/database?sslmode=require"' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "✓ SPRING_DATASOURCE_URL is configured"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Convert postgres:// or postgresql:// to jdbc:postgresql:// if needed' >> /app/start.sh && \
    echo 'if echo "$SPRING_DATASOURCE_URL" | grep -q "^postgres://"; then' >> /app/start.sh && \
    echo '  export SPRING_DATASOURCE_URL=$(echo "$SPRING_DATASOURCE_URL" | sed "s|^postgres://|jdbc:postgresql://|")' >> /app/start.sh && \
    echo '  echo "✓ Converted postgres:// to jdbc:postgresql://"' >> /app/start.sh && \
    echo 'elif echo "$SPRING_DATASOURCE_URL" | grep -q "^postgresql://"; then' >> /app/start.sh && \
    echo '  export SPRING_DATASOURCE_URL=$(echo "$SPRING_DATASOURCE_URL" | sed "s|^postgresql://|jdbc:postgresql://|")' >> /app/start.sh && \
    echo '  echo "✓ Converted postgresql:// to jdbc:postgresql://"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Ensure sslmode is set' >> /app/start.sh && \
    echo 'if ! echo "$SPRING_DATASOURCE_URL" | grep -q "sslmode="; then' >> /app/start.sh && \
    echo '  if echo "$SPRING_DATASOURCE_URL" | grep -q "?"; then' >> /app/start.sh && \
    echo '    export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL}&sslmode=require"' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL}?sslmode=require"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  echo "✓ Added sslmode=require"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Extract hostname and wait for DNS resolution' >> /app/start.sh && \
    echo 'DB_HOST=$(echo "$SPRING_DATASOURCE_URL" | sed -n "s|.*://[^@]*@\\([^:/]*\\).*|\\1|p")' >> /app/start.sh && \
    echo 'if [ -n "$DB_HOST" ]; then' >> /app/start.sh && \
    echo '  echo "Database host: $DB_HOST"' >> /app/start.sh && \
    echo '  echo "Waiting for DNS resolution..."' >> /app/start.sh && \
    echo '  for i in 1 2 3 4 5 6 7 8 9 10; do' >> /app/start.sh && \
    echo '    if getent hosts "$DB_HOST" > /dev/null 2>&1; then' >> /app/start.sh && \
    echo '      echo "✓ DNS resolution successful"' >> /app/start.sh && \
    echo '      break' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '    if [ $i -eq 10 ]; then' >> /app/start.sh && \
    echo '      echo "WARNING: DNS resolution taking longer than expected"' >> /app/start.sh && \
    echo '      echo "Proceeding anyway - Spring Boot will retry connections"' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '    echo "Attempt $i/10: Waiting for DNS..."' >> /app/start.sh && \
    echo '    sleep 2' >> /app/start.sh && \
    echo '  done' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "✓ Database configuration validated"' >> /app/start.sh && \
    echo 'echo "=== Starting Application ==="' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
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
