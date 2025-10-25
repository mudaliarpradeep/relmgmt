# Migration Guide: Vercel + Render + Neon Setup

**Migration Date**: October 22, 2025  
**Status**: Ready for Execution  
**Estimated Time**: 2-3 hours  
**Downtime Required**: ~5-10 minutes

---

## 📋 **Migration Overview**

This guide walks you through migrating from:
- **FROM**: Render (FE + BE + DB - all on paid tier)
- **TO**: Vercel (FE) + Render Free (BE) + Neon (DB)

### **Why This Architecture?**

✅ **Cost Reduction**: $15-25/month → **$0/month** (all free tiers)  
✅ **Better Performance**: Vercel global CDN for frontend  
✅ **Minimal Risk**: Backend stays on Render (no code changes)  
✅ **Easy Rollback**: Can revert database in <30 minutes  

### **What's Changing?**

| Component | Before | After | Impact |
|-----------|--------|-------|--------|
| **Frontend** | Render Static Site | Vercel | ✅ Better CDN, faster deploys |
| **Backend** | Render Web Service (Paid) | Render Web Service (Free) | ⚠️ Cold starts after 15min idle |
| **Database** | Render PostgreSQL (Paid) | Neon PostgreSQL (Free) | ✅ 0.5GB free, auto-scaling |

---

## ⏱️ **Migration Timeline**

```
Phase 1: Setup (30 min)
  ├── Create Neon account and database
  ├── Create Vercel account and project
  └── Backup current Render database

Phase 2: Database Migration (45 min)
  ├── Export data from Render
  ├── Import data to Neon
  ├── Verify data integrity
  └── Update connection strings

Phase 3: Backend Update (15 min)
  ├── Update Render env vars (Neon connection)
  ├── Test backend connectivity
  └── Verify API functionality

Phase 4: Frontend Migration (30 min)
  ├── Deploy frontend to Vercel
  ├── Configure environment variables
  ├── Test end-to-end functionality
  └── Update DNS/custom domain (if applicable)

Phase 5: Cleanup (15 min)
  ├── Monitor for issues
  ├── Delete old Render database (after 7 days)
  └── Update documentation
```

---

## 🎯 **Pre-Migration Checklist**

### **Required Accounts**
- [ ] Neon.tech account (free tier)
- [ ] Vercel account (free tier)
- [ ] Access to Render dashboard
- [ ] GitHub repository access

### **Required Tools**
- [ ] `psql` client installed (for database operations)
- [ ] `pg_dump` and `pg_restore` available
- [ ] Vercel CLI installed (optional but recommended)
- [ ] Git access from terminal

### **Backup & Safety**
- [ ] Current database backed up locally
- [ ] GitHub repository has latest code
- [ ] Document current environment variables
- [ ] Test credentials ready

---

## 📊 **Phase 1: Setup & Preparation**

### **Step 1.1: Create Neon Database**

1. **Sign up for Neon**: https://neon.tech
   - Use GitHub OAuth for easy signup
   - Select free tier (no credit card required)

2. **Create New Project**:
   ```
   Project Name: relmgmt-production
   Region: Choose closest to your users (e.g., US East, EU West)
   PostgreSQL Version: 16 (latest stable)
   ```

3. **Note Your Connection Details**:
   ```
   Neon will provide a connection string like:
   postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```

4. **Save These Values** (you'll need them later):
   ```
   Host: ep-xxxxx.region.aws.neon.tech
   Database: neondb
   Username: user
   Password: [generated password]
   Port: 5432
   Connection String: [full connection string]
   ```

### **Step 1.2: Create Vercel Project**

1. **Sign up for Vercel**: https://vercel.com
   - Use GitHub OAuth
   - Import your repository

2. **Import Repository**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Don't Deploy Yet** - we'll configure environment variables first

### **Step 1.3: Backup Current Render Database**

```bash
# Get your current Render database credentials from dashboard
# Then backup your database

# Create backup directory
mkdir -p ~/relmgmt-backups
cd ~/relmgmt-backups

# Backup from Render database
pg_dump "postgresql://render_user:render_password@render-host/render_db?sslmode=require" \
  --no-owner \
  --no-acl \
  --format=custom \
  --file=relmgmt-backup-$(date +%Y%m%d-%H%M%S).dump

# Also create SQL format for easy inspection
pg_dump "postgresql://render_user:render_password@render-host/render_db?sslmode=require" \
  --no-owner \
  --no-acl \
  --format=plain \
  --file=relmgmt-backup-$(date +%Y%m%d-%H%M%S).sql

echo "✅ Backup completed successfully!"
```

---

## 🗄️ **Phase 2: Database Migration to Neon**

### **Step 2.1: Verify Neon Database Connection**

```bash
# Test connection to Neon
psql "postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"

# If connected successfully, run:
\dt  # Should show empty (no tables yet)
\q   # Exit
```

### **Step 2.2: Migrate Data to Neon**

```bash
# Method 1: Using pg_restore (from custom format backup)
pg_restore \
  --verbose \
  --no-owner \
  --no-acl \
  -d "postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require" \
  relmgmt-backup-YYYYMMDD-HHMMSS.dump

# Method 2: Using psql (from SQL format backup)
psql "postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require" \
  < relmgmt-backup-YYYYMMDD-HHMMSS.sql
```

### **Step 2.3: Verify Data Migration**

```bash
# Connect to Neon database
psql "postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"

# Verify tables exist
\dt

# Check record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'releases', COUNT(*) FROM releases
UNION ALL
SELECT 'allocations', COUNT(*) FROM allocations
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

# Verify schema version (Flyway)
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;

# Exit
\q
```

### **Step 2.4: Test Backend Connection to Neon (Local)**

```bash
# Update your local backend/.env or application-dev.yml temporarily
cd backend

# Test connection with Spring Boot
export SPRING_DATASOURCE_URL="jdbc:postgresql://ep-xxxxx.region.aws.neon.tech:5432/neondb?sslmode=require"
export SPRING_DATASOURCE_USERNAME="your_neon_user"
export SPRING_DATASOURCE_PASSWORD="your_neon_password"

# Run backend locally
./gradlew bootRun

# In another terminal, test API
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}

# Test a real endpoint
curl http://localhost:8080/api/v1/resources
# Should return your resources data
```

---

## 🔧 **Phase 3: Update Render Backend Configuration**

### **Step 3.1: Update Render Environment Variables**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service**: `relmgmt-backend`
3. **Navigate to**: Environment → Environment Variables
4. **Update/Add these variables**:

```bash
# Database Connection (Neon)
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-xxxxx.region.aws.neon.tech:5432/neondb?sslmode=require
SPRING_DATASOURCE_USERNAME=your_neon_user
SPRING_DATASOURCE_PASSWORD=your_neon_password

# Keep existing variables
SPRING_PROFILES_ACTIVE=prod
APP_JWT_SECRET=[keep existing value]
APP_JWT_EXPIRATION=86400000
LOGGING_LEVEL_ROOT=WARN
LOGGING_LEVEL_COM_POLYCODER_RELMGMT=INFO

# Important: Disable Flyway clean for production safety
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_CLEAN_DISABLED=true
SPRING_JPA_HIBERNATE_DDL_AUTO=none

# Optimize for Neon (connection pooling)
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=5
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=300000
```

5. **Save Changes** - Render will automatically redeploy

### **Step 3.2: Monitor Render Deployment**

```bash
# Watch the deployment logs in Render dashboard
# Look for these success indicators:

✓ "HikariPool-1 - Start completed"
✓ "Started RelmgmtApplication"
✓ "Tomcat started on port(s): 8080"
✓ Health check: PASSED
```

### **Step 3.3: Verify Render Backend**

```bash
# Test health endpoint
curl https://your-backend.onrender.com/actuator/health
# Expected: {"status":"UP","components":{"db":{"status":"UP"},...}}

# Test database connectivity
curl https://your-backend.onrender.com/api/v1/resources
# Should return your resources data from Neon

# Test write operation (if you have a test endpoint)
curl -X POST https://your-backend.onrender.com/api/v1/test \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

---

## 🎨 **Phase 4: Deploy Frontend to Vercel**

### **Step 4.1: Configure Vercel Environment Variables**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `relmgmt-frontend`
3. **Settings → Environment Variables**
4. **Add these variables**:

```bash
# Production Environment
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_TITLE=Release Management System
VITE_LOG_LEVEL=error
VITE_NOTIF_POLL_MS=120000

# Preview Environment (optional - for PR previews)
# Same as production but can use staging backend if you have one
```

### **Step 4.2: Create Vercel Configuration File**

Create `vercel.json` in the project root:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm ci && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm ci",
  "framework": null,
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### **Step 4.3: Deploy to Vercel**

**Option A: Using Vercel Dashboard**
1. Click "Deploy" in Vercel dashboard
2. Vercel will automatically build and deploy
3. Monitor deployment logs

**Option B: Using Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod

# Or deploy to preview first
vercel

# Monitor deployment
# Vercel will output the deployment URL
```

### **Step 4.4: Verify Frontend Deployment**

```bash
# Test the Vercel deployment URL
curl https://your-project.vercel.app

# Test API connectivity from browser
# Open: https://your-project.vercel.app
# Check browser console for any errors
# Try logging in and creating/viewing resources
```

---

## ✅ **Phase 5: Post-Migration Validation**

### **Step 5.1: End-to-End Testing**

Create a test checklist and verify each item:

```
Authentication:
[ ] Can access login page
[ ] Can log in with existing credentials
[ ] JWT token is properly stored
[ ] Can access protected routes

Resources:
[ ] Can view resource list
[ ] Can create new resource
[ ] Can edit existing resource
[ ] Can delete resource (if allowed)

Releases:
[ ] Can view releases
[ ] Can create new release with phases
[ ] Can update release details
[ ] Can delete release

Allocations:
[ ] Can view allocation grid
[ ] Can create allocations
[ ] Can update allocations
[ ] Allocation conflicts are detected

Notifications:
[ ] Notifications are displayed
[ ] Can mark notifications as read
[ ] Can delete notifications

Performance:
[ ] Page load time < 3 seconds
[ ] API response time < 500ms
[ ] No console errors
[ ] No CORS issues
```

### **Step 5.2: Monitor for 24 Hours**

```bash
# Check Neon Dashboard
- Monitor connection count (should be < 5 typically)
- Monitor query performance
- Check storage usage

# Check Render Dashboard
- Monitor backend logs for errors
- Check memory usage
- Verify health checks passing

# Check Vercel Dashboard
- Monitor deployment status
- Check edge function logs (if any)
- Verify bandwidth usage

# Set up alerts (optional)
- Neon: Enable email alerts for connection spikes
- Render: Enable deployment failure notifications
- Vercel: Enable build failure notifications
```

### **Step 5.3: Update DNS (If Using Custom Domain)**

If you have a custom domain:

```bash
# For Vercel (Frontend)
1. Go to Vercel Dashboard → Domains
2. Add your custom domain (e.g., app.yourdomain.com)
3. Update DNS records as instructed by Vercel
   - Add CNAME: app → cname.vercel-dns.com
   - Or add A records if using apex domain

# For Render (Backend)
1. Keep existing custom domain on Render
2. Or update if needed: api.yourdomain.com → your-backend.onrender.com

# Verify DNS propagation
dig app.yourdomain.com
dig api.yourdomain.com
```

---

## 🔄 **Rollback Plan**

If anything goes wrong, here's how to rollback:

### **Scenario 1: Database Issues**

```bash
# Option A: Revert to Render Database
1. Go to Render Dashboard
2. Update SPRING_DATASOURCE_URL back to Render database
3. Render will auto-redeploy
4. Verify backend connectivity

# Option B: Restore Neon from Backup
psql "neon-connection-string" < relmgmt-backup-YYYYMMDD-HHMMSS.sql
```

### **Scenario 2: Frontend Issues**

```bash
# Vercel keeps previous deployments
1. Go to Vercel Dashboard → Deployments
2. Click on previous working deployment
3. Click "Promote to Production"
4. Or revert via CLI:
   vercel rollback
```

### **Scenario 3: Backend Issues**

```bash
# Render keeps deployment history
1. Go to Render Dashboard → your service
2. Manual Deploy → select previous deployment
3. Click "Deploy"
```

---

## 💰 **Cost Analysis: Before vs After**

### **Before Migration (Render All-In)**
```
Render PostgreSQL Starter: $7/month
Render Web Service (if on paid): $7/month
Render Static Site: $0/month
---
Total: $14/month (or more on paid tiers)
```

### **After Migration**
```
Neon PostgreSQL Free Tier:
  - 0.5GB storage: $0/month
  - Auto-scaling: $0/month (within limits)
  - Branching: $0/month

Render Web Service Free Tier:
  - 750 hours/month: $0/month
  - Sleeps after 15min: $0/month
  
Vercel Free Tier:
  - 100GB bandwidth: $0/month
  - Unlimited deployments: $0/month
  - Global CDN: $0/month
---
Total: $0/month 🎉
```

### **Free Tier Limits**

**Neon Free Tier**:
- 0.5GB storage (plenty for MVP)
- 5 projects
- No credit card required
- No time limit

**Render Free Tier**:
- 750 hours/month (enough for 24/7 operation)
- Spins down after 15 min inactivity (cold start: ~30s)
- 512MB RAM
- Shared CPU

**Vercel Free Tier**:
- 100GB bandwidth/month
- Unlimited deployments
- No credit card required
- Global CDN included

---

## 📚 **Post-Migration Tasks**

### **Immediate (Day 1)**
- [ ] Update README.md with new deployment architecture
- [ ] Update docs/deployment-summary.md
- [ ] Update docs/status.md
- [ ] Update .env.example files with Neon connection format
- [ ] Commit vercel.json to repository

### **Week 1**
- [ ] Monitor error rates in all three platforms
- [ ] Set up automated backups (Neon → S3/R2)
- [ ] Update GitHub Actions workflows (if needed)
- [ ] Document new deployment process

### **Week 2**
- [ ] Delete old Render database (after confirming stability)
- [ ] Downgrade Render backend to free tier (if on paid)
- [ ] Set up monitoring/alerting (optional)
- [ ] Create runbook for common issues

---

## 🚨 **Troubleshooting**

### **Issue: Render Backend Can't Connect to Neon**

```bash
# Check connection string format
# Should be: jdbc:postgresql://host:5432/db?sslmode=require

# Common issues:
1. Missing sslmode=require
2. Wrong port (should be 5432)
3. Firewall blocking (Neon allows all IPs by default)
4. Incorrect credentials

# Test connection from Render shell
# Go to Render Dashboard → Shell
psql "postgresql://user:pass@host/db?sslmode=require"
```

### **Issue: Vercel Frontend Gets CORS Errors**

```bash
# Verify backend CORS configuration
# Check SecurityConfig.java has Vercel domain whitelisted

# Add to allowed origins:
.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://your-custom-domain.com"
))
```

### **Issue: Neon Connection Pool Exhausted**

```bash
# Reduce connection pool size in Render
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=3
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1

# Neon free tier: ~100 max connections
# But Render free tier should only need 1-3
```

### **Issue: Render Free Tier Cold Starts**

```bash
# Expected behavior: 15min idle → sleeps
# First request after sleep: ~30-60s to wake up

# Solutions:
1. Use UptimeRobot to ping every 14 min (keeps it awake)
2. Accept cold starts (fine for MVP)
3. Upgrade to Render Starter ($7/month) for always-on

# Free tier is perfect for testing/MVP
# Upgrade when you have consistent traffic
```

---

## 📊 **Success Metrics**

After migration, you should see:

✅ **Cost**: $0/month (vs $14+/month)  
✅ **Frontend Performance**: < 1s page loads globally (Vercel CDN)  
✅ **Backend Latency**: < 500ms API responses (when warm)  
✅ **Database**: < 100ms query times  
✅ **Uptime**: 99.9% (all platforms have good SLAs)  

---

## 🎉 **Migration Complete!**

Congratulations! You've successfully migrated to a cost-effective, performant architecture.

**Next Steps**:
1. Monitor for the first week
2. Set up automated backups
3. Update documentation
4. Share feedback/issues

**Support Resources**:
- Neon Docs: https://neon.tech/docs
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs

---

**Last Updated**: October 22, 2025  
**Migration Status**: Ready for Execution  
**Estimated Total Time**: 2-3 hours  
**Risk Level**: Low (easy rollback available)

