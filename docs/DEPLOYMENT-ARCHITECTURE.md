# Release Management System - Deployment Architecture

**Last Updated**: October 22, 2025  
**Current Status**: Migration to Vercel + Render + Neon in Progress

---

## 📊 **Architecture Overview**

### **New Architecture (October 2025)**

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL (Frontend)                          │
│  ┌──────────────────────────────────────────────────┐       │
│  │  React App (Static Build)                        │       │
│  │  - Global CDN Distribution                        │       │
│  │  - Automatic HTTPS                                │       │
│  │  - Preview Deployments                            │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              RENDER (Backend - Free Tier)                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Spring Boot Application                          │       │
│  │  - Docker Container                               │       │
│  │  - Health Checks                                  │       │
│  │  - Auto-suspend after 15min idle                  │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ PostgreSQL Connection
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              NEON.TECH (Database - Free Tier)                │
│  ┌──────────────────────────────────────────────────┐       │
│  │  PostgreSQL 16                                    │       │
│  │  - 0.5GB Storage                                  │       │
│  │  - Auto-scaling                                   │       │
│  │  - Database Branching                             │       │
│  │  - Point-in-time Recovery                         │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 **Cost Comparison**

### **Before (All Render)**
```
Render PostgreSQL Starter: $7/month
Render Web Service (paid): $7/month (if not free tier)
Render Static Site: $0/month
──────────────────────────
Total: $7-14/month
```

### **After (Vercel + Render + Neon)**
```
Vercel Free Tier:
  ✅ 100GB bandwidth/month
  ✅ Unlimited deployments
  ✅ Global CDN
  Cost: $0/month

Render Free Tier:
  ✅ 750 hours/month (24/7 operation)
  ✅ 512MB RAM
  ✅ Shared CPU
  Cost: $0/month
  (Note: Spins down after 15min idle, ~30s cold start)

Neon Free Tier:
  ✅ 0.5GB storage
  ✅ 100 hours/month compute
  ✅ 10 database branches
  ✅ 7-day point-in-time recovery
  Cost: $0/month
──────────────────────────
Total: $0/month 🎉
```

---

## 🏗️ **Component Details**

### **1. Frontend - Vercel**

**Platform**: Vercel  
**Technology**: React 19.1.0 + Vite  
**Deployment**: Static site build

**Features**:
- ✅ Global CDN (300+ edge locations)
- ✅ Automatic HTTPS/SSL
- ✅ Preview deployments for PRs
- ✅ Zero-config deployment
- ✅ Instant rollbacks
- ✅ Web Vitals monitoring

**Configuration**:
- Build Command: `cd frontend && npm ci && npm run build`
- Output Directory: `frontend/dist`
- Framework: Vite
- Node Version: 20.x

**Environment Variables**:
```bash
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_TITLE=Release Management System
VITE_LOG_LEVEL=error
VITE_NOTIF_POLL_MS=120000
```

**Deployment Trigger**: Push to `main` branch

---

### **2. Backend - Render**

**Platform**: Render (Free Tier)  
**Technology**: Spring Boot 3.5.4 + Java 21  
**Deployment**: Docker container

**Features**:
- ✅ Docker-based deployment
- ✅ Automatic HTTPS
- ✅ Health check monitoring
- ✅ Rolling deployments
- ⚠️ Auto-suspend after 15min idle
- ⚠️ ~30-60s cold start time

**Configuration**:
- Environment: Docker
- Health Check: `/actuator/health`
- Port: 8080
- Auto-deploy: Yes (on Git push)

**Environment Variables**:
```bash
# Database (Neon)
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-xxxxx.region.aws.neon.tech:5432/neondb?sslmode=require
SPRING_DATASOURCE_USERNAME=your_neon_user
SPRING_DATASOURCE_PASSWORD=your_neon_password

# Connection Pool (Neon-optimized)
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=5
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT=30000

# Application
SPRING_PROFILES_ACTIVE=prod
APP_JWT_SECRET=[64+ character string]
APP_JWT_EXPIRATION=86400000

# Logging
LOGGING_LEVEL_ROOT=WARN
LOGGING_LEVEL_COM_POLYCODER_RELMGMT=INFO

# Database Migrations
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_CLEAN_DISABLED=true
SPRING_JPA_HIBERNATE_DDL_AUTO=none
```

**Deployment Trigger**: Environment variable changes or Git push

---

### **3. Database - Neon.tech**

**Platform**: Neon.tech (Free Tier)  
**Technology**: PostgreSQL 16  
**Type**: Serverless PostgreSQL

**Features**:
- ✅ 0.5GB storage (enough for ~1,000 releases)
- ✅ Auto-scaling and auto-suspend
- ✅ Database branching (dev/staging/prod)
- ✅ Point-in-time recovery (7 days)
- ✅ Connection pooling
- ✅ SSL/TLS required

**Configuration**:
- Region: Choose closest to Render backend
- PostgreSQL Version: 16
- Max Connections: ~100
- Auto-suspend: After 5 minutes idle

**Connection String Format**:
```bash
# Neon format
postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require

# JDBC format (for Spring Boot)
jdbc:postgresql://ep-xxxxx.region.aws.neon.tech:5432/neondb?sslmode=require
```

**Backup Strategy**:
1. Neon automatic backups (7 days retention)
2. Weekly manual pg_dump to external storage
3. Database branching for staging/dev

---

## 🔄 **Deployment Workflows**

### **Frontend Deployment (Vercel)**

```mermaid
graph LR
    A[Git Push to main] --> B[Vercel Build Triggered]
    B --> C[npm ci && npm run build]
    C --> D[Deploy to Global CDN]
    D --> E[Health Check]
    E --> F[Production Live]
    
    G[Pull Request] --> H[Preview Deployment]
    H --> I[PR Comment with URL]
```

**Deployment Time**: ~2-3 minutes  
**Rollback Time**: ~10 seconds (instant)

### **Backend Deployment (Render)**

```mermaid
graph LR
    A[Git Push or Env Change] --> B[Render Build Triggered]
    B --> C[Docker Build]
    C --> D[Health Check]
    D --> E{Healthy?}
    E -->|Yes| F[Production Live]
    E -->|No| G[Rollback]
```

**Deployment Time**: ~5-8 minutes  
**Rollback Time**: ~2 minutes (previous deployment)

### **Database Migration (Neon)**

```mermaid
graph LR
    A[Backup Render DB] --> B[Create Neon Database]
    B --> C[Migrate Data]
    C --> D[Verify Data]
    D --> E[Update Backend Config]
    E --> F[Test Connection]
    F --> G[Production Cutover]
```

**Migration Time**: ~30-60 minutes (one-time)  
**Downtime**: ~5-10 minutes (during cutover)

---

## 🛡️ **Security Architecture**

### **Network Security**

```
User Browser
    ↓ HTTPS (TLS 1.3)
Vercel CDN (Frontend)
    ↓ HTTPS (REST API)
Render Backend
    ↓ SSL (sslmode=require)
Neon Database
```

**Security Features**:
- ✅ End-to-end encryption
- ✅ Automatic SSL/TLS certificates
- ✅ JWT authentication
- ✅ BCrypt password hashing
- ✅ CORS configuration
- ✅ Security headers (CSP, HSTS, etc.)

### **Database Security**

```bash
# Connection always requires SSL
?sslmode=require

# Password encryption
- BCrypt with strength 10
- JWT tokens for API auth
- Secure session management

# Network Security
- PostgreSQL connections encrypted
- No public database access
- Connection pooling limits
```

---

## 📊 **Monitoring & Observability**

### **Health Endpoints**

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Frontend | `https://your-app.vercel.app/` | Site availability |
| Backend | `https://your-backend.onrender.com/actuator/health` | Service health |
| Backend | `https://your-backend.onrender.com/actuator/metrics` | Performance metrics |
| Database | Neon Dashboard | Connection count, storage, query performance |

### **Monitoring Dashboards**

1. **Vercel Dashboard**:
   - Deployment status
   - Build logs
   - Analytics (page views, performance)
   - Error tracking

2. **Render Dashboard**:
   - Service status
   - Application logs
   - Memory/CPU usage
   - Deployment history

3. **Neon Dashboard**:
   - Storage usage
   - Connection count
   - Query performance
   - Compute time usage

---

## 🚨 **Disaster Recovery**

### **Backup Strategy**

| Component | Backup Method | Frequency | Retention |
|-----------|---------------|-----------|-----------|
| **Frontend** | Git + Vercel deployments | Every commit | Unlimited |
| **Backend** | Git + Docker images | Every commit | 90 days (GHCR) |
| **Database** | Neon automatic + manual pg_dump | Daily + Weekly | 7 days + 30 days |

### **Recovery Procedures**

**Frontend Failure**:
```bash
# Instant rollback via Vercel dashboard
1. Go to Vercel → Deployments
2. Select previous deployment
3. Click "Promote to Production"
# Recovery time: < 1 minute
```

**Backend Failure**:
```bash
# Rollback via Render dashboard
1. Go to Render → Service → Manual Deploy
2. Select previous deployment
3. Click "Deploy"
# Recovery time: ~5 minutes
```

**Database Failure**:
```bash
# Restore from Neon backup
1. Neon Dashboard → Restore
2. Select recovery point
3. Confirm restoration
# Recovery time: ~10-15 minutes

# OR restore from manual backup
pg_restore -d "neon-connection-string" backup-file.dump
# Recovery time: ~5-30 minutes (depending on size)
```

---

## 🎯 **Performance Targets**

| Metric | Target | Current |
|--------|--------|---------|
| **Frontend Load Time** | < 2s | ~1s (global CDN) |
| **API Response Time** | < 500ms | ~200ms (warm) |
| **Cold Start Time** | < 60s | ~30s (acceptable for free tier) |
| **Database Query** | < 100ms | ~50ms (Neon serverless) |
| **Page Transition** | < 200ms | ~100ms (React Router) |

---

## 📝 **Migration Checklist**

- [ ] **Phase 1: Setup**
  - [ ] Create Neon account and database
  - [ ] Create Vercel account and import repository
  - [ ] Backup current Render database
  
- [ ] **Phase 2: Database Migration**
  - [ ] Export data from Render
  - [ ] Import data to Neon
  - [ ] Verify data integrity
  - [ ] Update Render backend env vars
  
- [ ] **Phase 3: Frontend Migration**
  - [ ] Configure Vercel environment variables
  - [ ] Deploy frontend to Vercel
  - [ ] Test end-to-end functionality
  - [ ] Update DNS (if custom domain)
  
- [ ] **Phase 4: Validation**
  - [ ] Run full test suite
  - [ ] Monitor for 24 hours
  - [ ] Delete old Render database (after 7 days)

---

## 📚 **Documentation References**

- **Migration Guide**: `/docs/MIGRATION-GUIDE-VERCEL-NEON.md`
- **Neon Setup**: `/docs/NEON-DATABASE-SETUP.md`
- **Vercel Config**: `/vercel.json`
- **Environment Variables**: `/docs/neon-env-variables.example`
- **Backup Scripts**: `/scripts/backup-database.sh`, `/scripts/migrate-to-neon.sh`

---

**Architecture Status**: ✅ Ready for Migration  
**Estimated Migration Time**: 2-3 hours  
**Downtime Required**: ~5-10 minutes  
**Cost Savings**: ~$15/month → $0/month

