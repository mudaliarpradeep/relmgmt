#!/bin/bash

# Database Backup Script for Release Management System
# Supports backing up from Render or Neon databases
# Usage: ./backup-database.sh [render|neon]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${HOME}/relmgmt-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}=== Release Management System Database Backup ===${NC}"
echo ""

# Determine source database
SOURCE="${1:-render}"

if [ "$SOURCE" = "render" ]; then
    echo -e "${YELLOW}Backing up from Render database...${NC}"
    echo "Please enter your Render database connection string:"
    echo "Format: postgresql://user:password@host/database?sslmode=require"
    read -r DB_URL
elif [ "$SOURCE" = "neon" ]; then
    echo -e "${YELLOW}Backing up from Neon database...${NC}"
    echo "Please enter your Neon database connection string:"
    echo "Format: postgresql://user:password@ep-xxx.region.aws.neon.tech/database?sslmode=require"
    read -r DB_URL
else
    echo -e "${RED}Error: Invalid source. Use 'render' or 'neon'${NC}"
    exit 1
fi

# Validate connection string
if [[ ! "$DB_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}Error: Invalid connection string format${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Starting backup...${NC}"

# Backup in custom format (binary, compressed)
CUSTOM_BACKUP="${BACKUP_DIR}/relmgmt-${SOURCE}-backup-${TIMESTAMP}.dump"
echo "Creating custom format backup: $CUSTOM_BACKUP"
pg_dump "$DB_URL" \
    --no-owner \
    --no-acl \
    --format=custom \
    --file="$CUSTOM_BACKUP" \
    --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Custom format backup completed${NC}"
else
    echo -e "${RED}✗ Custom format backup failed${NC}"
    exit 1
fi

# Backup in SQL format (plain text, easy to inspect)
SQL_BACKUP="${BACKUP_DIR}/relmgmt-${SOURCE}-backup-${TIMESTAMP}.sql"
echo ""
echo "Creating SQL format backup: $SQL_BACKUP"
pg_dump "$DB_URL" \
    --no-owner \
    --no-acl \
    --format=plain \
    --file="$SQL_BACKUP" \
    --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SQL format backup completed${NC}"
else
    echo -e "${RED}✗ SQL format backup failed${NC}"
    exit 1
fi

# Backup schema only (useful for reference)
SCHEMA_BACKUP="${BACKUP_DIR}/relmgmt-${SOURCE}-schema-${TIMESTAMP}.sql"
echo ""
echo "Creating schema-only backup: $SCHEMA_BACKUP"
pg_dump "$DB_URL" \
    --no-owner \
    --no-acl \
    --schema-only \
    --format=plain \
    --file="$SCHEMA_BACKUP"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema backup completed${NC}"
else
    echo -e "${RED}✗ Schema backup failed${NC}"
fi

# Get backup file sizes
echo ""
echo -e "${GREEN}=== Backup Summary ===${NC}"
echo "Backup directory: $BACKUP_DIR"
echo ""
echo "Files created:"
ls -lh "$CUSTOM_BACKUP" "$SQL_BACKUP" "$SCHEMA_BACKUP" 2>/dev/null | awk '{print $9, "-", $5}'

# Calculate total size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
echo ""
echo "Total backup directory size: $TOTAL_SIZE"

# Verify backup integrity (test the custom format backup)
echo ""
echo -e "${YELLOW}Verifying backup integrity...${NC}"
pg_restore --list "$CUSTOM_BACKUP" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup integrity verified${NC}"
else
    echo -e "${RED}✗ Backup verification failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Backup Completed Successfully! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Store backups in a safe location (external drive, cloud storage)"
echo "2. Test restore procedure periodically"
echo "3. Keep at least 3 recent backups"
echo ""
echo "To restore from custom format:"
echo "  pg_restore -d \"connection_string\" \"$CUSTOM_BACKUP\""
echo ""
echo "To restore from SQL format:"
echo "  psql \"connection_string\" < \"$SQL_BACKUP\""
echo ""

