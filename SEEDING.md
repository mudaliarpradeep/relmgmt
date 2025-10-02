# Resource Seeding Guide

This guide provides **2 rapid methods** to seed sample resources into the Release Management System.

## 📊 Sample Data Overview

Both methods create **30 sample resources** with the following distribution:
- **6 Functional Design** resources (Levels 5-7)
- **7 Technical Design** resources with various sub-skills (ForgeRock IDM, IG, UI, SailPoint)
- **6 Build** resources with various sub-skills (Talend, SailPoint, ForgeRock IDM, ForgeRock UI)
- **6 Test** resources (Automated & Manual)
- **5 Platform** resources (Levels 5-8)

---

## Method 1: Excel Import via API (Recommended)

**Best for:** Quick seeding on Render deployment or any remote instance

### Steps:

1. **Excel file is already created**: `seed-data-resources.xlsx` (30 resources)

2. **Use the automated script**:
   ```bash
   cd /Users/pkm/Code/cursor/relmgmt
   ./scripts/seed-resources.sh
   ```

   Or manually:

   ```bash
   # Login to the application: https://relmgmt.onrender.com
   # Navigate to: Resources → Import
   # Upload: seed-data-resources.xlsx
   # Review import results
   ```

3. **For custom API URL**:
   ```bash
   API_BASE_URL=https://your-backend.com \
   USERNAME=admin \
   PASSWORD=Release2024! \
   ./scripts/seed-resources.sh
   ```

**Pros:**
- ✅ Batch processing (all 30 resources at once)
- ✅ Full validation before import
- ✅ Error reporting for each row
- ✅ Works with Render deployment
- ✅ No database access needed

**Cons:**
- ⚠️ Requires authentication token
- ⚠️ Excel file upload size limits

---

## Method 2: REST API Script (Individual Creates)

**Best for:** CI/CD pipelines, remote deployments, testing

### Steps:

1. **Run the API seeding script**:
   ```bash
   cd /Users/pkm/Code/cursor/relmgmt
   ./scripts/seed-resources-api.sh
   ```

2. **With custom API URL**:
   ```bash
   API_BASE_URL=https://your-backend.com \
   USERNAME=admin \
   PASSWORD=Release2024! \
   ./scripts/seed-resources-api.sh
   ```

3. **For local development**:
   ```bash
   API_BASE_URL=http://localhost:8080 \
   ./scripts/seed-resources-api.sh
   ```

**Pros:**
- ✅ Works with any deployment (local, staging, production)
- ✅ Full application validation
- ✅ Audit trail in transaction logs
- ✅ Easy to customize and extend
- ✅ Fine-grained control over each resource

**Cons:**
- ⚠️ Slower (30 individual API calls)
- ⚠️ Requires authentication
- ⚠️ Network overhead for multiple requests

---

## 🎯 Quick Start Recommendations

### For Render Deployment (Recommended):
```bash
# Excel import (fastest for bulk data)
cd /Users/pkm/Code/cursor/relmgmt
./scripts/seed-resources.sh

# OR upload manually via UI:
# 1. Login to https://relmgmt.onrender.com
# 2. Go to Resources → Import
# 3. Upload seed-data-resources.xlsx
```

### For Local Development:
```bash
# Option 1: Excel import script
./scripts/seed-resources.sh

# Option 2: API script (individual creates)
./scripts/seed-resources-api.sh
```

### For Production/Remote Deployment:
```bash
# Excel import with custom URL
API_BASE_URL=https://your-backend.com \
USERNAME=admin \
PASSWORD=your-password \
./scripts/seed-resources.sh
```

---

## 🔧 Customization

### Adding More Resources:

**Option A: Edit CSV file and regenerate Excel**
```bash
# 1. Edit seed-data-resources.csv
# Add rows following the same format:
# Name,Employee Number,Email,Status,Start Date,End Date,Grade,Skill Function,Skill Sub Function

# 2. Regenerate Excel file
python3 << 'EOF'
import pandas as pd
df = pd.read_csv('seed-data-resources.csv')
df.to_excel('seed-data-resources.xlsx', index=False, engine='openpyxl')
print("✅ Excel file updated")
EOF
```

**Option B: Edit API script**
```bash
# Edit scripts/seed-resources-api.sh
# Add create_resource calls following the same format
```

### Field Requirements:

| Field | Format | Example | Required |
|-------|--------|---------|----------|
| Name | String (max 100) | "John Smith" | ✅ Yes |
| Employee Number | 8 digits | "10000001" | ✅ Yes (unique) |
| Email | Valid email | "john@example.com" | ✅ Yes (unique) |
| Status | ACTIVE or INACTIVE | "ACTIVE" | ✅ Yes |
| Project Start Date | YYYY-MM-DD | "2025-01-01" | ✅ Yes |
| Project End Date | YYYY-MM-DD | "2025-12-31" | ❌ Optional |
| Employee Grade | LEVEL_1 to LEVEL_12 | "LEVEL_5" | ✅ Yes |
| Skill Function | See below | "BUILD" | ✅ Yes |
| Skill Sub Function | See below | "TALEND" | ❌ Optional |

### Valid Values:

**Skill Functions:**
- `FUNCTIONAL_DESIGN`
- `TECHNICAL_DESIGN`
- `BUILD`
- `TEST`
- `PLATFORM`

**Skill Sub Functions:**
- For BUILD: `TALEND`, `FORGEROCK_IDM`, `SAILPOINT`, `FORGEROCK_UI`
- For TECHNICAL_DESIGN: `FORGEROCK_IDM`, `FORGEROCK_IG`, `FORGEROCK_UI`, `SAILPOINT`
- For TEST: `AUTOMATED`, `MANUAL`
- For FUNCTIONAL_DESIGN & PLATFORM: Leave empty/null

---

## 🧹 Cleanup

To remove all seeded resources:

### Via UI:
- Navigate to Resources page
- Filter by employee numbers 10000001-10000030
- Select and delete resources individually or in batches

### Via API (if direct database access not available):
```bash
# Note: Bulk delete via API requires individual DELETE calls
# or custom endpoint implementation
```

---

## 📝 Files Created

| File | Purpose | Location |
|------|---------|----------|
| `seed-data-resources.csv` | Sample data in CSV format | Project root |
| `seed-data-resources.xlsx` | Sample data in Excel format (ready to import) | Project root |
| `scripts/seed-resources.sh` | Excel import automation | `scripts/` |
| `scripts/seed-resources-api.sh` | API-based seeding (individual creates) | `scripts/` |

---

## ❓ Troubleshooting

### "Login failed" error:
- Verify credentials: `admin` / `Release2024!`
- Check backend is running and accessible at https://relmgmt-backend-pr2z.onrender.com
- Verify API URL is correct in the script

### "Duplicate employee number" error:
- Resources already exist with these employee numbers (10000001-10000030)
- Delete existing resources first via UI or use different employee numbers
- Edit the CSV/Excel file to use different employee numbers

### "Excel file not found" error:
- Ensure `seed-data-resources.xlsx` exists in the project root
- Regenerate using: `python3 -c "import pandas as pd; df = pd.read_csv('seed-data-resources.csv'); df.to_excel('seed-data-resources.xlsx', index=False, engine='openpyxl')"`

### "Import validation errors":
- Check Excel file format matches expected columns
- Verify all required fields are filled
- Check employee numbers are exactly 8 digits
- Verify emails are unique and valid format

---

## 🚀 Next Steps

After seeding resources:
1. Create a release
2. Add projects to the release
3. Define scope items with effort estimates
4. Run allocation to assign resources
5. View allocations in the Weekly Allocation Table

Happy seeding! 🌱

