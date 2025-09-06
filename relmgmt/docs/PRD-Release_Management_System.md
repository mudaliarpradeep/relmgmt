# Product Requirements Document: Release Management System (MVP)

## 1. Introduction

### 1.1 Purpose
The Release Management System (RMS) is a specialized application designed to facilitate project and staffing planning for software delivery. The system will enable release managers, program managers, and team leads to efficiently plan, track, and manage resources across multiple releases and phases.

### 1.2 Scope
The system will provide tools for resource roster management, release planning, scope management, resource allocation, and visual representations of plans and resource utilization. It will automate resource allocation based on predefined rules and provide insights into resource capacity.

### 1.3 Target Users
- Release Managers
- Program Managers
- Team Leads across functions:
  - Functional Design
  - Technical Design
  - Build
  - System Integration Test (SIT)
  - User Acceptance Test (UAT)
  - Platform

## 2. Product Overview

### 2.1 Product Perspective
The Release Management System will be a standalone web application that helps teams manage the complex process of planning and staffing software releases. It will integrate with existing systems through file imports (Excel) and potentially through APIs in future iterations.

### 2.2 Product Features
1. Resource roster management
2. Release creation and planning
3. Scope management with effort estimation
4. Component management with phase-specific effort estimates
5. Automated resource allocation
6. Visual representations (Gantt charts, capacity views)
7. Multi-release planning and visualization
8. Comprehensive audit logging and transaction history
9. Export functionality for reports and allocation data
10. Basic notification system for critical events

### 2.3 User Classes and Characteristics
Users are expected to be professionals familiar with software delivery processes. They will have varying levels of technical expertise but will understand the concepts of resource allocation, project phases, and capacity planning.

## 3. System Requirements

### 3.1 Technical Stack
- **Frontend**:
  - React 19.1.0
  - Vite
  - ShadCB UI
  - Tailwind CSS
- **Backend**:
  - Spring Boot 3.5.4
  - Java 21
  - REST API with versioning
- **Database**:
  - PostgreSQL 17

## 4. Functional Requirements

### 4.1 Resource Roster Management

#### 4.1.1 Excel Upload for Resource Roster
- The system shall allow users to upload an Excel file containing the resource roster.
- The system shall validate the uploaded data against the required schema.
- The system shall import valid data into the resource roster.
- The Excel file shall follow the format specified in Appendix A.

#### 4.1.2 Resource CRUD Operations
- Users shall be able to add new resources to the roster.
- Users shall be able to edit existing resources in the roster.
- Users shall be able to delete resources from the roster.
  - The system shall prevent deletion of resources that are allocated to active releases (releases with production go-live date in the future).
  - The system shall display an error message when attempting to delete a resource allocated to active releases.
- Users shall be able to view the complete roster or filter by various attributes.

#### 4.1.3 Resource Attributes
Each resource in the roster shall have the following attributes:
- Name
- Employee Number (8-digit unique identifier)
- Email address
- Status (Active, Inactive)
- Project Start Date
- Project End Date
- Employee Grade: Allowed values are Level 12, Level 11, Level 10, Level 9, Level 8, Level 7, Level 6, Level 5, Level 4, Level 3, Level 2, Level 1
- Skill Function: Functional Design, Technical Design, Build, Test, Platform
- Skill Sub-function: Talend, ForgeRock IDM, ForgeRock IG, SailPoint, ForgeRock UI, Automated, Manual
  - Skill sub-functions Talend, ForgeRock IDM, ForgeRock IG, SailPoint, ForgeRock UI are applicable to Technical Design and Build
  - Skill sub-functions Automated and Manual are applicable only to Test function

#### 4.1.4 Automatic Resource Status Management
- The system shall automatically mark any resource as Inactive when their project end date is in the past.
- This rule ensures that resources are automatically considered unavailable for allocation once their project assignment has ended.

### 4.2 Release Management

#### 4.2.1 Release Creation
- Users shall be able to create a new release with a name.
- The system shall automatically generate a unique release identifier following the format YYYY-XXX, where:
  - YYYY represents the current year (e.g., 2025, 2026)
  - XXX is an auto-incrementing number starting from 001 for each year
  - Examples: 2025-001, 2025-002, 2026-001, 2026-002
- The auto-generated identifier shall be displayed as a read-only field in the release creation form.
- Users shall be able to define the following phases for each release:
  - Functional Design
  - Technical Design
  - Build
  - System Integration Test (SIT)
  - User Acceptance Test (UAT)
  - Regression Testing
  - Smoke Testing
  - Go-Live
- Users shall be able to set start and end dates for each phase.
- Users shall be able to add blockers to releases.

#### 4.2.2 Scope Item Management
- Users shall be able to add scope items directly to a release (eliminating the Project entity).
- Each scope item shall have:
  - Name
  - Description (optional)
  - One or more components
  - Scope item-level effort estimates for:
    - Functional Design (person-days)
    - System Integration Test (SIT) (person-days)
    - User Acceptance Test (UAT) (person-days)

#### 4.2.3 Component Management
- Each scope item shall support one or more components.
- Components shall be first-class entities with the following attributes:
  - Name/Type (e.g., ETL, ForgeRock IGA, ForgeRock UI, ForgeRock IG, ForgeRock IDM, SailPoint, Functional Test)
  - Technical Design effort estimate (person-days)
  - Build effort estimate (person-days)
- Components shall not be shared across multiple scope items (one-to-many relationship).
- Users shall be able to add, edit, and remove components within a scope item using inline component management.

#### 4.2.4 Effort Estimation and Derivation Rules
- **Component-Level Efforts**: Each component shall have separate Technical Design and Build effort estimates.
- **Scope Item-Level Efforts**: Each scope item shall have single values for Functional Design, SIT, and UAT efforts.
- **Scope Item Total Effort Calculation**:
  - Scope Item Total = Functional Design + SIT + UAT + Sum of (Technical Design + Build) from all components
- **Release-Level Effort Derivation**:
  - Release Total = Sum of all scope item efforts
  - Functional Design, Technical Design, Build, SIT, and UAT effort values shall be automatically calculated as summations of the corresponding efforts from all scope items assigned to the release.
  - Regression Testing, Smoke Testing, and Go-Live efforts shall be manually assigned at the release level (Phase 2).
- **Automatic Recalculation**:
  - Effort estimates shall be automatically recalculated when scope items are added/removed/modified
  - Effort estimates shall be automatically recalculated when components are added/removed/modified within scope items
- **Allocation Generation Requirements**:
  - Allocation generation requires both phases AND derived effort estimates from scope items
  - If no scope items exist, allocation generation shall be allowed with 0 effort
  - If phase effort is 0, no resources shall be loaded for that phase
- **Resource Loading Rules**:
  - Build team: 35% of build effort during SIT phase, 25% during UAT phase
- **Validation Rules**:
  - Minimum effort value: 0 person-days
  - Maximum effort value: 1000 person-days
  - Effort estimates are automatically calculated and cannot be manually overridden
  - Effort units must be person-days (whole numbers or decimals allowed)

#### 4.2.5 Effort Summary Table
- The system shall display an effort summary table on both the scope items page (`/releases/{id}/scope-items`) and the release detail page (`/releases/{id}`).
- The summary table shall aggregate and display total effort estimates across all scope items for a particular release.
- The table shall show both component types and phases dimensions:
  - **Component Types**: ETL, ForgeRock UI, ForgeRock IGA, ForgeRock IG, ForgeRock IDM, SailPoint, Functional Test
  - **Phases**: Functional Design, Technical Design, Build, SIT, UAT
- The table shall display total effort (person-days) for each component type and phase combination.
- The summary table shall be positioned at the bottom of the page and be collapsible/expandable.
- Data shall be aggregated from both scope item level estimates and component level estimates.
- The table shall provide a comprehensive view of effort distribution across all components and phases for the release.

#### 4.2.6 Release Planning Rules
- The system shall enforce a rule that generally prevents more than one production go-live in a calendar month.
- The system shall support multiple parallel releases.
- For the MVP, there are no dependencies between releases. Pre-requisites for releases will be managed outside the scope of this application.

### 4.3 Resource Allocation

#### 4.3.1 Allocation Rules
The system shall allocate resources to releases based on the following rules:

1. **Standard Loading**:
   - A resource shall be loaded for 4.5 person-days per week.
   - 0.5 days per week shall be discounted for time-offs, training, etc.

2. **Partial Allocation**:
   - A resource can have partial allocation to a release.
   - The minimum allocation factor shall be 0.5 person-days.
   - The maximum allocation shall be 1 person-day per day.

3. **Phase-specific Allocation**:
   - **Functional Design**: Load resources with skill function "Functional Design" based on derived scope estimates and available capacity.
   - **Technical Design**: Load resources with skill function "Technical Design" and matching skill sub-function based on derived component estimates and available capacity.
   - **Build**: Load resources with skill function "Build" and matching skill sub-function based on derived component estimates and available capacity.
   - **SIT**: 
     - Test resources: Load resources with skill function "Test" and sub-function "Manual" based on derived scope estimates and available capacity.
     - Build resources: 35% of Build phase effort for all loaded Build resources.
   - **UAT**: 
     - Test resources: 30% of SIT phase effort for all loaded Test resources.
     - Build resources: 25% of Build phase effort for all loaded Build resources.
   - **Regression Testing** (follows UAT):
     - Test resources: 20% of SIT phase effort for all loaded Test resources.
     - Build resources: 15% of Build phase effort for all loaded Build resources.
   - **Smoke Testing** (standard 1-week window following regression):
     - Test resources: 10% of SIT phase effort for all loaded Test resources.
     - Build resources: 10% of Build phase effort for all loaded Build resources.

#### 4.3.2 Release Plan Generation
- The system shall generate a release plan based on the allocation rules.
- The plan shall be displayed as a grid with weeks along the columns and loaded resources in rows.

#### 4.3.3 Resource Conflict Management
- The system shall flag shared resources whose allocations exceed the standard loading thresholds across multiple releases.
- The system shall provide alerts when resources are overallocated.
- The system shall track capacity across all releases for shared resources.

### 4.4 Visualization

#### 4.4.1 Gantt View
- Users shall be able to view a Gantt chart representation of a single release plan.
- Users shall be able to view a consolidated Gantt chart of all releases planned in a calendar year.

#### 4.4.2 Capacity Load View
- Users shall be able to view the capacity load status of all resources in the staffing plan.
- The system shall apply color coding based on resource loading:
  - GREEN: Resource loaded for exactly 4.5 person-days in a week
  - AMBER: Resource loaded for over 4.5 person-days in a week
  - YELLOW: Resource loaded for less than 4.5 person-days in a week

### 4.5 Reporting and Export

#### 4.5.1 Standard Reports
- Resource Utilization Report showing allocation percentage for each resource across time
- Release Timeline Report providing a consolidated view of all releases with their phases
- Allocation Conflict Report listing resources with allocation conflicts
- Resource Capacity Forecast projecting resource availability for upcoming periods
- Skill-Based Capacity Forecast Report showing allocated and available capacity by skill function and sub-function

#### 4.5.2 Key Performance Indicators
- Resource Utilization Rate: Percentage of allocated time vs. available time
- Allocation Balance: Distribution of resources across skill functions
- Release Schedule Adherence: Tracking if releases are staying on schedule
- Resource Conflict Rate: Percentage of resources with allocation conflicts

#### 4.5.3 Export Functionality
- The system shall support exporting release plans and allocation data.
- The system shall support exporting all reports to Excel format.

### 4.6 Notification System

#### 4.6.1 Event Notifications
- The system shall provide notifications for critical events.
- Critical events shall include:
  - Resource allocation conflicts
  - Resource over-allocation
  - Approaching phase deadlines (1 week before)
  - Release blockers added or resolved

#### 4.6.2 Notification Display
- Notifications shall be displayed within the application UI.
- Notifications shall be marked as read/unread.
- Users shall be able to view a history of notifications.
- Users shall be able to dismiss notifications.

#### 4.6.3 Notification Detail
- Users shall be able to view the full details of a notification in a popup (modal), including:
  - Event type, message, timestamp, and read status
  - Related entity type and identifier (e.g., resource, release, or phase)
  - Contextual action link to navigate to the related entity (when applicable)
- The detail popup shall allow marking the notification as read and dismissing it.

#### 4.6.4 Notification Header Preview
- The header shall display an unread badge on the notification bell when there are unread notifications.
- Clicking the bell shall open a dropdown preview that:
  - Shows the latest 5 notifications sorted by most recent first
  - Visually distinguishes unread items (emphasis style)
  - Allows per-item actions: Mark as read, Open (navigates to related entity when available)
  - Provides a "Mark all as read" action (affects only current user)
  - Provides a "View all" link that navigates to the full notifications page (`/notifications`)
- The dropdown shall show informative states:
  - Loading state while fetching notifications
  - Error state with a retry affordance on failure
  - Empty state when there are no notifications

### 4.7 Audit and Transaction Logging

#### 4.7.1 Transaction Logging
- The system shall maintain detailed transaction logs for all data modifications.
- Transaction logs shall include:
  - User who performed the action
  - Timestamp of the action
  - Type of action (create, update, delete)
  - Entity affected
  - Before and after values for updates
  - IP address of the user

#### 4.7.2 Audit Reporting
- The system shall provide an audit trail interface for authorized users.
- Users shall be able to search and filter audit logs by:
  - Date range
  - User
  - Action type
  - Entity type
- The system shall support exporting audit logs to CSV or Excel format.

#### 4.7.3 Retention Policy
- Transaction logs shall be retained for a minimum of 3 years.
- The system shall support archiving of older audit logs.

## 5. Non-Functional Requirements

### 5.1 Performance
- The system shall support at least 50 concurrent users.
- Page load times shall not exceed 3 seconds under normal operating conditions.
- Resource allocation calculations shall complete within 5 seconds for a single release.

### 5.2 Security
- The system shall implement a simple authentication mechanism for a single user with all permissions.
- All sensitive data shall be encrypted at rest and in transit.
- Authentication shall be required for all system access.
- Transaction logs shall be immutable and tamper-proof.

### 5.3 Usability
- The user interface shall be intuitive and follow modern web design principles.
- The system shall provide clear feedback for user actions.
- The system shall include help documentation for key features.
- The UI shall be clean and modern with a professional layout, typography, and color scheme aligned with enterprise consulting firm standards.
- All pages shall be responsive and adapt to different screen sizes and devices.
- The UI shall use a consistent design system throughout the application.

### 5.4 Reliability
- The system shall have an uptime of at least 99.5%.
- The system shall include data validation to prevent incorrect inputs.
- The system shall maintain data integrity during concurrent operations.
- The transaction logging system shall be resilient to failures.

### 5.5 Scalability
- The system shall be designed to handle up to 100 releases per year.
- The system shall support a resource roster of up to 500 individuals.
- The audit logging system shall be designed to handle high transaction volumes without performance degradation.

### 5.6 API Management
- The system shall implement API versioning to support future changes.
- API versions shall be included in the URL path (e.g., /api/v1/resources).
- The system shall maintain backward compatibility for at least one previous API version.
- API documentation shall be provided using OpenAPI/Swagger.

## 6. Data Requirements

### 6.1 Data Entities
- User (simplified for MVP)
- Resource
- Release
- Phase
- Scope Item
- Component
- Allocation
- Skill Function
- Skill Sub-function
- Transaction Log
- Audit Record

### 6.2 Data Relationships
- A Release consists of multiple Phases
- A Release includes multiple Scope Items (direct relationship, no Project entity)
- A Scope Item includes multiple Components (one-to-many relationship)
- A Component belongs to exactly one Scope Item
- A Resource can be allocated to multiple Releases
- Every entity change generates Transaction Log entries

### 6.3 Data Retention
- Resource data shall be retained for the duration of employment plus 1 year.
- Release data shall be retained for 3 years after completion.
- Transaction logs shall be retained for a minimum of 3 years.

## 7. User Interface Requirements

### 7.1 General UI Requirements
- The UI shall follow a responsive design approach.
- The UI shall maintain consistent styling using Tailwind CSS and ShadCB UI components.
- The UI shall provide clear navigation between different sections of the application.
- The UI shall use a professional color palette consistent with enterprise consulting firm applications.
- The UI shall use modern typography with appropriate font sizes and weights for readability.
- The UI shall incorporate sufficient white space for a clean, uncluttered appearance.
- The UI shall include subtle animations and transitions for a polished user experience.
- The UI shall be accessible and comply with WCAG 2.1 AA standards.

### 7.2 Key Screens
1. **Dashboard**
   - Overview of active releases
   - Resource utilization summary
   - Quick access to common actions
   - Notification center

2. **Resource Roster Management**
   - List view of all resources
   - Add/Edit resource forms
   - Import/Export functionality
   - Status filtering (Active/Inactive)

3. **Release Management**
   - List of releases
   - Release creation/editing form with name field
   - Phase timeline definition

4. **Scope Item Management**
   - Scope item list per release (replacing Project Management)
   - Scope item creation/editing form with inline component management
   - Effort estimation forms for scope item-level phases

5. **Component Management (Inline)**
   - Components displayed as rows in a table within the scope item form
   - Each component row shows:
     - Component name/type (dropdown selection)
     - Technical Design effort input (person-days)
     - Build effort input (person-days)
     - Add/remove buttons ("+" and "×")
   - Component types: ETL, ForgeRock IGA, ForgeRock UI, ForgeRock IG, ForgeRock IDM, SailPoint, Functional Test
   - Validation: Minimum 1 PD, Maximum 1000 PD per effort field

6. **Resource Allocation**
   - Allocation grid/matrix with weekly time periods
   - Weekly allocation table showing person days allocated per resource per week
   - Resource information columns (Name, Grade, Skill Function, Skill Sub-Function)
   - Weekly columns with "D-MMM" format (e.g., "1-Sep", "8-Sep", "15-Sep")
   - Horizontal scrolling for weekly columns with lazy loading
   - Time window: Past 4 weeks + current week + next 24 weeks (29 weeks total)
   - Project names displayed alongside person days in weekly cells
   - Resource name links to resource profile pages
   - Manual override capabilities

7. **Visualization**
   - Gantt chart views (single release and annual)
   - Capacity load view with color coding

8. **Reports**
   - Resource utilization report
   - Release timeline report
   - Allocation conflict report
   - Resource capacity forecast
   - Skill-based capacity forecast showing allocated vs. available capacity by skill

9. **Audit Log**
   - Searchable transaction history
   - Filtering options
   - Export functionality

10. **Notifications**
    - List of notifications
    - Notification details
    - Read/unread status indicators
    - Notification filtering options

### 7.3 Component Management UI Details
- **Inline Component Table**: Components shall be displayed as rows in a table within the scope item form
- **Component Row Structure**:
  - Component Type dropdown (ETL, ForgeRock IGA, ForgeRock UI, ForgeRock IG, ForgeRock IDM, SailPoint, Functional Test)
  - Technical Design effort input field (number, min 1, max 1000)
  - Build effort input field (number, min 1, max 1000)
  - Remove button ("×") for each component
- **Add Component**: "+" button to add new component rows
- **Validation**: Real-time validation of effort values and required fields
- **Auto-calculation**: Release-level efforts shall be automatically calculated and displayed based on scope item summations

## 8. System Interfaces

### 8.1 External Interfaces
- Excel file import/export for resource roster
- Excel export for reports and allocation data

### 8.2 Internal Interfaces
- REST API between frontend and backend
- Database connectivity for persistent storage
- Transaction logging system
- Scheduled job system for automatic resource status management

## 9. Constraints and Assumptions

### 9.1 Constraints
- The system must use the specified technical stack.
- The system must follow the defined SDLC phases for release planning.
- The transaction logging system must be compliant with organizational audit requirements.
- Components cannot be shared across multiple scope items.

### 9.2 Assumptions
- Users have basic familiarity with project management concepts.
- Users have access to resource data for import into the system.
- The standard work week is 5 days.
- The database system supports transaction logging and auditing capabilities.
- For the MVP, there is a single user with all permissions.
- No dependencies between releases are managed within the system for the MVP.
- Existing project data will be cleaned up during the transition to the new data model.

## 10. Development Approach

### 10.1 Test-Driven Development

The Release Management System will be developed following a Test-Driven Development (TDD) approach:

1. **Test-First Development**: All features will be developed by writing tests before implementation code.
2. **Comprehensive Testing**: Unit tests, integration tests, and end-to-end tests will ensure quality and reliability.
3. **Continuous Integration**: Automated testing will be part of the CI/CD pipeline.
4. **Test Coverage Goals**: Minimum 75% test coverage across both frontend and backend codebases.

This approach will ensure high code quality, facilitate refactoring, provide documentation through tests, and reduce defects in production.

### 10.2 Agile Development

The development process will follow Agile methodologies:
- Iterative development with regular feedback cycles
- Continuous delivery of working software
- Prioritization of features based on business value
- Adaptation to changing requirements

## 11. Appendices

### 11.1 Glossary
- **Resource**: An individual team member assigned to work on releases
- **Release**: A complete cycle of software delivery
- **Phase**: A distinct stage in the software delivery lifecycle
- **Scope Item**: A specific feature or component to be delivered in a release (replaces Project entity)
- **Component**: A specific technology or tool (e.g., ETL, ForgeRock IGA) within a scope item with its own effort estimates
- **Allocation**: Assignment of a resource to work on a specific release for a given period
- **Person-day**: A unit representing one day of work by one person
- **Transaction Log**: A record of data modifications for auditing purposes
- **Audit Trail**: A chronological record of system activities for security and compliance
- **Automatic Status Management**: A system process that automatically updates resource status from Active to Inactive when their project end date has passed

### 11.2 References
- Resource Allocation Best Practices

### Appendix A: Resource Roster Excel Format

The Excel file for resource roster upload shall follow this format:

| Column Name         | Data Type   | Required | Description                                     | Valid Values                                     |
|---------------------|-------------|----------|-------------------------------------------------|--------------------------------------------------|
| Name                | Text        | Yes      | Full name of the resource                       | Any text                                         |
| Employee Number     | Text        | Yes      | 8-digit unique identifier                       | 8-digit number                                   |
| Email               | Text        | Yes      | Email address                                   | Valid email format                               |
| Status              | Text        | Yes      | Current status of the resource                  | Active, Inactive                                 |
| Project Start Date  | Date        | Yes      | Date when resource joins the project            | Valid date (MM/DD/YYYY)                          |
| Project End Date    | Date        | No       | Date when resource leaves the project           | Valid date (MM/DD/YYYY)                          |
| Employee Grade      | Text        | Yes      | Grade level of the resource                     | Level 1-12                                       |
| Skill Function      | Text        | Yes      | Primary skill function                          | Functional Design, Technical Design, Build, Test, Platform |
| Skill Sub-function  | Text        | No       | Specific skill sub-function                     | Talend, ForgeRock IDM, ForgeRock IG, SailPoint, ForgeRock UI, Automated, Manual |

Sample Excel template:
```
Name,Employee Number,Email,Status,Project Start Date,Project End Date,Employee Grade,Skill Function,Skill Sub-function
John Doe,12345678,john.doe@example.com,Active,01/15/2024,12/31/2024,Level 8,Build,ForgeRock IDM
Jane Smith,87654321,jane.smith@example.com,Active,02/01/2024,11/30/2024,Level 9,Test,Manual
``` 