# Database Seeding Guide

**Last Updated**: October 22, 2025  
**Database**: Neon PostgreSQL

---

## 🎯 **Quick Start**

Seeds admin user + 30 sample resources:

```bash
# Set your Neon connection string
export NEON_DATABASE_URL="postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"

# Run seeding script
./scripts/seed-neon-database.sh
```

**What it creates:**
- ✅ 1 admin user (username: `admin`, password: `Release2024!`)
- ✅ 30 sample resources across 5 skill functions:
  - 6 Functional Design resources
  - 7 Technical Design resources (ForgeRock, SailPoint)
  - 6 Build resources (Talend, ForgeRock, SailPoint)
  - 6 Test resources (Automated, Manual)
  - 5 Platform resources

---

## 📋 **Prerequisites**

Before running seeding scripts:

1. **Neon Database Created**: ✅ (You already did this!)
2. **Backend Deployed**: Backend must be deployed at least once so Flyway creates the schema
3. **PostgreSQL Client**: `psql` command must be available
4. **Connection String**: Your Neon PostgreSQL connection string

---

## 🔑 **Default Login Credentials**

After seeding, use these credentials to log in:

```
Username: admin
Password: Release2024!
Email: admin@example.com
```

**Security Note**: Change the admin password after first login in a production environment!

---

## 🗄️ **Sample Resources Created**

The full seed creates a diverse team:

### **Functional Design Team (6 resources)**
- John Smith (LEVEL_5)
- James Thomas (LEVEL_6)
- Jessica Clark (LEVEL_7)
- Andrew Allen (LEVEL_5)
- Lauren Green (LEVEL_6)
- Tyler Mitchell (LEVEL_7)

### **Technical Design Team (7 resources)**
- Sarah Johnson (LEVEL_6, ForgeRock IDM)
- Jennifer Martinez (LEVEL_6, ForgeRock IG)
- Maria Garcia (LEVEL_7, ForgeRock UI)
- Daniel Rodriguez (LEVEL_5, SailPoint)
- Stephanie Young (LEVEL_6, ForgeRock IG)
- Brandon Adams (LEVEL_7, SailPoint)
- Kimberly Perez (LEVEL_5, ForgeRock IDM)

### **Build Team (6 resources)**
- Michael Chen (LEVEL_7, Talend)
- Robert Taylor (LEVEL_7, SailPoint)
- Christopher Lee (LEVEL_8, Talend)
- Ashley Lewis (LEVEL_8, ForgeRock IDM)
- Kevin King (LEVEL_7, Talend)
- Rachel Baker (LEVEL_5, ForgeRock UI)

### **Test Team (6 resources)**
- Emily Davis (LEVEL_5, Automated)
- Lisa Anderson (LEVEL_5, Manual)
- Matthew Harris (LEVEL_6, Automated)
- Joshua Walker (LEVEL_6, Manual)
- Nicole Wright (LEVEL_8, Automated)
- Justin Nelson (LEVEL_8, Manual)

### **Platform Team (5 resources)**
- David Wilson (LEVEL_8)
- Amanda White (LEVEL_5)
- Melissa Hall (LEVEL_7)
- Ryan Scott (LEVEL_5)
- Megan Carter (LEVEL_6)

All resources are:
- Status: ACTIVE
- Project dates: 2025-01-01 to 2025-12-31
- Ready for allocation to releases

---

## 🔧 **Troubleshooting**

### **Issue: "Connection failed"**

```bash
# Check your connection string format
echo $NEON_DATABASE_URL

# Should look like:
# postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require

# Test connection manually
psql "$NEON_DATABASE_URL" -c "SELECT version();"
```

### **Issue: "Database schema not initialized"**

```bash
# This means Flyway hasn't run yet
# Solution: Deploy your backend to Render first

# The backend's Flyway will automatically create:
# - All tables
# - Indexes
# - Constraints
# - Schema version tracking
```

### **Issue: "psql: command not found"**

```bash
# Install PostgreSQL client tools

# On macOS:
brew install postgresql

# On Ubuntu/Debian:
sudo apt-get install postgresql-client

# On Windows:
# Download from: https://www.postgresql.org/download/windows/
```

### **Issue: "Data already exists"**

The script will ask if you want to clear existing data:

```bash
⚠️  Database already contains data.

Do you want to clear existing data and reseed? (yes/no):
```

- Type `yes` to clear and reseed
- Type `no` to keep existing data and add new records (may cause conflicts)

---

## 🚀 **After Seeding**

### **1. Verify Data Was Created**

```bash
# Connect to your Neon database
psql "$NEON_DATABASE_URL"

# Check users
SELECT id, username, email FROM users;

# Check resources
SELECT COUNT(*) FROM resources;
SELECT skill_function, COUNT(*) 
FROM resources 
GROUP BY skill_function;

# Exit
\q
```

### **2. Test Login**

```bash
# Open your frontend (Render or Vercel URL)
# Click "Login"
# Enter:
#   Username: admin
#   Password: Release2024!
# Click "Sign In"
```

### **3. Start Using the System**

Now you can:
- ✅ View the resource roster
- ✅ Create new releases
- ✅ Add scope items and components
- ✅ Generate allocations
- ✅ View allocation reports

---

## 📊 **Advanced: Custom Seeding**

### **Add More Resources Manually**

```bash
# Connect to database
psql "$NEON_DATABASE_URL"

# Insert custom resource
INSERT INTO resources (
    name, employee_number, email, status,
    project_start_date, project_end_date,
    employee_grade, skill_function, skill_sub_function,
    created_at, updated_at
) VALUES (
    'Jane Doe',
    '10000099',
    'jane.doe@example.com',
    'ACTIVE',
    '2025-01-01',
    '2025-12-31',
    'LEVEL_7',
    'BUILD',
    'FORGEROCK_IDM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

### **Change Admin Password**

```bash
# Connect to database
psql "$NEON_DATABASE_URL"

# Update password (use BCrypt hash)
# For password "NewPassword123!":
UPDATE users 
SET password = '$2a$10$YOUR_NEW_BCRYPT_HASH_HERE'
WHERE username = 'admin';

# Generate BCrypt hash at: https://bcrypt-generator.com
# Use rounds: 10
```

---

## 🔐 **Security Best Practices**

### **Production Deployment**

1. **Change Default Password**:
   ```bash
   # After first login, change admin password via the UI
   # Or update directly in database with new BCrypt hash
   ```

2. **Use Environment Variables**:
   ```bash
   # Don't hardcode credentials in scripts
   export NEON_DATABASE_URL="..."
   ./scripts/seed-neon-database.sh
   ```

3. **Restrict Database Access**:
   ```bash
   # In Neon Dashboard:
   # Settings → IP Allow List
   # Add only your application's IPs
   ```

4. **Regular Backups**:
   ```bash
   # Run regular backups
   ./scripts/backup-database.sh neon
   ```

---

## 📚 **Related Scripts**

| Script | Purpose | Usage |
|--------|---------|-------|
| `seed-neon-database.sh` | Full database seed | `./scripts/seed-neon-database.sh` |
| `backup-database.sh` | Backup Neon DB | `./scripts/backup-database.sh neon` |
| `migrate-to-neon.sh` | Migrate from Render | `./scripts/migrate-to-neon.sh` |

---

## ✅ **Seeding Checklist**

Before running production:

- [ ] Neon database created
- [ ] Backend deployed (schema initialized)
- [ ] Connection string tested
- [ ] Admin user created
- [ ] Sample resources seeded (optional)
- [ ] Login tested via frontend
- [ ] Default password changed
- [ ] Backup script tested

---

**Need Help?**

- Check Neon connection: `psql "$NEON_DATABASE_URL" -c "SELECT 1;"`
- View tables: `psql "$NEON_DATABASE_URL" -c "\dt"`
- Check logs: Look at script output for detailed error messages
- Verify backend: `curl https://your-backend.onrender.com/actuator/health`

---

**Ready to seed?** 🌱

```bash
# Set connection string
export NEON_DATABASE_URL="your-connection-string"

# Run full seed
./scripts/seed-neon-database.sh
```

