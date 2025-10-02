# Quick Start: Seed Resources in 30 Seconds

## 🚀 Fastest Method for Render: Excel Import Script

```bash
cd /Users/pkm/Code/cursor/relmgmt
./scripts/seed-resources.sh
```

That's it! This uploads the Excel file with **30 diverse sample resources** to your Render deployment.

---

## 📋 What You Get

- **6 Functional Design** resources
- **7 Technical Design** resources (ForgeRock IDM, IG, UI, SailPoint)
- **6 Build** resources (Talend, SailPoint, ForgeRock)
- **6 Test** resources (Automated & Manual)
- **5 Platform** resources

All resources are ACTIVE from 2025-01-01 to 2025-12-31.

---

## 🎯 Alternative Methods

### Manual Upload via UI:
```bash
# 1. Login to https://relmgmt.onrender.com
# 2. Navigate to: Resources → Import
# 3. Upload: seed-data-resources.xlsx
# (File already created in project root)
```

### Individual API Creates:
```bash
# Creates resources one by one via REST API
./scripts/seed-resources-api.sh
```

### Custom API URL:
```bash
# For local or different deployment
API_BASE_URL=http://localhost:8080 ./scripts/seed-resources.sh
```

---

## 🧹 Cleanup

Remove all seeded resources via UI:
```
1. Login to app
2. Go to Resources page
3. Filter by employee numbers: 10000001-10000030
4. Delete resources individually or in batches
```

---

## 📚 Full Documentation

See [SEEDING.md](./SEEDING.md) for complete details, customization, and troubleshooting.

---

## ✨ Example Output

### Excel Import Script:
```
🌱 Resource Seeding Script
================================

Step 1: Authenticating...
✅ Authentication successful

Step 2: Preparing data...
✅ Conversion successful

Step 3: Uploading resources...

Import Response:
{
  "totalProcessed": 30,
  "successful": 30,
  "failed": 0,
  "errors": []
}

✅ Successfully imported 30 resources

✨ Seeding complete!
```

### Manual Upload Result:
```
Import Summary:
- Total Processed: 30 rows
- Successfully Imported: 30 resources
- Failed: 0
- Errors: None

All resources have been imported successfully!
```

Ready to go! 🎉

