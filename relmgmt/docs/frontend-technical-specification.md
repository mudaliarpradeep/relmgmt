# Release Management System: Frontend Technical Specification

## 1. Overview

This document provides the technical specification for the frontend implementation of the Release Management System (RMS) MVP. The frontend will be built using React 19.1.0 with Vite as the build tool and will consume the RESTful API provided by the backend.

## 2. Technology Stack

- **Framework**: React 19.1.0
- **Build Tool**: Vite
- **UI Component Library**: ShadCB UI
- **Styling**: Tailwind CSS
- **Routing**: React Router 6
- **State Management**: React Query + Context API
- **Form Handling**: React Hook Form + Zod
- **Data Visualization**: Recharts
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript

## 3. Project Structure

```
frontend/
├── public/
│   └── assets/
│       └── images/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   ├── layout/           # Layout components
│   │   ├── forms/            # Form components
│   │   ├── tables/           # Table components
│   │   ├── charts/           # Chart components
│   │   ├── notifications/     # Notification components
│   │   └── modals/           # Modal components
│   ├── pages/
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard page
│   │   ├── resources/        # Resource management pages
│   │   ├── releases/         # Release management pages
│   │   ├── scope/            # Scope item management pages
│   │   │   ├── EffortSummaryTable.tsx # Effort summary table component
│   │   ├── components/       # Component management pages
│   │   ├── allocation/       # Allocation pages
│   │   ├── reports/          # Report pages
│   │   ├── notifications/    # Notification pages
│   │   └── audit/            # Audit log pages
│   ├── services/
│   │   ├── api/              # API service modules
│   │   │   ├── v1/           # API version 1 services
│   │   │   └── apiClient.ts  # Base API client
│   │   └── utils/            # Utility service modules
│   ├── hooks/                # Custom hooks
│   │   ├── useNotifications.ts # Notifications hook
│   │   └── ...               # Other custom hooks
│   ├── utils/                # Utility functions
│   ├── context/              # React context providers
│   │   ├── NotificationContext.tsx # Notification context
│   │   └── ...               # Other context providers
│   ├── types/                # TypeScript type definitions
│   ├── constants/            # Application constants
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite environment types
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── package.json              # NPM package configuration
```

## 4. Component Architecture

### 4.1 Core Components

#### 4.1.1 Layout Components

- **AppLayout**: Main application layout with sidebar, header, and content area
- **AuthLayout**: Layout for authentication pages
- **Sidebar**: Navigation sidebar with responsive hamburger menu for mobile devices
- **Header**: Application header with hamburger menu button, user info, and notification bell
- **NotificationCenter**: Dropdown for displaying notifications
- **Footer**: Application footer

#### 4.1.2 Common Components

- **Button**: Customized button component
- **Card**: Container component with consistent styling
- **Input**: Form input component
- **Select**: Dropdown select component
- **DatePicker**: Date selection component
- **Tabs**: Tabbed interface component
- **Badge**: Status indicator component
- **Alert**: Notification component
- **Spinner**: Loading indicator
- **Pagination**: Pagination control
- **Tooltip**: Tooltip component
- **DropdownMenu**: Dropdown menu component

#### 4.1.3 Notification Components

- **NotificationBell**: Bell icon with unread count indicator
- **NotificationList**: List of notifications
- **NotificationItem**: Individual notification item
- **NotificationFilters**: Filters for notification list

#### 4.1.4 Form Components

- **ResourceForm**: Form for creating/editing resources
- **ReleaseForm**: Form for creating/editing releases
  - Auto-generated identifier field (read-only) following YYYY-XXX format
  - Manual input for release name and other details
  - Phase management with dynamic add/remove functionality
- **ScopeItemForm**: Form for creating/editing scope items with inline component management
- **ComponentTable**: Inline table component for managing components within scope items
- **EffortEstimationForm**: Form for effort estimation
- **FileUploadForm**: Form for Excel file upload

#### 4.1.5 Table Components

- **DataTable**: Reusable table component with sorting and filtering
- **ResourceTable**: Table for displaying resources
- **ReleaseTable**: Table for displaying releases
- **ScopeItemTable**: Table for displaying scope items
- **ComponentTable**: Inline table for managing components within scope items
- **AllocationTable**: Table for displaying allocations
- **WeeklyAllocationTable**: Weekly allocation matrix with horizontal scrolling and lazy loading
- **AuditLogTable**: Table for displaying audit logs

#### 4.1.6 Chart Components

- **GanttChart**: Component for displaying Gantt charts
- **CapacityChart**: Component for displaying capacity load
- Supports weekly and max-per-resource modes with selector in `AllocationDetailPage`
- Color coding per PRD 4.4.2: GREEN = exactly 4.5 days, YELLOW = under 4.5, RED = over 4.5
- Loading/empty/error states implemented
- Storybook stories with height/loading/error controls
- **UtilizationChart**: Component for displaying resource utilization
- **TimelineChart**: Component for displaying release timeline
- **SkillCapacityChart**: Component for displaying skill-based capacity with available and allocated capacity

- **ConflictsChart**: Component for visualizing weekly over-allocation by resource
  - Transforms `AllocationConflictResponse` into bar chart data
  - Loading/empty/error states implemented
  - Storybook stories available

#### 4.1.7 Modal Components

- **ConfirmationModal**: Modal for confirming actions
  - Includes specialized confirmation for resource deletion with allocation check
- **FormModal**: Modal containing a form
- **DetailModal**: Modal for displaying detailed information
- **ErrorModal**: Modal for displaying detailed error information

### 4.2 Page Components

#### 4.2.1 Authentication

- **LoginPage**: User login page

#### 4.2.2 Dashboard

- **DashboardPage**: Main dashboard with overview of releases and resources

#### 4.2.3 Resource Management

- **ResourceListPage**: List of resources with filtering and sorting
  - Includes deletion functionality with pre-validation check
  - Displays error messages when deletion is not allowed
- **ResourceDetailPage**: Detailed view of a resource
  - Shows active allocations with release information
- **ResourceFormPage**: Page for creating/editing a resource
- **ResourceImportPage**: Page for importing resources from Excel

#### 4.2.4 Release Management

- **ReleaseListPage**: List of releases
- **ReleaseDetailPage**: Detailed view of a release with phases and scope items
- **ReleaseFormPage**: Page for creating/editing a release
- **ReleaseGanttPage**: Gantt chart view of a release

#### 4.2.5 Scope Item Management

- **ScopeItemListPage**: List of scope items for a release
- **ScopeItemDetailPage**: Detailed view of a scope item with component management
  - Displays scope item information and current components
  - Provides inline component management with effort estimates
  - Shows component table with add/remove functionality
  - Displays effort summary and validation
- **ScopeItemFormPage**: Page for creating/editing a scope item with inline component management
  - Scope item basic information (name, description)
  - Scope item-level effort estimates (Functional Design, SIT, UAT)
  - Inline component table with component management
  - Real-time validation and effort calculation
- **EffortSummaryTable**: Collapsible summary table for displaying aggregated effort estimates
  - Displays total effort across all scope items for a release
  - Shows both component types and phases dimensions in a matrix format
  - Component types: ETL, ForgeRock UI, ForgeRock IGA, ForgeRock IG, ForgeRock IDM, SailPoint, Functional Test
  - Phases: Functional Design, Technical Design, Build, SIT, UAT
  - Aggregates data from both scope item level and component level estimates
  - Positioned at bottom of scope items and release detail pages
  - Collapsible/expandable interface with clear toggle controls

#### 4.2.6 Component Management (Inline)

- **ComponentTable**: Inline table component for managing components within scope items
  - Component rows with dropdown selection for component type
  - Technical Design and Build effort input fields
  - Add/remove buttons for component management
  - Real-time validation (0-1000 PD range)
  - Component types: ETL, ForgeRock IGA, ForgeRock UI, ForgeRock IG, ForgeRock IDM, SailPoint, Functional Test

#### 4.2.7 Allocation Management

- **AllocationListPage**: List of allocations
- **AllocationDetailPage**: Detailed view of allocations with capacity charts
- **AllocationConflictsPage**: Page for viewing and resolving allocation conflicts
- **WeeklyAllocationPage**: Weekly allocation matrix with resource information and time-based columns

#### 4.2.8 Reports

- **ReportListPage**: List of available reports
- **ResourceUtilizationReportPage**: Resource utilization report
- **ReleaseTimelineReportPage**: Release timeline report
- **AllocationConflictsReportPage**: Allocation conflicts report
- **ResourceCapacityForecastPage**: Resource capacity forecast
- **SkillCapacityForecastPage**: Skill-based capacity forecast

#### 4.2.9 Notifications

- **NotificationListPage**: List of notifications with filtering and pagination
- **NotificationDetailModal**: Modal for viewing notification details

#### 4.2.10 Audit

- **AuditLogPage**: Page for viewing and filtering audit logs
- **AuditLogDetailPage**: Detailed view of an audit log entry

## 5. State Management

### 5.1 Authentication State

- Managed using Context API
- Stores user authentication status and token
- Provides login/logout functions

### 5.2 Data Fetching

- Managed using React Query
- Caching and automatic refetching
- Loading and error states
- Optimistic updates

### 5.3 Notification State

- Managed using Context API
- Stores current notifications and unread count
- Provides functions for:
  - Fetching notifications
  - Marking notifications as read
  - Deleting notifications
- Polling mechanism for checking new notifications

### 5.4 Form State

- Managed using React Hook Form
- Form validation with Zod
- Form submission handling

### 5.5 UI State

- Managed using Context API or component state
- Modal visibility
- Sidebar collapse state
- Theme preferences

## 6. API Integration

### 6.1 API Client

- Axios instance with base configuration
- Request/response interceptors
- Authentication token handling
- Error handling
- CORS support for cross-origin requests
- API versioning support
  - Base URL includes API version: `/api/v1/`
  - Version header support for future implementations
  - Ability to switch between API versions if needed

#### 6.1.1 CORS Configuration

The frontend is configured to work with the backend CORS settings:

- **Base URL**: Configurable via `VITE_API_URL` environment variable (defaults to `http://localhost:8080/api`)
- **CORS Headers**: Backend automatically handles CORS headers for frontend origin (`http://localhost:3000`)
- **Authentication**: JWT tokens are automatically included in Authorization header
- **Preflight Requests**: Handled automatically by browser and backend
- **Error Handling**: 401 responses trigger automatic logout and redirect to login page

### 6.2 API Services

#### 6.2.1 Service Architecture
- **Base API Client**: Centralized HTTP client with authentication and error handling
- **Versioned Services**: API services organized by version (v1, v2, etc.)
- **Type Safety**: Full TypeScript integration with backend DTOs
- **Error Handling**: Comprehensive error handling with user-friendly messages

#### 6.2.2 Enum Conversion
- **Status Enum Conversion**: Proper conversion between backend enum names and frontend display names
- **Phase Enum Conversion**: Consistent phase name mapping across frontend and backend
- **Validation**: Enum values validated before API calls
- **Fallback Handling**: Graceful handling of unknown enum values

#### 6.2.3 Effort Estimation and Allocation
- **Effort Derivation**: Automatic calculation and display of effort estimates from scope items
- **Real-time Updates**: Effort summary table updates automatically when scope items/components change
- **Allocation Generation**: Integration with derived effort estimates for resource allocation
- **Zero Effort Handling**: Proper display and handling of zero effort scenarios

#### 6.2.3 Service Modules

#### 6.2.1 ScopeItemService
```typescript
class ScopeItemService {
  async getScopeItems(releaseId: number): Promise<ScopeItem[]>
  async getScopeItem(id: number): Promise<ScopeItem>
  async createScopeItem(releaseId: number, data: ScopeItemRequest): Promise<ScopeItem>
  async updateScopeItem(id: number, data: ScopeItemRequest): Promise<ScopeItem>
  async deleteScopeItem(id: number): Promise<void>
  async getReleaseEffortSummary(releaseId: number): Promise<ReleaseEffortSummary>
}
```

#### 6.2.2 ComponentService
```typescript
class ComponentService {
  async getComponents(scopeItemId: number): Promise<Component[]>
  async getComponent(id: number): Promise<Component>
  async createComponent(scopeItemId: number, data: ComponentRequest): Promise<Component>
  async updateComponent(id: number, data: ComponentRequest): Promise<Component>
  async deleteComponent(id: number): Promise<void>
  async getComponentTypes(): Promise<ComponentType[]>
}
```

#### 6.2.3 WeeklyAllocationService
```typescript
class WeeklyAllocationService {
  async getWeeklyAllocations(currentWeekStart: string): Promise<WeeklyAllocationMatrix>
  async updateWeeklyAllocation(resourceId: string, weekStart: string, personDays: number): Promise<void>
  async getResourceProfile(resourceId: string): Promise<ResourceProfile>
}
```

### 6.3 Type Definitions

#### 6.3.1 ScopeItem Types
```typescript
interface ScopeItem {
  id: number;
  name: string;
  description?: string;
  releaseId: number;
  functionalDesignDays: number;
  sitDays: number;
  uatDays: number;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}

interface ScopeItemRequest {
  name: string;
  description?: string;
  functionalDesignDays: number;
  sitDays: number;
  uatDays: number;
  components: ComponentRequest[];
}

interface ReleaseEffortSummary {
  componentType: ComponentTypeEnum;
  phase: EffortPhase;
  totalEffort: number;
}

enum EffortPhase {
  FUNCTIONAL_DESIGN = 'FUNCTIONAL_DESIGN',
  TECHNICAL_DESIGN = 'TECHNICAL_DESIGN',
  BUILD = 'BUILD',
  SIT = 'SIT',
  UAT = 'UAT'
}
```

#### 6.3.2 Component Types
```typescript
interface Component {
  id: number;
  name: string;
  componentType: ComponentTypeEnum;
  technicalDesignDays: number;
  buildDays: number;
  scopeItemId: number;
  createdAt: string;
  updatedAt: string;
}

interface ComponentRequest {
  name: string;
  componentType: ComponentTypeEnum;
  technicalDesignDays: number;
  buildDays: number;
}

enum ComponentTypeEnum {
  ETL = 'ETL',
  FORGEROCK_IGA = 'FORGEROCK_IGA',
  FORGEROCK_UI = 'FORGEROCK_UI',
  FORGEROCK_IG = 'FORGEROCK_IG',
  FORGEROCK_IDM = 'FORGEROCK_IDM',
  SAILPOINT = 'SAILPOINT',
  FUNCTIONAL_TEST = 'FUNCTIONAL_TEST'
}
```

#### 6.3.3 Effort Summary Types
```typescript
interface ReleaseEffortSummary {
  releaseId: number;
  functionalDesignDays: number;
  technicalDesignDays: number;
  buildDays: number;
  sitDays: number;
  uatDays: number;
  regressionTestingDays?: number;
  smokeTestingDays?: number;
  goLiveDays?: number;
}
```

#### 6.3.4 Weekly Allocation Types
```typescript
interface WeeklyAllocation {
  weekStart: string; // YYYY-MM-DD (Monday)
  personDays: number;
  projectName?: string;
  projectId?: string;
}

interface Resource {
  id: string;
  name: string;
  grade: ResourceGrade;
  skillFunction: SkillFunction;
  skillSubFunction: SkillSubFunction;
  profileUrl: string;
  weeklyAllocations: WeeklyAllocation[];
}

interface WeeklyAllocationMatrix {
  resources: Resource[];
  currentWeekStart: string;
  timeWindow: {
    startWeek: string;
    endWeek: string;
    totalWeeks: number;
  };
}

type ResourceGrade = "Junior" | "Mid" | "Senior" | "Lead" | "Principal";
type SkillFunction = "Engineering" | "Design" | "Product" | "QA" | "DevOps";
type SkillSubFunction = "Frontend" | "Backend" | "Full-Stack" | "Mobile" | "Data" | "Infrastructure";
```

## 7. Form Validation

### 7.1 Scope Item Validation Schema
```typescript
const scopeItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  functionalDesignDays: z.number().min(1, 'Must be at least 1 PD').max(1000, 'Cannot exceed 1000 PD'),
  sitDays: z.number().min(1, 'Must be at least 1 PD').max(1000, 'Cannot exceed 1000 PD'),
  uatDays: z.number().min(1, 'Must be at least 1 PD').max(1000, 'Cannot exceed 1000 PD'),
  components: z.array(componentSchema).min(1, 'At least one component is required')
});
```

### 7.2 Component Validation Schema
```typescript
const componentSchema = z.object({
  name: z.string().min(1, 'Component name is required').max(100, 'Name must not exceed 100 characters'),
  componentType: z.nativeEnum(ComponentTypeEnum, { required_error: 'Component type is required' }),
  technicalDesignDays: z.number().min(1, 'Must be at least 1 PD').max(1000, 'Cannot exceed 1000 PD'),
  buildDays: z.number().min(1, 'Must be at least 1 PD').max(1000, 'Cannot exceed 1000 PD')
});
```

## 8. Component Management UI

### 8.1 Inline Component Table

The `ComponentTable` component provides inline management of components within scope items:

```typescript
interface ComponentTableProps {
  components: Component[];
  onAddComponent: (component: ComponentRequest) => void;
  onUpdateComponent: (id: number, component: ComponentRequest) => void;
  onDeleteComponent: (id: number) => void;
  disabled?: boolean;
}
```

#### 8.1.1 Component Table Structure
- **Component Type Dropdown**: Selection of available component types
- **Technical Design Input**: Number input for technical design effort (0-1000 PD)
- **Build Input**: Number input for build effort (0-1000 PD)
- **Remove Button**: "×" button to remove component
- **Add Button**: "+" button to add new component

#### 8.1.2 Validation Features
- Real-time validation of effort values
- Required field validation
- Minimum/maximum value enforcement
- Visual feedback for validation errors

### 8.2 Effort Calculation

#### 8.2.1 Scope Item Level
- Functional Design, SIT, and UAT efforts are manually entered
- Validation ensures values are between 0-1000 PD

#### 8.2.2 Component Level
- Technical Design and Build efforts are entered per component
- Validation ensures values are between 0-1000 PD

#### 8.2.3 Release Level
- Automatically calculated from scope items
- Displayed in release detail and summary views
- Manual override available for Regression Testing, Smoke Testing, and Go-Live

## 9. Routing

### 9.1 Route Structure
```typescript
const routes = [
  { path: '/', element: <DashboardPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/resources', element: <ResourceListPage /> },
  { path: '/resources/new', element: <ResourceFormPage /> },
  { path: '/resources/:id', element: <ResourceDetailPage /> },
  { path: '/resources/:id/edit', element: <ResourceFormPage /> },
  { path: '/releases', element: <ReleaseListPage /> },
  { path: '/releases/new', element: <ReleaseFormPage /> },
  { path: '/releases/:id', element: <ReleaseDetailPage /> },
  { path: '/releases/:id/edit', element: <ReleaseFormPage /> },
  { path: '/releases/:releaseId/scope-items', element: <ScopeItemListPage /> },
  { path: '/releases/:releaseId/scope-items/new', element: <ScopeItemFormPage /> },
  { path: '/scope-items/:id', element: <ScopeItemDetailPage /> },
  { path: '/scope-items/:id/edit', element: <ScopeItemFormPage /> },
  { path: '/allocations', element: <AllocationListPage /> },
  { path: '/allocations/weekly', element: <WeeklyAllocationPage /> },
  { path: '/releases/:releaseId/allocations', element: <AllocationDetailPage /> },
  { path: '/reports', element: <ReportListPage /> },
  { path: '/reports/resource-utilization', element: <ResourceUtilizationReportPage /> },
  { path: '/reports/release-timeline', element: <ReleaseTimelineReportPage /> },
  { path: '/reports/allocation-conflicts', element: <AllocationConflictsReportPage /> },
  { path: '/reports/resource-capacity-forecast', element: <ResourceCapacityForecastPage /> },
  { path: '/reports/skill-capacity-forecast', element: <SkillCapacityForecastPage /> },
  { path: '/notifications', element: <NotificationListPage /> },
  { path: '/audit', element: <AuditLogPage /> }
];
```

## 10. Testing Strategy

### 10.1 Unit Testing

#### 10.1.1 Component Testing
- Test individual React components in isolation
- Use React Testing Library for component tests
- Focus on user interactions and component behavior
- Test both UI rendering and component logic
- Test coverage target: minimum 80% for components

#### 10.1.2 Service Testing
- Test API service modules
- Mock API responses
- Test error handling
- Test data transformation

#### 10.1.3 Hook Testing
- Test custom hooks
- Test state management
- Test side effects

### 10.2 Integration Testing

- Test component interactions
- Verify data flow between components
- Test complete user flows
- Use Cypress for end-to-end testing

### 10.3 Test Utilities

#### 10.3.1 Test Data Factories
```typescript
export const createMockScopeItem = (overrides?: Partial<ScopeItem>): ScopeItem => ({
  id: 1,
  name: 'Test Scope Item',
  description: 'Test description',
  releaseId: 1,
  functionalDesignDays: 5,
  sitDays: 3,
  uatDays: 2,
  components: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createMockComponent = (overrides?: Partial<Component>): Component => ({
  id: 1,
  name: 'Test Component',
  componentType: ComponentTypeEnum.ETL,
  technicalDesignDays: 3,
  buildDays: 5,
  scopeItemId: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});
```

## 11. Performance Considerations

### 11.1 Code Splitting

- Lazy load route components
- Split large components into smaller chunks
- Use React.lazy for dynamic imports

### 11.2 Memoization

- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable callbacks

### 11.3 Virtualization

- Use virtualized lists for large datasets
- Implement pagination for data tables
- Optimize re-renders with proper key props

## 12. Accessibility

### 12.1 WCAG Compliance

- Ensure proper heading hierarchy
- Provide alt text for images
- Use semantic HTML elements
- Implement keyboard navigation
- Provide focus indicators

### 12.2 Screen Reader Support

- Use ARIA labels and descriptions
- Provide skip links
- Ensure proper form labeling
- Test with screen readers

## 13. Error Handling

### 13.1 API Error Handling

- Centralized error handling in API client
- User-friendly error messages
- Retry mechanisms for transient errors
- Fallback UI for failed components

### 13.2 Form Error Handling

- Real-time validation feedback
- Clear error messages
- Prevent form submission with errors
- Graceful degradation

## 14. Internationalization

### 14.1 Text Localization

- Extract all user-facing text
- Use translation keys
- Support multiple languages
- Format dates and numbers appropriately

## 15. Security

### 15.1 Input Validation

- Client-side validation for UX
- Server-side validation for security
- Sanitize user inputs
- Prevent XSS attacks

### 15.2 Authentication

- Secure token storage
- Automatic token refresh
- Logout on token expiration
- Protected route implementation

## 16. Deployment

### 16.1 Build Configuration

- Production build optimization
- Environment-specific configurations
- Asset optimization
- Bundle size analysis

### 16.2 Docker Configuration

- Multi-stage Docker build
- Optimized production image
- Health checks
- Environment variable handling

This updated frontend technical specification reflects the new data model that eliminates the Project entity and establishes direct relationships between Releases, Scope Items, and Components, with inline component management and proper effort estimation. 