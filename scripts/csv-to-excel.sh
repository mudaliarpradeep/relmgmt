#!/bin/bash

# CSV to Excel Converter
# Converts a CSV file to Excel format using Python and pandas

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default input and output files
INPUT_CSV="${1:-seed-data-resources.csv}"
OUTPUT_XLSX="${2:-${INPUT_CSV%.csv}.xlsx}"

echo -e "${BLUE}📊 CSV to Excel Converter${NC}"
echo "================================"

# Check if CSV file exists
if [ ! -f "$INPUT_CSV" ]; then
  echo -e "${RED}❌ CSV file not found: ${INPUT_CSV}${NC}"
  echo -e "${YELLOW}Usage: $0 [input.csv] [output.xlsx]${NC}"
  exit 1
fi

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
  echo -e "${RED}❌ Python 3 not found. Please install Python 3.${NC}"
  exit 1
fi

echo -e "${YELLOW}Converting: ${INPUT_CSV} → ${OUTPUT_XLSX}${NC}\n"

# Convert CSV to Excel using Python
python3 << PYTHON_SCRIPT
import sys
import os

try:
    import pandas as pd
except ImportError:
    print("${RED}❌ pandas not installed. Install it with:${NC}")
    print("   pip3 install pandas openpyxl")
    sys.exit(1)

try:
    import openpyxl
except ImportError:
    print("${RED}❌ openpyxl not installed. Install it with:${NC}")
    print("   pip3 install openpyxl")
    sys.exit(1)

try:
    # Read CSV
    input_file = "${INPUT_CSV}"
    output_file = "${OUTPUT_XLSX}"
    
    print(f"Reading CSV file: {input_file}")
    df = pd.read_csv(input_file)
    
    print(f"Found {len(df)} rows and {len(df.columns)} columns")
    
    # Save as Excel
    print(f"Writing Excel file: {output_file}")
    df.to_excel(output_file, index=False, engine='openpyxl')
    
    # Get file size
    file_size = os.path.getsize(output_file)
    
    print(f"\n${GREEN}✅ Conversion successful!${NC}")
    print(f"Output file: {output_file} ({file_size:,} bytes)")
    sys.exit(0)
    
except Exception as e:
    print(f"${RED}❌ Conversion failed: {e}${NC}")
    sys.exit(1)
PYTHON_SCRIPT

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo -e "\n${GREEN}✨ Done!${NC}"
else
  echo -e "\n${RED}❌ Conversion failed${NC}"
fi

exit $exit_code









