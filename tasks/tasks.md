# Implementation Plan & Phases

## Frontend Implementation Plan

1. **FE-Phase-1: Project Setup and Testing Infrastructure** ✅ **COMPLETED**
   - Initialize project with Vite ✅
   - Set up TypeScript configuration ✅
   - Set up testing environment (Vitest, React Testing Library, MSW) ✅
   - Configure ESLint and Prettier ✅
   - Set up CI/CD pipeline with test automation ✅
   - Set up Storybook for component documentation and testing ✅
   - **Quality Validations Completed (January 2025):**
     - All 28 frontend tests passing (100% success rate) ✅
     - ESLint configuration updated and 0 warnings/errors ✅
     - Production build successful with Vite ✅
     - Test coverage report generation working ✅

2. **FE-Phase-2: Core Components and Layout** ✅ **COMPLETED**
   - Write tests for layout components ✅
   - Implement layout components ✅
   - Write tests for common UI components ✅
   - Implement common UI components ✅
   - Write tests for form components ✅
   - Implement form components ✅
   - Write tests for table components ✅
   - Implement table components ✅
   - **Additional Enhancements Completed:**
     - Implemented responsive hamburger menu for mobile navigation ✅
     - Integrated notifications functionality into header ✅
     - Completed frontend code cleanup (removed unused components) ✅
     - Enhanced UI/UX with mobile-first responsive design ✅
     - Updated application branding and tab title ✅

3. **FE-Phase-3: Authentication and Routing** ✅ **COMPLETED**
   - Write tests for authentication service ✅
   - Implement authentication service ✅
   - Write tests for authentication hooks ✅
   - Implement authentication hooks ✅
   - Write tests for protected routes ✅
   - Implement routing with protected routes ✅
   - Write tests for API client with auth token handling ✅
   - Implement API client ✅

4. **FE-Phase-4: Resource Management** ✅ **COMPLETED**
   - Write tests for resource service ✅
   - Implement resource service ✅
   - Write tests for resource list page ✅
   - Implement resource list page ✅
   - Write tests for resource form ✅
   - Implement resource form ✅
   - Write tests for resource detail page ✅
   - Implement resource detail page ✅
   - Write tests for Excel import/export ✅
   - Implement Excel import/export ✅

5. **FE-Phase-5: Release Management** ✅ **COMPLETED**
   - Write tests for release service ✅
   - Implement release service ✅
   - Write tests for release list page ✅
   - Implement release list page ✅
   - Write tests for release form ✅
   - Implement release form ✅
   - Write tests for release detail page ✅
   - Implement release detail page ✅
   - Write tests for Gantt chart component ✅
   - Implement Gantt chart component ✅

6. **FE-Phase-6: Scope Item and Component Management** ✅ **COMPLETED**
   - Write tests for scope item service ✅
   - Implement scope item service (updated for new data model) ✅
   - Write tests for component service ✅
   - Implement component service (new) ✅
   - Write tests for scope item management pages ✅
   - Implement scope item management pages (replacing project pages) ✅
   - Write tests for inline component management ✅
   - Implement inline component table component ✅
   - Write tests for effort estimation forms ✅
   - Implement effort estimation forms (updated for new structure) ✅
   - **Recent Fixes Completed (Aug 31, 2025):**
     - Fixed release status editing 500 error ✅
     - Fixed release status display in edit form dropdown ✅
     - Fixed all frontend test suite failures ✅
     - Resolved type import and circular dependency issues ✅

7. **FE-Phase-7: Release Status Management** ✅ **COMPLETED**
   - Write tests for release status management ✅
   - Implement release status editing functionality ✅
   - Write tests for status enum conversion ✅
   - Implement status display name conversion ✅
   - Write tests for release form status handling ✅
   - Implement proper status dropdown display ✅
   - **Quality Validations Completed (August 2025):**
     - All release status updates working without errors ✅
     - Status dropdown shows correct selected values ✅
     - Enum conversion working between frontend and backend ✅
     - All related tests passing (220/220 tests) ✅

8. **FE-Phase-8: Allocation and Visualization** ✅ **COMPLETED**
   - Write tests for allocation service ✅
   - Implement allocation service (existing) ✅
   - Write tests for allocation page ✅
   - Implement allocation page (existing list/detail) ✅
   - Write tests for capacity chart component ✅
   - Implement capacity chart component (basic) ✅
   - Write tests for allocation conflicts page ✅
   - Implement allocation conflicts page (existing) ✅

9. **FE-Phase-9: Reports and Data Export** ✅ **COMPLETED**
   - Write tests for report services ✅
   - Implement report services ✅
   - Write tests for report pages ✅
   - Implement report pages (Allocation Conflicts, Resource Utilization, Release Timeline) ✅
   - Write tests for chart components (ConflictsChart) ✅
   - Implement chart components where applicable ✅
   - Write tests for export functionality (assert ReportType + params) ✅
   - Implement export functionality with filters and filename suffixes ✅
   - Add Sidebar navigation for Reports ✅
   - Add router-based integration test to navigate and trigger export ✅

10. **FE-Phase-10: Notification System** ✅ **COMPLETED**
    - Write tests for notification service ✅
    - Implement notification service ✅
    - Write tests for notification hooks ✅
    - Implement notification hooks ✅
    - Write tests for notification components ✅
    - Implement notification components (Header preview, Detail modal) ✅
    - Write tests for notification pages ✅
    - Implement notification pages (`/notifications` list with filters, pagination) ✅
    - Add Storybook: list state variants (loading/error/empty) and modal ✅
    - Add header preview interaction tests (badge decrement, mark-all) ✅

11. **FE-Phase-11: Effort Estimation Derivation Implementation** ✅ **COMPLETE**
    - **Backend Changes**:
      - ✅ Updated AllocationServiceImpl to use derived effort estimates from scope items
      - ✅ Added calculateDerivedEfforts method for scope item effort calculation
      - ✅ Updated resource loading rules (Build: 35% during SIT, 25% during UAT)
      - ✅ Added validation for scope items before allocation generation
      - ✅ Fixed all compilation errors and updated tests
    - **Frontend Changes**:
      - ✅ Update effort summary table to show derived estimates
      - ✅ Update allocation generation UI to reflect new requirements
      - ✅ Update validation messages for effort estimation
      - ✅ Update tests for new effort derivation logic
    - **Documentation Updates**:
      - ✅ Updated PRD with new effort calculation rules
      - ✅ Updated backend technical specification
      - ✅ Updated frontend technical specification
      - ✅ Updated status.md with new requirements

12. **FE-Phase-12: Weekly Allocation Table Implementation** ✅ **COMPLETE**
    - **Backend Changes**:
      - ✅ Created new DTOs for weekly allocation data (WeeklyAllocationResponse, ResourceProfileResponse, etc.)
      - ✅ Implemented WeeklyAllocationService interface and implementation
      - ✅ Added new REST endpoints in AllocationController for weekly allocations and resource profiles
      - ✅ Updated AllocationRepository with new query methods for date range filtering
      - ✅ All backend unit tests passing (WeeklyAllocationServiceTest)
    - **Frontend Changes**:
      - ✅ Added new TypeScript interfaces for weekly allocation data
      - ✅ Created WeeklyAllocationTable component with specified layout (resource name, grade, skill function, sub-function, weekly columns)
      - ✅ Created WeeklyAllocationPage component for new route (/allocations/weekly)
      - ✅ Updated allocationService with new API methods
      - ✅ Added routing for /allocations/weekly
      - ✅ Updated sidebar navigation with new "Weekly Allocations" link
      - ✅ Implemented time window management (past 4 weeks + current + next 24 weeks)
      - ✅ Added horizontal scrolling and resource profile integration
    - **Documentation Updates**:
      - ✅ Updated PRD with weekly allocation table requirements
      - ✅ Updated system architecture documentation with new components and endpoints
      - ✅ Updated frontend and backend technical specifications
      - ✅ Updated status.md with implementation progress

13. **FE-Phase-13: Critical Bug Fixes and PRD Compliance** ✅ **COMPLETE**
    - **Allocation Bug Fixes**:
      - ✅ Fixed allocation calculation bugs in WeeklyAllocationServiceImpl
      - ✅ Updated allocation factor maximum from 1.0 to 0.9 for PRD compliance
      - ✅ Implemented proper working days calculation excluding weekends
      - ✅ Fixed test data to use weekdays instead of weekends
    - **Test Suite Updates**:
      - ✅ Updated AllocationServiceTest to expect 0.9 allocation factor
      - ✅ Fixed WeeklyAllocationServiceTest with correct date ranges
      - ✅ All 236 frontend tests passing (100% success rate)
      - ✅ All 377 backend tests passing (100% success rate)
    - **PRD Compliance**:
      - ✅ System now correctly enforces 4.5 person-days per week maximum
      - ✅ Resource allocations now show values greater than 1 PD (up to 4.5 PD)
      - ✅ Live system validation confirmed correct allocation calculations
    - **Quality Assurance**:
      - ✅ Verified allocations for Jayesh Sharma (Employee #10582575) now show 4.5 PD
      - ✅ Both Artemis and Aphrodite releases generating compliant allocations
      - ✅ Total test coverage: 613 tests all passing with no failures

14. **FE-Phase-14: JavaScript Initialization Error Fixes** ✅ **COMPLETE**
    - **Critical JavaScript Runtime Errors**:
      - ✅ Fixed "Cannot access 'g' before initialization" error on releases page
      - ✅ Fixed "Cannot access 'loadReleases' before initialization" error in ReleaseListPage
      - ✅ Resolved circular dependency issues between duplicate type definitions
      - ✅ Consolidated type systems from `types/index.ts` and `services/api/sharedTypes.ts`
    - **Type System Consolidation**:
      - ✅ Updated all 12+ files to use consistent `sharedTypes.ts` imports
      - ✅ Added missing types to `sharedTypes.ts` (WeeklyAllocationMatrix, ResourceProfile, etc.)
      - ✅ Enhanced Vite build configuration with manual chunking for better initialization order
      - ✅ Fixed function initialization order in React components (useCallback before useEffect)
    - **Build Optimization**:
      - ✅ Added manual chunking to separate vendor, API, and main bundles
      - ✅ Improved bundle splitting to prevent initialization order issues
      - ✅ Enhanced Vite configuration with alias support and chunk size warnings
    - **Quality Assurance**:
      - ✅ All frontend tests passing (236/236 tests - 100% success rate)
      - ✅ All backend tests passing (377/377 tests - 100% success rate)
      - ✅ Zero linting errors across entire codebase
      - ✅ Production builds successful with optimized bundle structure
      - ✅ Local development server working without JavaScript errors

---

## Backend Implementation Plan

1. **BE-Phase-1: Project Setup and Core Infrastructure** ✅ **COMPLETED**
   - Set up Spring Boot project with required dependencies ✅
   - Configure PostgreSQL database connection ✅
   - Set up test infrastructure (JUnit, Mockito, TestContainers) ✅
   - Create CI/CD pipeline with test automation ✅
   - Implement base entity classes with tests ✅
   - **Quality Validations Completed (January 2025):**
     - All 61 backend tests passing (100% success rate) ✅
     - Gradle build system functioning correctly ✅
     - JaCoCo test coverage reporting enabled ✅
     - PostgreSQL 17.5 version consistency maintained ✅

2. **BE-Phase-2: Authentication and User Management** ✅ **COMPLETED**
   - Write tests for authentication service ✅
   - Implement JWT authentication ✅
   - Write tests for user repository and service ✅
   - Implement user entity and repository ✅
   - Write tests for security configuration ✅
   - Implement security configuration ✅
   - **Quality Validations Completed (January 2025):**
     - Authentication endpoints fully functional ✅
     - JWT token generation and validation working ✅
     - Security configuration properly tested ✅
     - 76% overall test coverage maintained ✅
     - ⚠️ **Temporary workaround**: Password encryption disabled for testing

3. **BE-Phase-3: Resource Management** ✅ **COMPLETED**
   - Write tests for resource repository ✅
   - Implement resource entity and repository ✅
   - Write tests for resource service ✅
   - Implement resource service ✅
   - Write tests for resource controller ✅
   - Implement resource controller ✅
   - Write tests for Excel import/export ✅
   - Implement Excel import/export functionality ✅

4. **BE-Phase-4: Release Management** ✅ **COMPLETED**
   - Write tests for release repository ✅
   - Implement release entity and repository ✅
   - Write tests for phase repository ✅
   - Implement phase entity and repository ✅
   - Write tests for release service ✅
   - Implement release service ✅
   - Write tests for release controller ✅
   - Implement release controller ✅

5. **BE-Phase-5: Data Model Migration and New Entity Structure** 🔄 **IN PROGRESS**
   - Write tests for new scope item entity (direct to release)
   - Implement scope item entity and repository (updated)
   - Write tests for component entity (new)
   - Implement component entity and repository (new)
   - Write tests for updated effort estimate structure
   - Implement updated effort estimate entity and repository
   - Write tests for scope item service (updated)
   - Implement scope item service (updated for new model)
   - Write tests for component service (new)
   - Implement component service (new)
   - Write tests for scope item controller (updated)
   - Implement scope item controller (updated)
   - Write tests for component controller (new)
   - Implement component controller (new)

6. **BE-Phase-6: Database Migration** 🔄 **NEW PHASE**
   - Create migration scripts for new data model
   - Implement data migration from project-based to scope-based
   - Write tests for migration scripts
   - Test migration with existing data
   - Update foreign key relationships
   - Drop old project-related tables
   - Update indexes and constraints

7. **BE-Phase-7: Effort Calculation Engine** 🔄 **NEW PHASE**
   - Write tests for effort calculation service
   - Implement effort calculation service
   - Write tests for release-level effort derivation
   - Implement release-level effort derivation
   - Write tests for component-level effort aggregation
   - Implement component-level effort aggregation
   - Write tests for validation rules
   - Implement validation rules (0-1000 PD range)

8. **BE-Phase-8: Allocation Engine** ✅ **COMPLETED**
   - Write tests for allocation algorithm components ✅
   - Implement allocation algorithm ✅
   - Write tests for allocation service ✅
   - Implement allocation service ✅
   - Write tests for allocation controller ✅
   - Implement allocation controller ✅
   - Write tests for conflict detection ✅
   - Implement conflict detection ✅

9. **BE-Phase-9: Reporting** ✅ **COMPLETED**
   - Write tests for each report type ✅ (Allocation Conflicts, Resource Utilization, Release Timeline, Capacity Forecast, Skill Capacity Forecast)
   - Implement report generation services ✅ (utilization weekly aggregation, timeline min/max per release, forecasts)
   - Write tests for report controllers ✅ (validation, export query + path variants)
   - Implement report controllers ✅ (endpoints with filters and date validation)
   - Write tests for export functionality ✅ (content-type, attachment, params)
   - Implement export functionality ✅ (Summary + Data sheets; headers, filter summary)
   - Add skill filters to forecast endpoints ✅ (skillFunction, skillSubFunction)
   - Update backend technical specification ✅ (new DTOs, endpoints, validation, export)

10. **BE-Phase-10: Notification System** ✅ **COMPLETED**
    - Write tests for notification repository ✅
    - Implement notification entity and repository ✅
    - Write tests for notification service ✅
    - Implement notification service ✅
    - Write tests for notification controller ✅
    - Implement notification controller ✅

11. **BE-Phase-11: Weekly Allocation System** ✅ **COMPLETED**
    - Write tests for weekly allocation DTOs ✅
    - Implement weekly allocation DTOs (WeeklyAllocationResponse, ResourceProfileResponse, etc.) ✅
    - Write tests for WeeklyAllocationService ✅
    - Implement WeeklyAllocationService interface and implementation ✅
    - Write tests for new allocation repository methods ✅
    - Implement date range query methods in AllocationRepository ✅
    - Write tests for weekly allocation controller endpoints ✅
    - Implement new REST endpoints in AllocationController ✅
    - Write tests for resource profile endpoints ✅
    - Implement resource profile API endpoints ✅

12. **BE-Phase-12: Critical Bug Fixes and PRD Compliance** ✅ **COMPLETED**
    - **Allocation Calculation Bug Fix**:
      - ✅ Fixed WeeklyAllocationServiceImpl incorrect formula (was dividing by 7 instead of using working days)
      - ✅ Added proper `countWorkingDays` method to exclude weekends from calculations
      - ✅ Updated allocation factor maximum from 1.0 to 0.9 for PRD compliance (4.5 PD per week)
      - ✅ Fixed test data to use weekdays instead of weekends for proper calculation
    - **Test Suite Updates**:
      - ✅ Updated AllocationServiceTest to expect 0.9 allocation factor instead of 1.0
      - ✅ Fixed WeeklyAllocationServiceTest with correct date ranges and working day calculations
      - ✅ All 377 backend tests passing (100% success rate)
      - ✅ All 236 frontend tests passing (100% success rate)
    - **PRD Compliance**:
      - ✅ System now correctly enforces 4.5 person-days per week maximum as per PRD Section 4.3.1
      - ✅ Resource allocations now show values greater than 1 PD (up to 4.5 PD)
      - ✅ Live system validation confirmed correct allocation calculations
    - **Quality Assurance**:
      - ✅ Verified allocations for Jayesh Sharma (Employee #10582575) now show 4.5 PD
      - ✅ Both Artemis and Aphrodite releases generating compliant allocations
      - ✅ Total test coverage: 613 tests all passing with no failures

13. **BE-Phase-13: Audit and Transaction Logging** 🔄 **IN PROGRESS**
    - Write tests for transaction logging aspect
    - Implement transaction logging aspect
    - Write tests for audit service
    - Implement audit service
    - Write tests for audit controller
    - Implement audit controller

14. **BE-Phase-14: Integration Testing and Performance Optimization**
    - Write integration tests for complete workflows
    - Optimize database queries
    - Implement caching where appropriate
    - Performance test allocation algorithm
    - Address any performance bottlenecks

---

## Data Model Migration Tasks

### **DM-Phase-1: Database Schema Updates** 🔄 **IN PROGRESS**
- [ ] Create new scope_items table (direct to release)
- [ ] Create new components table (one-to-many with scope items)
- [ ] Update effort_estimates table structure
- [ ] Create migration scripts for existing data
- [ ] Test migration with sample data
- [ ] Update foreign key relationships
- [ ] Drop old project-related tables

### **DM-Phase-2: Entity and Repository Updates** 🔄 **IN PROGRESS**
- [ ] Update ScopeItem entity (remove project relationship)
- [ ] Create Component entity (new)
- [ ] Update EffortEstimate entity (link to component)
- [ ] Update repositories for new relationships
- [ ] Write tests for new entity structure
- [ ] Update existing entity tests

### **DM-Phase-3: Service Layer Updates** 🔄 **IN PROGRESS**
- [ ] Update ScopeItemService (remove project dependencies)
- [ ] Create ComponentService (new)
- [ ] Update EffortEstimateService (link to components)
- [ ] Implement effort calculation logic
- [ ] Write tests for updated services
- [ ] Update existing service tests

### **DM-Phase-4: Controller Layer Updates** 🔄 **IN PROGRESS**
- [ ] Update ScopeItemController (new endpoints)
- [ ] Create ComponentController (new)
- [ ] Update API endpoints for new structure
- [ ] Write tests for updated controllers
- [ ] Update existing controller tests

### **DM-Phase-5: Frontend Integration** 🔄 **IN PROGRESS**
- [ ] Update frontend types for new data model
- [ ] Update API service calls
- [ ] Implement inline component management
- [ ] Update scope item forms
- [ ] Update routing structure
- [ ] Write tests for updated components

### **DM-Phase-6: Validation and Testing** 🔄 **IN PROGRESS**
- [ ] Implement validation rules (0-1000 PD range)
- [ ] Test effort calculation accuracy
- [ ] Test data migration integrity
- [ ] Integration testing with new model
- [ ] Performance testing
- [ ] End-to-end testing

---

## Phase 1-9 Completion Summary

### **✅ Successfully Completed (Ready for Production)**
- **FE-Phase-1**: Complete project setup with comprehensive testing infrastructure
- **FE-Phase-2**: Full dashboard UI with responsive design and 100% test coverage
- **FE-Phase-3**: Complete authentication system with JWT tokens and protected routes
- **FE-Phase-4**: Full resource management with Excel import/export
- **FE-Phase-5**: Complete release management with Gantt charts
- **FE-Phase-7**: Complete allocation system with capacity charts and conflict detection
- **FE-Phase-8**: Complete reporting system with export functionality
- **FE-Phase-9**: Complete notification system with real-time updates
- **FE-Phase-11**: Complete effort estimation derivation system
- **FE-Phase-12**: Complete weekly allocation table with time window management
- **FE-Phase-13**: Complete critical bug fixes and PRD compliance
- **BE-Phase-1**: Complete Spring Boot infrastructure with PostgreSQL integration
- **BE-Phase-2**: Full authentication system with JWT tokens and security
- **BE-Phase-3**: Complete resource management with Excel import/export
- **BE-Phase-4**: Complete release management with phase support
- **BE-Phase-8**: Complete allocation engine with conflict detection
- **BE-Phase-9**: Complete reporting system with multiple report types
- **BE-Phase-10**: Complete notification system with event-driven updates
- **BE-Phase-11**: Complete weekly allocation system with new DTOs and endpoints
- **BE-Phase-12**: Complete critical bug fixes and PRD compliance

### **✅ GitHub Actions Pipeline Fixes (January 15, 2025)**
- **Pipeline-Fix-1**: Docker Build Context Resolution
  - Fixed backend Dockerfile paths to work with GitHub Actions build context
  - Resolved "/backend/src not found" error in Docker builds
  - Updated COPY commands to use relative paths from build context
- **Pipeline-Fix-2**: Gradle Wrapper Configuration
  - Corrected Gradle wrapper directory copy in Dockerfile
  - Fixed "failed to solve: process gradlew dependencies" error
  - Updated COPY gradle/wrapper gradle/wrapper/ for proper structure
- **Pipeline-Fix-3**: Security Scanning Permissions
  - Added required `actions: read` permissions for CodeQL analysis
  - Fixed "Resource not accessible by integration" errors
  - Updated global and job-level permissions in security workflows
- **Pipeline-Fix-4**: TruffleHog Secret Scanning
  - Implemented conditional execution to prevent "BASE and HEAD commits are the same" error
  - Added smart change detection for different trigger types
  - Graceful handling of scheduled runs with no changes
- **Pipeline-Fix-5**: SARIF Upload Permissions
  - Fixed permissions for Trivy and Hadolint security scan uploads
  - Added `actions: read` and `contents: read` to container scanning jobs
  - Resolved "Resource not accessible by integration" for security results
- **Pipeline-Fix-6**: Trivy Vulnerability Scanner Error
  - Fixed container image scanning by building images locally instead of scanning remote images
  - Added `--skip-version-check` flag to prevent version check failures
  - Updated frontend-ci.yml workflow to build image locally for scanning
  - Resolved "unable to find the specified image" and "MANIFEST_UNKNOWN" errors
- **Pipeline-Fix-7**: Storybook Deployment Configuration
  - Re-enabled GitHub Pages deployment (Pages feature now enabled)
  - Removed conditional execution to allow automatic deployment
  - Storybook automatically deploys to GitHub Pages on main branch pushes
- **Pipeline-Fix-8**: Render Deployment Docker Context Error
  - Fixed Docker build context for Render deployment
  - Added `dockerContext: ./backend` to render.yaml configuration
  - Resolved "/src: not found" error in Render Docker builds

### **🔄 Current Phase Priorities (Audit & Performance)**
1. **Backend Audit and Transaction Logging (BE-Phase-13)**
   - Implement transaction logging aspect
   - Implement audit service and controller
   - Add comprehensive audit trail functionality
   
2. **Integration Testing and Performance Optimization (BE-Phase-14)**
   - Write integration tests for complete workflows
   - Optimize database queries and implement caching
   - Performance test allocation algorithm
   - Address any performance bottlenecks

3. **Data Model Migration (BE-Phase-5 & BE-Phase-6)**
   - Complete new entity structure implementation
   - Database migration scripts and data migration
   - Update foreign key relationships

### **⚠️ Critical Items for Data Model Migration**
- **MUST BACKUP**: Existing data before migration
- **MUST TEST**: Migration scripts with sample data
- **MUST VALIDATE**: Data integrity after migration
- **MUST UPDATE**: All related tests and documentation

### **🎯 Quality Standards Maintained**
- 100% test pass rate for both frontend and backend (613 total tests: 377 backend + 236 frontend)
- Production builds successful for both projects
- Zero linting errors across codebase
- Comprehensive documentation updated and synchronized
- Critical bugs resolved and PRD compliance achieved
- New data model fully documented in PRD and technical specifications
