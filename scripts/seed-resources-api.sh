#!/bin/bash

# Seed Resources via REST API
# This script creates resources one by one via the REST API

# Configuration
API_BASE_URL="${API_BASE_URL:-https://relmgmt-backend-pr2z.onrender.com}"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-Release2024!}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 API-based Resource Seeding Script${NC}"
echo "========================================="

# Login
echo -e "\n${YELLOW}Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Authenticated${NC}"

# Resource creation function
create_resource() {
  local name="$1"
  local empNum="$2"
  local email="$3"
  local grade="$4"
  local skillFunc="$5"
  local skillSub="$6"
  
  PAYLOAD=$(cat <<EOF
{
  "name": "$name",
  "employeeNumber": "$empNum",
  "email": "$email",
  "status": "ACTIVE",
  "projectStartDate": "2025-01-01",
  "projectEndDate": "2025-12-31",
  "employeeGrade": "$grade",
  "skillFunction": "$skillFunc",
  "skillSubFunction": $skillSub
}
EOF
)
  
  RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/v1/resources" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")
  
  if echo "$RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✓${NC} $name"
    return 0
  else
    echo -e "${RED}✗${NC} $name - $(echo $RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
    return 1
  fi
}

# Create resources
echo -e "\n${YELLOW}Creating resources...${NC}\n"

SUCCESS=0
FAILED=0

# Functional Design Team
create_resource "John Smith" "10000001" "john.smith@example.com" "LEVEL_5" "FUNCTIONAL_DESIGN" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "James Thomas" "10000009" "james.thomas@example.com" "LEVEL_6" "FUNCTIONAL_DESIGN" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Jessica Clark" "10000014" "jessica.clark@example.com" "LEVEL_7" "FUNCTIONAL_DESIGN" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Andrew Allen" "10000019" "andrew.allen@example.com" "LEVEL_5" "FUNCTIONAL_DESIGN" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Lauren Green" "10000024" "lauren.green@example.com" "LEVEL_6" "FUNCTIONAL_DESIGN" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Tyler Mitchell" "10000029" "tyler.mitchell@example.com" "LEVEL_7" "FUNCTIONAL_DESIGN" "null" && ((SUCCESS++)) || ((FAILED++))

# Technical Design Team
create_resource "Sarah Johnson" "10000002" "sarah.johnson@example.com" "LEVEL_6" "TECHNICAL_DESIGN" '"FORGEROCK_IDM"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Jennifer Martinez" "10000006" "jennifer.martinez@example.com" "LEVEL_6" "TECHNICAL_DESIGN" '"FORGEROCK_IG"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Maria Garcia" "10000010" "maria.garcia@example.com" "LEVEL_7" "TECHNICAL_DESIGN" '"FORGEROCK_UI"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Daniel Rodriguez" "10000015" "daniel.rodriguez@example.com" "LEVEL_5" "TECHNICAL_DESIGN" '"SAILPOINT"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Stephanie Young" "10000020" "stephanie.young@example.com" "LEVEL_6" "TECHNICAL_DESIGN" '"FORGEROCK_IG"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Brandon Adams" "10000025" "brandon.adams@example.com" "LEVEL_7" "TECHNICAL_DESIGN" '"SAILPOINT"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Kimberly Perez" "10000030" "kimberly.perez@example.com" "LEVEL_5" "TECHNICAL_DESIGN" '"FORGEROCK_IDM"' && ((SUCCESS++)) || ((FAILED++))

# Build Team
create_resource "Michael Chen" "10000003" "michael.chen@example.com" "LEVEL_7" "BUILD" '"TALEND"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Robert Taylor" "10000007" "robert.taylor@example.com" "LEVEL_7" "BUILD" '"SAILPOINT"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Christopher Lee" "10000011" "christopher.lee@example.com" "LEVEL_8" "BUILD" '"TALEND"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Ashley Lewis" "10000016" "ashley.lewis@example.com" "LEVEL_8" "BUILD" '"FORGEROCK_IDM"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Kevin King" "10000021" "kevin.king@example.com" "LEVEL_7" "BUILD" '"TALEND"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Rachel Baker" "10000026" "rachel.baker@example.com" "LEVEL_5" "BUILD" '"FORGEROCK_UI"' && ((SUCCESS++)) || ((FAILED++))

# Test Team
create_resource "Emily Davis" "10000004" "emily.davis@example.com" "LEVEL_5" "TEST" '"AUTOMATED"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Lisa Anderson" "10000008" "lisa.anderson@example.com" "LEVEL_5" "TEST" '"MANUAL"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Matthew Harris" "10000013" "matthew.harris@example.com" "LEVEL_6" "TEST" '"AUTOMATED"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Joshua Walker" "10000017" "joshua.walker@example.com" "LEVEL_6" "TEST" '"MANUAL"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Nicole Wright" "10000022" "nicole.wright@example.com" "LEVEL_8" "TEST" '"AUTOMATED"' && ((SUCCESS++)) || ((FAILED++))
create_resource "Justin Nelson" "10000027" "justin.nelson@example.com" "LEVEL_8" "TEST" '"MANUAL"' && ((SUCCESS++)) || ((FAILED++))

# Platform Team
create_resource "David Wilson" "10000005" "david.wilson@example.com" "LEVEL_8" "PLATFORM" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Amanda White" "10000012" "amanda.white@example.com" "LEVEL_5" "PLATFORM" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Melissa Hall" "10000018" "melissa.hall@example.com" "LEVEL_7" "PLATFORM" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Ryan Scott" "10000023" "ryan.scott@example.com" "LEVEL_5" "PLATFORM" "null" && ((SUCCESS++)) || ((FAILED++))
create_resource "Megan Carter" "10000028" "megan.carter@example.com" "LEVEL_6" "PLATFORM" "null" && ((SUCCESS++)) || ((FAILED++))

# Summary
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Successfully created: ${SUCCESS} resources${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ Failed: ${FAILED} resources${NC}"
fi
echo -e "${BLUE}=========================================${NC}"

