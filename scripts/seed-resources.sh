#!/bin/bash

# Seed Resources Script
# This script uploads the CSV file to create seed resources via the API

# Configuration
API_BASE_URL="${API_BASE_URL:-https://relmgmt-backend-pr2z.onrender.com}"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-Release2024!}"
CSV_FILE="seed-data-resources.csv"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🌱 Resource Seeding Script${NC}"
echo "================================"

# Step 1: Login to get JWT token
echo -e "\n${YELLOW}Step 1: Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed. Response: ${LOGIN_RESPONSE}${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Authentication successful${NC}"

# Step 2: Convert CSV to Excel (if needed) or upload CSV
echo -e "\n${YELLOW}Step 2: Preparing data...${NC}"

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
  echo -e "${RED}❌ CSV file not found: ${CSV_FILE}${NC}"
  exit 1
fi

# Convert CSV to Excel using Python (if Python is available)
if command -v python3 &> /dev/null; then
  echo -e "${YELLOW}Converting CSV to Excel...${NC}"
  
  python3 << 'PYTHON_SCRIPT'
import pandas as pd
import sys

try:
    # Read CSV
    df = pd.read_csv('seed-data-resources.csv')
    
    # Save as Excel
    df.to_excel('seed-data-resources.xlsx', index=False, engine='openpyxl')
    
    print("✅ Conversion successful")
    sys.exit(0)
except Exception as e:
    print(f"❌ Conversion failed: {e}")
    sys.exit(1)
PYTHON_SCRIPT

  if [ $? -eq 0 ]; then
    UPLOAD_FILE="seed-data-resources.xlsx"
  else
    echo -e "${YELLOW}⚠️  Could not convert to Excel. Install pandas and openpyxl:${NC}"
    echo "   pip3 install pandas openpyxl"
    exit 1
  fi
else
  echo -e "${RED}❌ Python 3 not found. Please install Python 3 to convert CSV to Excel.${NC}"
  exit 1
fi

# Step 3: Upload Excel file
echo -e "\n${YELLOW}Step 3: Uploading resources...${NC}"
IMPORT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/v1/resources/import" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@${UPLOAD_FILE}")

echo -e "\n${GREEN}Import Response:${NC}"
echo "$IMPORT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$IMPORT_RESPONSE"

# Check if import was successful
SUCCESSFUL=$(echo $IMPORT_RESPONSE | grep -o '"successful":[0-9]*' | cut -d':' -f2)
FAILED=$(echo $IMPORT_RESPONSE | grep -o '"failed":[0-9]*' | cut -d':' -f2)

if [ ! -z "$SUCCESSFUL" ] && [ "$SUCCESSFUL" -gt 0 ]; then
  echo -e "\n${GREEN}✅ Successfully imported ${SUCCESSFUL} resources${NC}"
  if [ ! -z "$FAILED" ] && [ "$FAILED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  ${FAILED} resources failed to import${NC}"
  fi
else
  echo -e "\n${RED}❌ Import failed${NC}"
fi

# Cleanup
rm -f seed-data-resources.xlsx

echo -e "\n${GREEN}✨ Seeding complete!${NC}"

