#!/bin/bash

# Database Migration Script: Render → Neon
# This script automates the migration of the database from Render to Neon
# Usage: ./migrate-to-neon.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║   Release Management System - Database Migration        ║
║   FROM: Render PostgreSQL  →  TO: Neon PostgreSQL       ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Configuration
BACKUP_DIR="${HOME}/relmgmt-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TEMP_DIR="/tmp/relmgmt-migration-${TIMESTAMP}"

mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DIR"

echo -e "${GREEN}Step 1: Pre-Migration Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for required tools
echo "Checking required tools..."
for cmd in psql pg_dump pg_restore; do
    if command -v $cmd &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $cmd found"
    else
        echo -e "  ${RED}✗${NC} $cmd not found"
        echo -e "${RED}Error: Please install PostgreSQL client tools${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}Step 2: Collect Connection Information${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Please provide your Render database connection string:"
echo -e "${YELLOW}(Format: postgresql://user:password@host/database?sslmode=require)${NC}"
read -r RENDER_DB_URL

echo ""
echo "Please provide your Neon database connection string:"
echo -e "${YELLOW}(Format: postgresql://user:password@ep-xxx.region.aws.neon.tech/database?sslmode=require)${NC}"
read -r NEON_DB_URL

# Validate connection strings
if [[ ! "$RENDER_DB_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}Error: Invalid Render connection string${NC}"
    exit 1
fi

if [[ ! "$NEON_DB_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}Error: Invalid Neon connection string${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 3: Test Database Connections${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Testing Render database connection..."
if psql "$RENDER_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Render database connection successful"
else
    echo -e "  ${RED}✗${NC} Cannot connect to Render database"
    exit 1
fi

echo "Testing Neon database connection..."
if psql "$NEON_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Neon database connection successful"
else
    echo -e "  ${RED}✗${NC} Cannot connect to Neon database"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 4: Analyze Source Database${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Collecting database statistics from Render..."
psql "$RENDER_DB_URL" -t << 'EOF' > "$TEMP_DIR/source_stats.txt"
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'releases', COUNT(*) FROM releases
UNION ALL
SELECT 'phases', COUNT(*) FROM phases
UNION ALL
SELECT 'scope_items', COUNT(*) FROM scope_items
UNION ALL
SELECT 'components', COUNT(*) FROM components
UNION ALL
SELECT 'allocations', COUNT(*) FROM allocations
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'transaction_logs', COUNT(*) FROM transaction_logs;
EOF

echo ""
echo "Source Database Statistics:"
cat "$TEMP_DIR/source_stats.txt"

# Calculate database size
DB_SIZE=$(psql "$RENDER_DB_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));")
echo ""
echo "Database size: $DB_SIZE"

echo ""
echo -e "${YELLOW}⚠ Warning: This migration will:${NC}"
echo "  1. Backup the Render database"
echo "  2. Clear the Neon database (if it has data)"
echo "  3. Restore data to Neon database"
echo ""
read -p "Do you want to proceed? (yes/no): " -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Step 5: Backup Render Database${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKUP_FILE="${BACKUP_DIR}/render-pre-migration-${TIMESTAMP}.dump"
echo "Creating backup: $BACKUP_FILE"

pg_dump "$RENDER_DB_URL" \
    --no-owner \
    --no-acl \
    --format=custom \
    --file="$BACKUP_FILE" \
    --verbose

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | awk '{print $1}')
    echo -e "${GREEN}✓ Backup completed (Size: $BACKUP_SIZE)${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Also create SQL backup for easy inspection
SQL_BACKUP="${BACKUP_DIR}/render-pre-migration-${TIMESTAMP}.sql"
echo "Creating SQL backup: $SQL_BACKUP"
pg_dump "$RENDER_DB_URL" \
    --no-owner \
    --no-acl \
    --format=plain \
    --file="$SQL_BACKUP"

echo ""
echo -e "${GREEN}Step 6: Check Neon Database State${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NEON_TABLE_COUNT=$(psql "$NEON_DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ "$NEON_TABLE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Warning: Neon database contains $NEON_TABLE_COUNT tables${NC}"
    echo ""
    read -p "Clear Neon database before migration? (yes/no): " -r CLEAR_CONFIRM
    
    if [ "$CLEAR_CONFIRM" = "yes" ]; then
        echo "Dropping all tables in Neon database..."
        psql "$NEON_DB_URL" << 'EOF'
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
EOF
        echo -e "${GREEN}✓ Neon database cleared${NC}"
    fi
else
    echo -e "${GREEN}✓ Neon database is empty${NC}"
fi

echo ""
echo -e "${GREEN}Step 7: Restore Data to Neon${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Restoring data to Neon (this may take a few minutes)..."
pg_restore \
    --verbose \
    --no-owner \
    --no-acl \
    -d "$NEON_DB_URL" \
    "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data restore completed${NC}"
else
    echo -e "${RED}✗ Data restore failed${NC}"
    echo "You can retry manually with:"
    echo "  pg_restore -d \"$NEON_DB_URL\" \"$BACKUP_FILE\""
    exit 1
fi

echo ""
echo -e "${GREEN}Step 8: Verify Migration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Collecting database statistics from Neon..."
psql "$NEON_DB_URL" -t << 'EOF' > "$TEMP_DIR/dest_stats.txt"
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'releases', COUNT(*) FROM releases
UNION ALL
SELECT 'phases', COUNT(*) FROM phases
UNION ALL
SELECT 'scope_items', COUNT(*) FROM scope_items
UNION ALL
SELECT 'components', COUNT(*) FROM components
UNION ALL
SELECT 'allocations', COUNT(*) FROM allocations
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'transaction_logs', COUNT(*) FROM transaction_logs;
EOF

echo ""
echo "Comparing record counts..."
echo ""
printf "%-20s %-15s %-15s %-10s\n" "Table" "Render (Source)" "Neon (Dest)" "Status"
echo "────────────────────────────────────────────────────────────────"

# Compare line by line
paste "$TEMP_DIR/source_stats.txt" "$TEMP_DIR/dest_stats.txt" | while IFS=$'\t' read -r source dest; do
    source_table=$(echo "$source" | awk '{print $1}')
    source_count=$(echo "$source" | awk '{print $3}')
    dest_count=$(echo "$dest" | awk '{print $3}')
    
    if [ "$source_count" = "$dest_count" ]; then
        status="${GREEN}✓ Match${NC}"
    else
        status="${RED}✗ Mismatch${NC}"
    fi
    
    printf "%-20s %-15s %-15s " "$source_table" "$source_count" "$dest_count"
    echo -e "$status"
done

# Verify Flyway schema history
echo ""
echo "Verifying Flyway migrations..."
FLYWAY_COUNT=$(psql "$NEON_DB_URL" -t -c "SELECT COUNT(*) FROM flyway_schema_history;")
echo "Flyway migrations applied: $FLYWAY_COUNT"

echo ""
echo -e "${GREEN}Step 9: Generate Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Extract Neon connection details
NEON_HOST=$(echo "$NEON_DB_URL" | sed -E 's|postgresql://[^@]+@([^:/]+).*|\1|')
NEON_USER=$(echo "$NEON_DB_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')
NEON_PASS=$(echo "$NEON_DB_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
NEON_DB=$(echo "$NEON_DB_URL" | sed -E 's|.*/([^?]+).*|\1|')

# Generate JDBC connection string
JDBC_URL="jdbc:postgresql://${NEON_HOST}:5432/${NEON_DB}?sslmode=require"

echo ""
echo "Configuration for Render Backend:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat << EOF

Environment Variables to set in Render Dashboard:

SPRING_DATASOURCE_URL=${JDBC_URL}
SPRING_DATASOURCE_USERNAME=${NEON_USER}
SPRING_DATASOURCE_PASSWORD=${NEON_PASS}

# Keep existing values:
SPRING_PROFILES_ACTIVE=prod
APP_JWT_SECRET=[your existing JWT secret]
APP_JWT_EXPIRATION=86400000
LOGGING_LEVEL_ROOT=WARN
LOGGING_LEVEL_COM_POLYCODER_RELMGMT=INFO

# Neon-optimized settings:
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=5
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_CLEAN_DISABLED=true
SPRING_JPA_HIBERNATE_DDL_AUTO=none

EOF

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Migration Completed Successfully! ✓             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Next Steps:"
echo "  1. Update Render backend environment variables (shown above)"
echo "  2. Wait for Render to redeploy (auto-triggered by env change)"
echo "  3. Test backend health: curl https://your-backend.onrender.com/actuator/health"
echo "  4. Test API endpoints with your frontend"
echo "  5. Monitor for 24 hours before deleting Render database"
echo ""
echo "Backups saved to: $BACKUP_DIR"
echo "  - Custom format: $BACKUP_FILE"
echo "  - SQL format: $SQL_BACKUP"
echo ""
echo -e "${YELLOW}⚠ Keep these backups until you're confident the migration is stable!${NC}"
echo ""

# Cleanup temp directory
rm -rf "$TEMP_DIR"

