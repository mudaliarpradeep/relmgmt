# Neon Database Setup Guide

**Last Updated**: October 22, 2025  
**Platform**: Neon.tech (PostgreSQL)  
**Tier**: Free (0.5GB storage)

---

## 📋 **What is Neon?**

Neon is a serverless PostgreSQL database platform that offers:
- ✅ Generous free tier (0.5GB storage)
- ✅ Automatic scaling and suspension
- ✅ Branching (like Git for databases)
- ✅ Fast provisioning (<1 second)
- ✅ Built on standard PostgreSQL (compatibility guaranteed)

**Official Website**: https://neon.tech  
**Documentation**: https://neon.tech/docs

---

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Create Neon Account**

1. Go to https://neon.tech
2. Click "Sign Up"
3. Choose GitHub OAuth (easiest option)
4. Verify your email if prompted

**Cost**: $0 - No credit card required

---

### **Step 2: Create New Project**

1. After login, click "**Create Project**"
2. Fill in project details:
   ```
   Project Name: relmgmt-production
   PostgreSQL Version: 16 (recommended)
   Region: Choose closest to your users
     - US East (N. Virginia) - for US East Coast
     - EU Central (Frankfurt) - for Europe
     - Asia Pacific (Singapore) - for Asia
   ```

3. Click "**Create Project**"

**Time**: ~2 seconds (seriously!)

---

### **Step 3: Get Connection Details**

After project creation, Neon shows your connection string:

```bash
# Connection String Format:
postgresql://[user]:[password]@[host]/[database]?sslmode=require

# Example:
postgresql://alex:AbC123xyz@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Save these details** (you'll need them):

```
Host: ep-xxxxx.region.aws.neon.tech
Port: 5432
Database: neondb
Username: [auto-generated]
Password: [auto-generated]
```

---

### **Step 4: Connection String Conversion**

Neon provides PostgreSQL format, but Spring Boot needs JDBC format:

**Neon Format** (what you get):
```
postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

**JDBC Format** (what Spring Boot needs):
```
jdbc:postgresql://ep-xxxxx.region.aws.neon.tech:5432/neondb?sslmode=require
```

**Key Differences**:
1. Add `jdbc:` prefix
2. Add `:5432` port explicitly
3. Keep `?sslmode=require` (SSL is mandatory)

---

## 🔧 **Configuration for Render Backend**

### **Environment Variables in Render Dashboard**

Navigate to: `Render Dashboard → Your Backend Service → Environment → Environment Variables`

**Add/Update these variables**:

```bash
# Database Connection (JDBC format)
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-xxxxx.region.aws.neon.tech:5432/neondb?sslmode=require
SPRING_DATASOURCE_USERNAME=your_neon_user
SPRING_DATASOURCE_PASSWORD=your_neon_password

# Connection Pool (Optimized for Neon)
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=5
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=300000

# Database Settings
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_CLEAN_DISABLED=true
SPRING_JPA_HIBERNATE_DDL_AUTO=none

# Keep existing values
SPRING_PROFILES_ACTIVE=prod
APP_JWT_SECRET=[your existing JWT secret]
LOGGING_LEVEL_ROOT=WARN
LOGGING_LEVEL_COM_POLYCODER_RELMGMT=INFO
```

**After saving**: Render will automatically redeploy your backend.

---

## 🧪 **Test Connection**

### **Method 1: Using psql Client**

```bash
# Connect using the PostgreSQL connection string
psql "postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"

# Once connected:
\dt           # List tables
\l            # List databases
\q            # Exit
```

### **Method 2: Using Neon SQL Editor**

1. Go to Neon dashboard
2. Select your project
3. Click "**SQL Editor**" in left sidebar
4. Run test query:
   ```sql
   SELECT version();
   SELECT current_database();
   ```

### **Method 3: Test from Render Backend**

```bash
# After deploying with Neon credentials
curl https://your-backend.onrender.com/actuator/health

# Expected response:
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    }
  }
}
```

---

## 📊 **Neon Free Tier Limits**

| Feature | Free Tier | Notes |
|---------|-----------|-------|
| **Storage** | 0.5 GB | Plenty for MVP/small apps |
| **Compute Time** | 100 hours/month | Active time only (auto-suspends) |
| **Projects** | 1 | Sufficient for production |
| **Branches** | 10 | Great for dev/staging/feature branches |
| **Max Connections** | ~100 | Way more than you need |
| **Regions** | All regions | No restrictions |
| **Backups** | 7 days retention | Automatic point-in-time recovery |
| **Support** | Community | Paid plans get priority support |

**Key Point**: 0.5GB is approximately:
- 500,000 rows in a typical table
- Enough for ~1,000 releases with full data
- ~5,000 resources with allocation history

---

## 🔐 **Security Best Practices**

### **1. Connection Security**

```bash
# ✅ ALWAYS use SSL
?sslmode=require

# ❌ NEVER disable SSL
?sslmode=disable  # DON'T DO THIS
```

### **2. Password Management**

```bash
# ✅ Store in environment variables
SPRING_DATASOURCE_PASSWORD=${NEON_PASSWORD}

# ❌ Never commit passwords to Git
# ❌ Never hardcode in application.yml
```

### **3. Connection Pooling**

```bash
# ✅ Use small pool for free tier
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=5

# ❌ Don't use large pools (wastes connections)
# Free tier Render backend only needs 1-3 connections
```

### **4. IP Allowlist (Optional)**

Neon free tier allows connections from any IP by default. For added security:

1. Go to Neon Dashboard → Settings → IP Allow List
2. Add Render's IP ranges (if known)
3. Or keep open for ease of use (SSL protects data in transit)

---

## 🔄 **Database Branching (Advanced)**

Neon's killer feature: Database branching like Git!

### **Use Cases**:
- Create development branch from production
- Test migrations on a branch before applying to main
- Create feature branches for testing

### **How to Create Branch**:

```bash
# Via Neon Dashboard:
1. Select your project
2. Click "Branches" in left sidebar
3. Click "Create Branch"
4. Choose source branch (e.g., main)
5. Name your branch (e.g., "development")
6. Click "Create"

# Get branch connection string:
postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?options=endpoint%3Ddev-branch-xxxxx
```

**Example Setup**:
- `main` branch → Production (Render backend points here)
- `staging` branch → Staging environment
- `dev` branch → Development/testing

---

## 📈 **Monitoring & Management**

### **Neon Dashboard Features**

1. **Operations Tab**:
   - View all database queries
   - Monitor query performance
   - Identify slow queries

2. **Monitoring Tab**:
   - Storage usage graph
   - Compute time usage
   - Connection count
   - Query metrics

3. **Settings Tab**:
   - Auto-suspend configuration (default: 5 minutes)
   - Connection pooling settings
   - IP allowlist
   - Delete protection

### **Key Metrics to Monitor**:

```bash
# Storage Usage
Current: Check Neon dashboard
Alert at: > 400 MB (80% of 0.5GB limit)

# Compute Time
Current: Check monthly usage
Alert at: > 80 hours (80% of 100 hours)

# Connections
Current: Typically 1-5 for small apps
Max: ~100
```

---

## 💾 **Backup Strategy**

Neon provides automatic backups, but **also implement manual backups**:

### **Automated Backups (Neon)**:
- Free tier: 7 days point-in-time recovery
- Automatic, no configuration needed
- Restore via Neon dashboard

### **Manual Backups (Recommended)**:

```bash
# Use the provided backup script
./scripts/backup-database.sh neon

# Or manual pg_dump
pg_dump "postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require" \
  --no-owner \
  --no-acl \
  --format=custom \
  --file=backup-$(date +%Y%m%d).dump

# Schedule weekly backups (cron example)
0 2 * * 0 /path/to/scripts/backup-database.sh neon
```

### **Backup Storage Options**:
- Local disk (temporary)
- Cloud storage (AWS S3, Cloudflare R2)
- GitHub (for small backups via LFS)

---

## 🚨 **Troubleshooting**

### **Issue 1: "Connection Refused"**

```bash
# Symptoms:
Connection to database failed

# Solutions:
1. Check connection string format (must include ?sslmode=require)
2. Verify credentials (copy-paste from Neon dashboard)
3. Check if database is suspended (first query wakes it up)
4. Test with psql client to isolate issue
```

### **Issue 2: "SSL Connection Required"**

```bash
# Symptoms:
FATAL: SSL connection is required

# Solution:
# Always append: ?sslmode=require
postgresql://user:pass@host/db?sslmode=require
```

### **Issue 3: "Too Many Connections"**

```bash
# Symptoms:
FATAL: sorry, too many clients already

# Solutions:
1. Reduce connection pool size:
   SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=3
2. Enable connection pooling (PgBouncer)
3. Check for connection leaks in application
```

### **Issue 4: "Slow First Query After Idle"**

```bash
# Symptoms:
First query takes 1-3 seconds after inactivity

# Explanation:
- Neon auto-suspends after 5 minutes idle
- First query wakes the database
- This is normal behavior

# Mitigation:
- Accept it (1-3s is reasonable for free tier)
- Implement retry logic in application
- Or keep alive with periodic health checks
```

---

## 📚 **Additional Resources**

### **Official Documentation**:
- Getting Started: https://neon.tech/docs/get-started-with-neon
- Connection Strings: https://neon.tech/docs/connect/connection-strings
- Branching Guide: https://neon.tech/docs/guides/branching
- Security: https://neon.tech/docs/security/security-overview

### **Community**:
- Discord: https://discord.gg/neon
- GitHub Discussions: https://github.com/neondatabase/neon/discussions
- Twitter: @neondatabase

### **Migration Guides**:
- From Render: `/docs/MIGRATION-GUIDE-VERCEL-NEON.md`
- From Supabase: https://neon.tech/docs/import/migrate-from-supabase
- From other PostgreSQL: https://neon.tech/docs/import/import-from-postgres

---

## ✅ **Setup Checklist**

Use this checklist to verify your Neon setup:

```
Database Setup:
[ ] Neon account created
[ ] Project created with appropriate region
[ ] Connection string saved securely
[ ] JDBC format connection string prepared

Render Backend Configuration:
[ ] SPRING_DATASOURCE_URL updated
[ ] SPRING_DATASOURCE_USERNAME set
[ ] SPRING_DATASOURCE_PASSWORD set
[ ] Connection pool settings configured
[ ] Flyway settings verified
[ ] Backend redeployed successfully

Testing:
[ ] psql connection test successful
[ ] Backend health check passes
[ ] Can query data via API
[ ] Can create/update/delete records
[ ] No errors in Render logs

Monitoring:
[ ] Neon dashboard bookmarked
[ ] Storage usage checked
[ ] Backup strategy implemented
[ ] Alert thresholds set

Documentation:
[ ] Connection details documented (securely)
[ ] Team has access to Neon dashboard
[ ] Backup procedure documented
[ ] Rollback plan prepared
```

---

**Setup Status**: Ready for Production  
**Estimated Setup Time**: 10-15 minutes  
**Cost**: $0/month (free tier)

For migration assistance, refer to the comprehensive migration guide:
`/docs/MIGRATION-GUIDE-VERCEL-NEON.md`

