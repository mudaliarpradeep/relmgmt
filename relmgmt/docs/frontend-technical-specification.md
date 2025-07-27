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
│   │   ├── projects/         # Project management pages
│   │   ├── scope/            # Scope management pages
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
- **Sidebar**: Navigation sidebar
- **Header**: Application header with user info and notification bell
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
- **ProjectForm**: Form for creating/editing projects
- **ScopeItemForm**: Form for creating/editing scope items
- **EffortEstimationForm**: Form for effort estimation
- **FileUploadForm**: Form for Excel file upload

#### 4.1.5 Table Components

- **DataTable**: Reusable table component with sorting and filtering
- **ResourceTable**: Table for displaying resources
- **ReleaseTable**: Table for displaying releases
- **ProjectTable**: Table for displaying projects
- **ScopeItemTable**: Table for displaying scope items
- **AllocationTable**: Table for displaying allocations
- **AuditLogTable**: Table for displaying audit logs

#### 4.1.6 Chart Components

- **GanttChart**: Component for displaying Gantt charts
- **CapacityChart**: Component for displaying capacity load
- **UtilizationChart**: Component for displaying resource utilization
- **TimelineChart**: Component for displaying release timeline
- **SkillCapacityChart**: Component for displaying skill-based capacity with available and allocated capacity

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
- **ReleaseDetailPage**: Detailed view of a release with phases
- **ReleaseFormPage**: Page for creating/editing a release
- **ReleaseGanttPage**: Gantt chart view of a release

#### 4.2.5 Project Management

- **ProjectListPage**: List of projects for a release
- **ProjectDetailPage**: Detailed view of a project
- **ProjectFormPage**: Page for creating/editing a project

#### 4.2.6 Scope Management

- **ScopeListPage**: List of scope items for a project
- **ScopeDetailPage**: Detailed view of a scope item
- **ScopeFormPage**: Page for creating/editing a scope item
- **EffortEstimationPage**: Page for providing effort estimates

#### 4.2.7 Allocation

- **AllocationPage**: Page for viewing and managing allocations
- **AllocationConflictsPage**: Page for viewing allocation conflicts

#### 4.2.8 Reports

- **ReportDashboardPage**: Overview of available reports
- **ResourceUtilizationReportPage**: Resource utilization report
- **ReleaseTimelineReportPage**: Release timeline report
- **AllocationConflictsReportPage**: Allocation conflicts report
- **CapacityForecastReportPage**: Capacity forecast report
- **SkillCapacityForecastReportPage**: Skill-based capacity forecast report showing allocated vs. available capacity by skill function and sub-function

#### 4.2.9 Notification Management

- **NotificationListPage**: List of all notifications with filters
- **NotificationDetailPage**: Detailed view of a notification

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
- API versioning support
  - Base URL includes API version: `/api/v1/`
  - Version header support for future implementations
  - Ability to switch between API versions if needed

### 6.2 API Services

#### 6.2.1 Authentication Service

- `login(username, password)`: User login
- `logout()`: User logout

#### 6.2.2 Resource Service

- `getResources(params)`: Get paginated list of resources
- `getResource(id)`: Get resource by ID
- `createResource(data)`: Create new resource
- `updateResource(id, data)`: Update resource
- `deleteResource(id)`: Delete resource
  - Handles HTTP 409 Conflict response when resource is allocated to active releases
  - Returns error details for display to the user
- `importResources(file)`: Import resources from Excel
- `exportResources()`: Export resources to Excel
- `checkResourceAllocation(id)`: Check if resource is allocated to any active release before attempting deletion

#### 6.2.3 Release Service

- `getReleases(params)`: Get paginated list of releases
- `getRelease(id)`: Get release by ID
- `createRelease(data)`: Create new release
- `updateRelease(id, data)`: Update release
- `deleteRelease(id)`: Delete release
- `getPhases(releaseId)`: Get phases for a release
- `addBlocker(releaseId, data)`: Add blocker to release
- `removeBlocker(releaseId, blockerId)`: Remove blocker from release

#### 6.2.4 Project Service

- `getProjects(releaseId)`: Get projects for a release
- `getProject(id)`: Get project by ID
- `createProject(releaseId, data)`: Create new project
- `updateProject(id, data)`: Update project
- `deleteProject(id)`: Delete project

#### 6.2.5 Scope Service

- `getScopeItems(projectId)`: Get scope items for a project
- `getScopeItem(id)`: Get scope item by ID
- `createScopeItem(projectId, data)`: Create new scope item
- `updateScopeItem(id, data)`: Update scope item
- `deleteScopeItem(id)`: Delete scope item
- `addEstimates(scopeItemId, data)`: Add effort estimates

#### 6.2.6 Allocation Service

- `allocateResources(releaseId)`: Generate resource allocation
- `getAllocations(releaseId)`: Get allocations for a release
- `getResourceAllocations(resourceId)`: Get allocations for a resource
- `getAllocationConflicts()`: Get allocation conflicts

#### 6.2.7 Report Service

- `getResourceUtilizationReport(params)`: Get resource utilization report
- `getReleaseTimelineReport(params)`: Get release timeline report
- `getAllocationConflictsReport()`: Get allocation conflicts report
- `getCapacityForecastReport(params)`: Get capacity forecast report
- `getSkillCapacityForecastReport(params)`: Get skill-based capacity forecast report showing allocated vs. available capacity
- `exportReport(reportType, params)`: Export report to Excel

#### 6.2.8 Notification Service

- `getNotifications(params)`: Get user notifications
- `markAsRead(id)`: Mark notification as read
- `markAllAsRead()`: Mark all notifications as read
- `deleteNotification(id)`: Delete notification

#### 6.2.9 Audit Service

- `getAuditLogs(params)`: Get paginated list of audit logs
- `getAuditLog(id)`: Get audit log by ID
- `exportAuditLogs(params)`: Export audit logs to Excel

## 7. Routing

### 7.1 Route Structure

```typescript
const routes = [
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: "resources",
        children: [
          {
            index: true,
            element: <ResourceListPage />
          },
          {
            path: "new",
            element: <ResourceFormPage />
          },
          {
            path: ":id",
            element: <ResourceDetailPage />
          },
          {
            path: ":id/edit",
            element: <ResourceFormPage />
          },
          {
            path: "import",
            element: <ResourceImportPage />
          }
        ]
      },
      {
        path: "notifications",
        children: [
          {
            index: true,
            element: <NotificationListPage />
          },
          {
            path: ":id",
            element: <NotificationDetailPage />
          }
        ]
      },
      // Similar structure for other resource types
    ]
  }
];
```

### 7.2 Route Guards

- `AuthGuard`: Protects routes that require authentication
- `NotFoundPage`: Displayed for invalid routes

## 8. UI Design

### 8.1 Design System

- Based on ShadCB UI components
- Customized with Tailwind CSS
- Consistent spacing, typography, and color scheme

### 8.2 Responsive Design

- Mobile-first approach
- Breakpoints for different screen sizes
- Responsive layout components

### 8.3 Accessibility

- ARIA attributes
- Keyboard navigation
- Color contrast compliance
- Screen reader support

## 9. Data Visualization

### 9.1 Gantt Chart

- Display phases for a single release
- Display multiple releases in a consolidated view
- Interactive with zoom and pan capabilities
- Color coding for different phases

### 9.2 Capacity Load View

- Display resource loading with color coding
- GREEN: Resource loaded for exactly 4.5 person-days in a week
- AMBER: Resource loaded for over 4.5 person-days in a week
- YELLOW: Resource loaded for less than 4.5 person-days in a week
- Filtering by time period and resource attributes

### 9.3 Resource Utilization Chart

- Display allocation percentage for each resource across time
- Highlighting under/over-allocation periods
- Filtering by resource attributes

### 9.4 Release Timeline Chart

- Display all releases with their phases on a timeline
- Identify potential bottlenecks
- Filtering by year or time period

## 10. Forms and Validation

### 10.1 Form Handling

- React Hook Form for form state management
- Zod for schema validation
- Custom form components for consistent styling

### 10.2 Validation Rules

#### 10.2.1 Resource Form

- Name: Required
- Employee Number: Required, 8 digits
- Email: Required, valid email format
- Status: Required, one of ["Active", "Inactive"]
- Project Start Date: Required, valid date
- Project End Date: Optional, valid date after start date
- Employee Grade: Required, one of ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10", "Level 11", "Level 12"]
- Skill Function: Required, one of ["Functional Design", "Technical Design", "Build", "Test", "Platform"]
- Skill Sub-function: Required for certain skill functions, with the following constraints:
  - For "Technical Design" and "Build": One of ["Talend", "ForgeRock IDM", "ForgeRock IG", "SailPoint", "ForgeRock UI"]
  - For "Test": One of ["Automated", "Manual"]
  - Not applicable for other skill functions

#### 10.2.2 Release Form

- Name: Required
- Identifier: Required, unique
- Phases: At least one phase required
  - Phase Type: Required, one of ["Functional Design", "Technical Design", "Build", "System Integration Test", "User Acceptance Test", "Smoke Testing", "Production Go-Live"]
  - Start Date: Required, valid date
  - End Date: Required, valid date after start date

#### 10.2.3 Project Form

- Name: Required
- Description: Optional
- Type: Required, one of ["Day 1", "Day 2"]

#### 10.2.4 Scope Item Form

- Name: Required
- Description: Optional

#### 10.2.5 Effort Estimation Form

- Skill Function: Required, one of ["Functional Design", "Technical Design", "Build", "Test", "Platform"]
- Skill Sub-function: Required for certain skill functions with the same constraints as the Resource Form
- Phase: Required, one of ["Functional Design", "Technical Design", "Build", "System Integration Test", "User Acceptance Test", "Smoke Testing", "Production Go-Live"]
- Effort Days: Required, positive number

#### 10.2.6 Blocker Form

- Description: Required
- Status: Required, one of ["Open", "Resolved"]

#### 10.2.7 Notification Filter Form

- Event Type: Optional, one of ["Allocation Conflict", "Over Allocation", "Deadline Approaching", "Blocker Added", "Blocker Resolved"]
- Is Read: Optional, boolean

### 10.3 Enum Type Definitions

```typescript
// Status enum
export enum StatusEnum {
  ACTIVE = "Active",
  INACTIVE = "Inactive"
}

// Employee Grade enum
export enum EmployeeGradeEnum {
  LEVEL_1 = "Level 1",
  LEVEL_2 = "Level 2",
  LEVEL_3 = "Level 3",
  LEVEL_4 = "Level 4",
  LEVEL_5 = "Level 5",
  LEVEL_6 = "Level 6",
  LEVEL_7 = "Level 7",
  LEVEL_8 = "Level 8",
  LEVEL_9 = "Level 9",
  LEVEL_10 = "Level 10",
  LEVEL_11 = "Level 11",
  LEVEL_12 = "Level 12"
}

// Skill Function enum
export enum SkillFunctionEnum {
  FUNCTIONAL_DESIGN = "Functional Design",
  TECHNICAL_DESIGN = "Technical Design",
  BUILD = "Build",
  TEST = "Test",
  PLATFORM = "Platform"
}

// Skill Sub-function enum
export enum SkillSubFunctionEnum {
  TALEND = "Talend",
  FORGEROCK_IDM = "ForgeRock IDM",
  FORGEROCK_IG = "ForgeRock IG",
  SAILPOINT = "SailPoint",
  FORGEROCK_UI = "ForgeRock UI",
  AUTOMATED = "Automated",
  MANUAL = "Manual"
}

// Phase Type enum
export enum PhaseTypeEnum {
  FUNCTIONAL_DESIGN = "Functional Design",
  TECHNICAL_DESIGN = "Technical Design",
  BUILD = "Build",
  SIT = "System Integration Test",
  UAT = "User Acceptance Test",
  SMOKE_TESTING = "Smoke Testing",
  PRODUCTION_GO_LIVE = "Production Go-Live"
}

// Blocker Status enum
export enum BlockerStatusEnum {
  OPEN = "Open",
  RESOLVED = "Resolved"
}

// Event Type enum
export enum EventTypeEnum {
  ALLOCATION_CONFLICT = "Allocation Conflict",
  OVER_ALLOCATION = "Over Allocation",
  DEADLINE_APPROACHING = "Deadline Approaching",
  BLOCKER_ADDED = "Blocker Added",
  BLOCKER_RESOLVED = "Blocker Resolved"
}

// Action Type enum
export enum ActionTypeEnum {
  CREATE = "Create",
  UPDATE = "Update",
  DELETE = "Delete"
}

// Project Type enum
export enum ProjectTypeEnum {
  DAY_1 = "Day 1",
  DAY_2 = "Day 2"
}
```

### 10.4 Zod Schema Examples

```typescript
// Resource schema
const resourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  employeeNumber: z.string().length(8, "Employee number must be 8 digits").regex(/^\d+$/, "Employee number must contain only digits"),
  email: z.string().email("Invalid email format"),
  status: z.nativeEnum(StatusEnum),
  projectStartDate: z.date(),
  projectEndDate: z.date().optional().refine(
    (date, ctx) => {
      if (date && ctx.parent.projectStartDate && date < ctx.parent.projectStartDate) {
        return false;
      }
      return true;
    },
    { message: "End date must be after start date" }
  ),
  employeeGrade: z.nativeEnum(EmployeeGradeEnum),
  skillFunction: z.nativeEnum(SkillFunctionEnum),
  skillSubFunction: z.nativeEnum(SkillSubFunctionEnum).optional().refine(
    (subFunction, ctx) => {
      if (!subFunction) return true;
      
      const { skillFunction } = ctx.parent;
      
      if (skillFunction === SkillFunctionEnum.TECHNICAL_DESIGN || skillFunction === SkillFunctionEnum.BUILD) {
        return [
          SkillSubFunctionEnum.TALEND,
          SkillSubFunctionEnum.FORGEROCK_IDM,
          SkillSubFunctionEnum.FORGEROCK_IG,
          SkillSubFunctionEnum.SAILPOINT,
          SkillSubFunctionEnum.FORGEROCK_UI
        ].includes(subFunction);
      }
      
      if (skillFunction === SkillFunctionEnum.TEST) {
        return [
          SkillSubFunctionEnum.AUTOMATED,
          SkillSubFunctionEnum.MANUAL
        ].includes(subFunction);
      }
      
      return !subFunction; // Should be undefined for other skill functions
    },
    { message: "Invalid skill sub-function for the selected skill function" }
  )
});

// Phase schema
const phaseSchema = z.object({
  phaseType: z.nativeEnum(PhaseTypeEnum),
  startDate: z.date(),
  endDate: z.date().refine(
    (endDate, ctx) => {
      if (endDate < ctx.parent.startDate) {
        return false;
      }
      return true;
    },
    { message: "End date must be after start date" }
  )
});

// Release schema
const releaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  identifier: z.string().min(1, "Identifier is required"),
  phases: z.array(phaseSchema).min(1, "At least one phase is required")
});

// Effort estimation schema
const effortEstimateSchema = z.object({
  skillFunction: z.nativeEnum(SkillFunctionEnum),
  skillSubFunction: z.nativeEnum(SkillSubFunctionEnum).optional(),
  phase: z.nativeEnum(PhaseTypeEnum),
  effortDays: z.number().positive("Effort days must be positive")
});

// Blocker schema
const blockerSchema = z.object({
  description: z.string().min(1, "Description is required"),
  status: z.nativeEnum(BlockerStatusEnum)
});

// Project schema
const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.nativeEnum(ProjectTypeEnum)
});
```

### 10.5 Error Handling

- Inline validation errors
- Form-level validation errors
- Server-side validation errors

## 11. Excel Import/Export

### 11.1 Import

- File upload component
- Validation of file format
- Progress indicator
- Error handling and reporting
- Success confirmation

### 11.2 Export

- Export button triggers file download
- Loading indicator during export generation
- Error handling

## 12. Authentication and Security

### 12.1 Login Flow

- Login form with username and password
- JWT token storage in secure cookie or localStorage
- Automatic token refresh
- Session timeout handling

### 12.2 Security Measures

- CSRF protection
- XSS prevention
- Secure HTTP headers
- Input sanitization

## 13. Error Handling

### 13.1 API Error Handling

- Global error handler for API requests
- Specific error handling for different error types:
  - 400 Bad Request: Form validation errors
  - 401 Unauthorized: Authentication issues
  - 403 Forbidden: Authorization issues
  - 404 Not Found: Entity not found
  - 409 Conflict: Business rule violations (e.g., resource allocated to active release)
  - 500 Internal Server Error: Unexpected server errors
- User-friendly error messages

### 13.2 UI Error States

- Error boundaries for component errors
- Fallback UI for failed components
- Error notifications

## 14. Performance Optimization

### 14.1 Code Splitting

- Route-based code splitting
- Component lazy loading

### 14.2 Memoization

- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable callbacks

### 14.3 Virtualization

- Virtualized lists for large data sets
- Pagination for tables

## 15. Testing Strategy

### 15.1 Test-Driven Development Approach

The frontend development will follow a Test-Driven Development (TDD) approach:

1. **Write the Test First**: For each component or functionality, write tests before implementing the actual code.
2. **Run the Test**: Run the test to verify that it fails (since the implementation doesn't exist yet).
3. **Implement the Code**: Write the minimum code necessary to make the test pass.
4. **Run the Test Again**: Verify that the test now passes with the implementation.
5. **Refactor**: Clean up the code while ensuring the test continues to pass.
6. **Repeat**: Continue this cycle for each new component or functionality.

### 15.2 Component Testing

- Test individual React components in isolation
- Use React Testing Library for component tests
- Focus on user interactions and component behavior
- Test both UI rendering and component logic
- Test coverage target: minimum 80% for components

#### 15.2.1 Example Component Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceForm } from './ResourceForm';

describe('ResourceForm', () => {
  const mockSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockSubmit,
    initialValues: {
      name: '',
      employeeNumber: '',
      email: '',
      status: 'Active',
      projectStartDate: new Date(),
      employeeGrade: 'Level 8',
      skillFunction: 'Build',
      skillSubFunction: 'ForgeRock IDM'
    }
  };

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  test('renders form fields correctly', () => {
    render(<ResourceForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/employee number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/employee grade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/skill function/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/skill sub-function/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<ResourceForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/employee number is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('validates employee number format', async () => {
    render(<ResourceForm {...defaultProps} />);
    
    const employeeNumberInput = screen.getByLabelText(/employee number/i);
    fireEvent.change(employeeNumberInput, { target: { value: '123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/employee number must be 8 digits/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    render(<ResourceForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/employee number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait for validation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'John Doe',
      employeeNumber: '12345678',
      email: 'john.doe@example.com'
    }));
  });
});
```

### 15.3 Hook Testing

- Test custom hooks independently
- Verify hook behavior and state changes
- Use React Hooks Testing Library
- Test both success and error scenarios

#### 15.3.1 Example Hook Test Structure

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useNotifications } from './useNotifications';
import { NotificationService } from '../services/api/v1/notificationService';

// Mock the notification service
vi.mock('../services/api/v1/notificationService', () => ({
  NotificationService: {
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn()
  }
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should fetch notifications on mount', async () => {
    const mockNotifications = [
      { id: 1, message: 'Test notification', isRead: false }
    ];
    
    NotificationService.getNotifications.mockResolvedValueOnce({
      data: mockNotifications
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useNotifications());
    
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.notifications).toEqual(mockNotifications);
    expect(NotificationService.getNotifications).toHaveBeenCalledTimes(1);
  });

  test('should mark notification as read', async () => {
    const mockNotifications = [
      { id: 1, message: 'Test notification', isRead: false }
    ];
    
    NotificationService.getNotifications.mockResolvedValueOnce({
      data: mockNotifications
    });
    
    NotificationService.markAsRead.mockResolvedValueOnce({});
    
    const { result, waitForNextUpdate } = renderHook(() => useNotifications());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.markAsRead(1);
    });
    
    expect(NotificationService.markAsRead).toHaveBeenCalledWith(1);
  });
});
```

### 15.4 Service Testing

- Test API service modules
- Mock API responses with MSW (Mock Service Worker)
- Verify request formatting and response handling
- Test error handling and retry logic

#### 15.4.1 Example Service Test Structure

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ResourceService } from './resourceService';

const server = setupServer(
  rest.get('/api/v1/resources', (req, res, ctx) => {
    return res(
      ctx.json({
        content: [
          { id: 1, name: 'John Doe', employeeNumber: '12345678' }
        ],
        totalElements: 1,
        totalPages: 1
      })
    );
  }),
  
  rest.get('/api/v1/resources/1', (req, res, ctx) => {
    return res(
      ctx.json({ id: 1, name: 'John Doe', employeeNumber: '12345678' })
    );
  }),
  
  rest.delete('/api/v1/resources/2', (req, res, ctx) => {
    return res(
      ctx.status(409),
      ctx.json({
        status: 409,
        error: 'Conflict',
        message: 'Cannot delete resource. Resource is allocated to active releases.'
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ResourceService', () => {
  test('getResources should return paginated resources', async () => {
    const result = await ResourceService.getResources();
    
    expect(result.content).toHaveLength(1);
    expect(result.content[0].name).toBe('John Doe');
    expect(result.totalElements).toBe(1);
  });
  
  test('getResource should return resource by id', async () => {
    const result = await ResourceService.getResource(1);
    
    expect(result.id).toBe(1);
    expect(result.name).toBe('John Doe');
  });
  
  test('deleteResource should handle conflict error', async () => {
    try {
      await ResourceService.deleteResource(2);
      fail('Expected an error but none was thrown');
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.message).toBe(
        'Cannot delete resource. Resource is allocated to active releases.'
      );
    }
  });
});
```

### 15.5 Store/Context Testing

- Test state management logic
- Verify context providers and consumers
- Test state transitions and side effects
- Ensure proper data flow through the application

### 15.6 Integration Testing

- Test component interactions
- Verify data flow between components
- Test complete user flows
- Use Cypress for end-to-end testing

#### 15.6.1 Example Cypress Test Structure

```typescript
describe('Resource Management', () => {
  beforeEach(() => {
    cy.login('admin', 'password');
    cy.visit('/resources');
  });

  it('should display resource list', () => {
    cy.get('[data-testid="resource-table"]').should('be.visible');
    cy.get('[data-testid="resource-row"]').should('have.length.at.least', 1);
  });

  it('should navigate to resource details', () => {
    cy.get('[data-testid="resource-row"]').first().click();
    cy.url().should('include', '/resources/');
    cy.get('[data-testid="resource-details"]').should('be.visible');
  });

  it('should create a new resource', () => {
    cy.get('[data-testid="add-resource-button"]').click();
    cy.get('[data-testid="resource-form"]').should('be.visible');
    
    cy.get('input[name="name"]').type('Test Resource');
    cy.get('input[name="employeeNumber"]').type('87654321');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('select[name="status"]').select('Active');
    cy.get('select[name="employeeGrade"]').select('Level 8');
    cy.get('select[name="skillFunction"]').select('Build');
    cy.get('select[name="skillSubFunction"]').select('ForgeRock IDM');
    
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/resources');
    cy.contains('Test Resource').should('be.visible');
  });

  it('should show error when trying to delete allocated resource', () => {
    // Assuming resource with ID 2 is allocated to an active release
    cy.get('[data-testid="resource-row"]').eq(1).find('[data-testid="delete-button"]').click();
    cy.get('[data-testid="confirm-delete"]').click();
    
    cy.get('[data-testid="error-modal"]').should('be.visible');
    cy.contains('Cannot delete resource. Resource is allocated to active releases.').should('be.visible');
  });
});
```

### 15.7 Accessibility Testing

- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast compliance
- Use axe-core for automated accessibility testing

### 15.8 Visual Regression Testing

- Use Storybook for component visualization
- Implement visual regression tests with Chromatic
- Capture screenshots for UI comparison
- Detect unintended visual changes

### 15.9 Performance Testing

- Measure component render times
- Test application load time
- Monitor bundle size
- Use Lighthouse for performance metrics

### 15.10 Test Automation and CI/CD Integration

- Automate all tests as part of the CI/CD pipeline
- Run unit and component tests on every commit
- Run integration tests on pull requests
- Run end-to-end tests on staging environment
- Generate test coverage reports
- Fail the build if test coverage falls below thresholds

### 15.11 Test Documentation

- Document test cases in Storybook
- Maintain test coverage reports
- Document testing approach for complex components
- Update test documentation as requirements change

## 16. Build and Deployment

### 16.1 Development

- Vite dev server with hot module replacement
- Environment variable configuration
- Proxy configuration for API requests

### 16.2 Production Build

- Optimized bundle with tree shaking
- Asset optimization
- Source maps
- Environment-specific builds

### 16.3 Docker Containerization

#### 16.3.1 Docker Build Process

The frontend application will be containerized using Docker to ensure consistent deployment across environments. The Docker build process will be as follows:

1. **Base Dockerfile**: The frontend will use a multi-stage build process to optimize the final image size.

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build the application with environment variables
ARG VITE_API_URL=/api/v1
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

2. **Development Dockerfile**: A separate Dockerfile for development with hot reloading.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Expose the development server port
EXPOSE 3000
# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

3. **Test Dockerfile**: A separate Dockerfile for running tests.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Run tests with coverage
CMD ["npm", "run", "test", "--", "--coverage"]
```

#### 16.3.2 Nginx Configuration

The production Docker image will use Nginx to serve the static files and handle routing:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router paths
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy for backend
    location /api/ {
        proxy_pass http://relmgmt-backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

#### 16.3.3 Docker Compose Configuration

The Docker Compose configuration will include services for development and testing environments:

```yaml
version: '3.8'

services:
  # Frontend
  relmgmt-frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: relmgmt-frontend
    ports:
      - '3000:3000'
    environment:
      - VITE_API_URL=http://localhost:8080/api/v1
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    networks:
      - relmgmtnet
    depends_on:
      - relmgmt-backend

  # Backend API (reference)
  relmgmt-backend:
    image: relmgmt-backend:latest
    container_name: relmgmt-backend
    ports:
      - '8080:8080'
    networks:
      - relmgmtnet
    depends_on:
      - relmgmtpostgres

  # Database (reference)
  relmgmtpostgres:
    image: postgres:17
    container_name: relmgmtpostgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: bBzp16eHfA29wZUvr
      POSTGRES_DB: relmgmt
    networks:
      - relmgmtnet
    volumes:
      - relmgmt_postgres_data:/var/lib/postgresql/data

networks:
  relmgmtnet:
    driver: bridge

volumes:
  relmgmt_postgres_data:
```

#### 16.3.4 Docker Build and Run Commands

To build and run the frontend application using Docker:

```bash
# Development build
docker build -f Dockerfile.dev -t relmgmt-frontend-dev:latest .
docker run -p 3000:3000 --name relmgmt-frontend-dev \
  -e VITE_API_URL=http://localhost:8080/api/v1 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  relmgmt-frontend-dev:latest

# Production build
docker build -t relmgmt-frontend:latest .
docker run -p 80:80 --name relmgmt-frontend relmgmt-frontend:latest
```

To use Docker Compose for the entire stack:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop all services
docker-compose down
```

#### 16.3.5 CI/CD Pipeline Integration

The Docker build process will be integrated into the CI/CD pipeline:

1. **Build Stage**:
   ```yaml
   build:
     image: docker:20.10.16
     stage: build
     services:
       - docker:20.10.16-dind
     script:
       - docker build -t relmgmt-frontend:$CI_COMMIT_SHA .
       - docker tag relmgmt-frontend:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
       - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
   ```

2. **Test Stage**:
   ```yaml
   test:
     image: docker:20.10.16
     stage: test
     services:
       - docker:20.10.16-dind
     script:
       - docker build -f Dockerfile.test -t relmgmt-frontend-test:$CI_COMMIT_SHA .
       - docker run --rm relmgmt-frontend-test:$CI_COMMIT_SHA
   ```

#### 16.3.6 Environment-Specific Docker Configurations

The Docker configuration will support different environments through build arguments and environment variables:

1. **Development**:
   - Uses Dockerfile.dev
   - Features: Hot reload, source maps, detailed logging
   - Environment variables: `VITE_API_URL=http://localhost:8080/api/v1`

2. **Testing**:
   - Uses Dockerfile.test
   - Features: Test coverage reporting
   - Environment variables: `VITE_API_URL=http://localhost:8080/api/v1`

3. **Production**:
   - Uses multi-stage Dockerfile
   - Features: Optimized bundle, Nginx serving, caching
   - Build arguments: `VITE_API_URL=/api/v1`

#### 16.3.7 Docker Volume Management

For development, the application will use Docker volumes to enable hot reloading:

1. **Source Code Volume**: Maps the local `src` directory to `/app/src` in the container
2. **Public Assets Volume**: Maps the local `public` directory to `/app/public` in the container

#### 16.3.8 Docker Network Configuration

The application will use a dedicated Docker network (`relmgmtnet`) to isolate the application components and provide secure communication between services.

#### 16.3.9 Complete Docker Stack

The complete Docker stack for the application includes:

1. **Frontend**: React application served by Nginx
2. **Backend**: Spring Boot API
3. **Database**: PostgreSQL
4. **Database Admin**: pgAdmin for database management

## 17. Implementation Plan

### 17.1 TDD Implementation Approach

The frontend implementation will follow a strict Test-Driven Development approach for all components:

1. **Phase 1: Project Setup and Testing Infrastructure**
   - Initialize project with Vite
   - Set up TypeScript configuration
   - Set up testing environment (Vitest, React Testing Library, MSW)
   - Configure ESLint and Prettier
   - Set up CI/CD pipeline with test automation
   - Set up Storybook for component documentation and testing

2. **Phase 2: Core Components and Layout**
   - Write tests for layout components
   - Implement layout components
   - Write tests for common UI components
   - Implement common UI components
   - Write tests for form components
   - Implement form components
   - Write tests for table components
   - Implement table components

3. **Phase 3: Authentication and Routing**
   - Write tests for authentication service
   - Implement authentication service
   - Write tests for authentication hooks
   - Implement authentication hooks
   - Write tests for protected routes
   - Implement routing with protected routes
   - Write tests for API client with auth token handling
   - Implement API client

4. **Phase 4: Resource Management**
   - Write tests for resource service
   - Implement resource service
   - Write tests for resource list page
   - Implement resource list page
   - Write tests for resource form
   - Implement resource form
   - Write tests for resource detail page
   - Implement resource detail page
   - Write tests for Excel import/export
   - Implement Excel import/export

5. **Phase 5: Release Management**
   - Write tests for release service
   - Implement release service
   - Write tests for release list page
   - Implement release list page
   - Write tests for release form
   - Implement release form
   - Write tests for release detail page
   - Implement release detail page
   - Write tests for Gantt chart component
   - Implement Gantt chart component

6. **Phase 6: Project and Scope Management**
   - Write tests for project service
   - Implement project service
   - Write tests for scope service
   - Implement scope service
   - Write tests for project management pages
   - Implement project management pages
   - Write tests for scope management pages
   - Implement scope management pages
   - Write tests for effort estimation form
   - Implement effort estimation form

7. **Phase 7: Allocation and Visualization**
   - Write tests for allocation service
   - Implement allocation service
   - Write tests for allocation page
   - Implement allocation page
   - Write tests for capacity chart component
   - Implement capacity chart component
   - Write tests for allocation conflicts page
   - Implement allocation conflicts page

8. **Phase 8: Reports and Data Export**
   - Write tests for report services
   - Implement report services
   - Write tests for report pages
   - Implement report pages
   - Write tests for chart components
   - Implement chart components
   - Write tests for export functionality
   - Implement export functionality

9. **Phase 9: Notification System**
   - Write tests for notification service
   - Implement notification service
   - Write tests for notification hooks
   - Implement notification hooks
   - Write tests for notification components
   - Implement notification components
   - Write tests for notification pages
   - Implement notification pages

10. **Phase 10: Audit Log and Final Integration**
    - Write tests for audit log service
    - Implement audit log service
    - Write tests for audit log pages
    - Implement audit log pages
    - Write integration tests for complete workflows
    - Implement end-to-end tests with Cypress
    - Conduct accessibility testing
    - Perform performance optimization

### 17.2 Test Coverage Goals

- Component test coverage: minimum 80%
- Hook test coverage: minimum 90%
- Service test coverage: minimum 85%
- Overall test coverage: minimum 75%
- End-to-end test coverage: all critical user flows

### 17.3 Timeline Estimate

- Phase 1: 1 week
- Phase 2: 2 weeks
- Phase 3: 1 week
- Phase 4: 2 weeks
- Phase 5: 2 weeks
- Phase 6: 2 weeks
- Phase 7: 2 weeks
- Phase 8: 2 weeks
- Phase 9: 1 week
- Phase 10: 2 weeks

Total estimated time: 17 weeks 