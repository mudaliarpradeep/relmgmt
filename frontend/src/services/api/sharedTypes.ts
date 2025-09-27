// Shared types for API services to avoid import issues with the main types file
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Component types
export const ComponentType = {
  ETL: 'ETL',
  FORGEROCK_IGA: 'FORGEROCK_IGA',
  FORGEROCK_UI: 'FORGEROCK_UI',
  FORGEROCK_IG: 'FORGEROCK_IG',
  FORGEROCK_IDM: 'FORGEROCK_IDM',
  SAILPOINT: 'SAILPOINT',
  FUNCTIONAL_TEST: 'FUNCTIONAL_TEST'
} as const;

export type ComponentTypeEnum = typeof ComponentType[keyof typeof ComponentType];

export interface Component {
  id: number;
  name: string;
  componentType: ComponentTypeEnum;
  technicalDesignDays: number;
  buildDays: number;
  scopeItemId: number;
  effortEstimates?: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface ComponentRequest {
  name: string;
  componentType: ComponentTypeEnum;
  technicalDesignDays: number;
  buildDays: number;
}

export interface ComponentResponse extends Component {
  totalEffortDays: number;
}

// Scope Item types
export interface ScopeItem {
  id: number;
  releaseId: number;
  name: string;
  description?: string;
  functionalDesignDays: number;
  sitDays: number;
  uatDays: number;
  components: Component[];
  componentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeItemRequest {
  name: string;
  description?: string;
  functionalDesignDays: number;
  sitDays: number;
  uatDays: number;
  components: ComponentRequest[];
}

export interface ScopeItemWithComponents extends ScopeItem {
  components: Component[];
  primaryComponent?: string;
  totalEffortDays: number;
}

export interface ReleaseEffortSummary {
  componentType: string;
  phase: string;
  totalEffort: number;
}

// Project types
export interface Project {
  id: number;
  releaseId: number;
  name: string;
  description: string;
  type: 'Day 1' | 'Day 2';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  type: 'Day 1' | 'Day 2';
}

export const ProjectType = {
  DAY_1: 'Day 1',
  DAY_2: 'Day 2',
} as const;

export type ProjectTypeEnum = typeof ProjectType[keyof typeof ProjectType];

export const getProjectTypeEnumName = (displayName: string): string => {
  switch (displayName) {
    case ProjectType.DAY_1:
      return 'DAY_1';
    case ProjectType.DAY_2:
      return 'DAY_2';
    default:
      return displayName;
  }
};

// Release types
export interface Release {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  status: string;
  phases: ReleasePhase[];
  blockers: ReleaseBlocker[];
  createdAt: string;
  updatedAt: string;
}

export interface ReleasePhase {
  id: number;
  releaseId: number;
  phaseType: string;
  phaseTypeDisplayName: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseBlocker {
  id: number;
  releaseId: number;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseRequest {
  name: string;
  identifier: string;
  description?: string;
  status: string;
  phases: ReleasePhaseRequest[];
}

export interface ReleasePhaseRequest {
  name: string;
  startDate: string;
  endDate: string;
}

// Release status and phase enums
export const ReleaseStatus = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled'
} as const;

export const ReleasePhase = {
  FUNCTIONAL_DESIGN: 'Functional Design',
  TECHNICAL_DESIGN: 'Technical Design',
  BUILD: 'Build',
  SIT: 'System Integration Test',
  UAT: 'User Acceptance Test',
  REGRESSION_TESTING: 'Regression Testing',
  DATA_COMPARISON: 'Data Comparison',
  SMOKE_TESTING: 'Smoke Testing',
  PRODUCTION_GO_LIVE: 'Production Go-Live'
} as const;

export const PhaseStatus = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked'
} as const;

export const BlockerSeverity = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
} as const;

export const BlockerStatus = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
} as const;

export type ReleaseStatusEnum = typeof ReleaseStatus[keyof typeof ReleaseStatus];
export type ReleasePhaseEnum = typeof ReleasePhase[keyof typeof ReleasePhase];
export type PhaseStatusEnum = typeof PhaseStatus[keyof typeof PhaseStatus];
export type BlockerSeverityEnum = typeof BlockerSeverity[keyof typeof BlockerSeverity];
export type BlockerStatusEnum = typeof BlockerStatus[keyof typeof BlockerStatus];

// Utility functions
export const getPhaseEnumName = (displayName: string): string => {
  const phaseMap: Record<string, string> = {
    'Functional Design': 'FUNCTIONAL_DESIGN',
    'Technical Design': 'TECHNICAL_DESIGN',
    'Build': 'BUILD',
    'System Integration Test': 'SYSTEM_INTEGRATION_TEST',
    'User Acceptance Test': 'USER_ACCEPTANCE_TEST',
    'Regression Testing': 'REGRESSION_TESTING',
    'Data Comparison': 'DATA_COMPARISON',
    'Smoke Testing': 'SMOKE_TESTING',
    'Production Go-Live': 'PRODUCTION_GO_LIVE'
  };
  return phaseMap[displayName] || displayName;
};

export const getPhaseDisplayName = (enumName: string): string => {
  switch (enumName) {
    case 'FUNCTIONAL_DESIGN':
      return ReleasePhase.FUNCTIONAL_DESIGN;
    case 'TECHNICAL_DESIGN':
      return ReleasePhase.TECHNICAL_DESIGN;
    case 'BUILD':
      return ReleasePhase.BUILD;
    case 'SYSTEM_INTEGRATION_TEST':
      return ReleasePhase.SIT;
    case 'USER_ACCEPTANCE_TEST':
      return ReleasePhase.UAT;
    case 'REGRESSION_TESTING':
      return ReleasePhase.REGRESSION_TESTING;
    case 'DATA_COMPARISON':
      return ReleasePhase.DATA_COMPARISON;
    case 'SMOKE_TESTING':
      return ReleasePhase.SMOKE_TESTING;
    case 'PRODUCTION_GO_LIVE':
      return ReleasePhase.PRODUCTION_GO_LIVE;
    default:
      return enumName;
  }
};

export const getStatusDisplayName = (enumName: string): string => {
  switch (enumName) {
    case 'PLANNING':
      return ReleaseStatus.PLANNING;
    case 'IN_PROGRESS':
      return ReleaseStatus.IN_PROGRESS;
    case 'COMPLETED':
      return ReleaseStatus.COMPLETED;
    case 'ON_HOLD':
      return ReleaseStatus.ON_HOLD;
    case 'CANCELLED':
      return ReleaseStatus.CANCELLED;
    default:
      return enumName;
  }
};

// Status and other common enums
export const Status = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
} as const;

export type StatusEnum = typeof Status[keyof typeof Status];

export const EmployeeGrade = {
  LEVEL_1: 'Level 1',
  LEVEL_2: 'Level 2',
  LEVEL_3: 'Level 3',
  LEVEL_4: 'Level 4',
  LEVEL_5: 'Level 5',
  LEVEL_6: 'Level 6',
  LEVEL_7: 'Level 7',
  LEVEL_8: 'Level 8',
  LEVEL_9: 'Level 9',
  LEVEL_10: 'Level 10',
  LEVEL_11: 'Level 11',
  LEVEL_12: 'Level 12'
} as const;

export type EmployeeGradeEnum = typeof EmployeeGrade[keyof typeof EmployeeGrade];

export const SkillFunction = {
  FUNCTIONAL_DESIGN: 'Functional Design',
  TECHNICAL_DESIGN: 'Technical Design',
  BUILD: 'Build',
  TEST: 'Test',
  PLATFORM: 'Platform',
  GOVERNANCE: 'Governance'
} as const;

export type SkillFunctionEnum = typeof SkillFunction[keyof typeof SkillFunction];

export const SkillSubFunction = {
  ETL: 'ETL',
  TALEND: 'Talend',
  FORGEROCK_IGA: 'ForgeRock IGA',
  FORGEROCK_IDM: 'ForgeRock IDM',
  FORGEROCK_IG: 'ForgeRock IG',
  SAILPOINT: 'SailPoint',
  FORGEROCK_UI: 'ForgeRock UI',
  FUNCTIONAL_TEST: 'Functional Test',
  AUTOMATED: 'Automated',
  MANUAL: 'Manual'
} as const;

export type SkillSubFunctionEnum = typeof SkillSubFunction[keyof typeof SkillSubFunction];

export const EventType = {
  ALLOCATION_CONFLICT: 'Allocation Conflict',
  OVER_ALLOCATION: 'Over Allocation',
  DEADLINE_APPROACHING: 'Deadline Approaching',
  BLOCKER_ADDED: 'Blocker Added',
  BLOCKER_RESOLVED: 'Blocker Resolved'
} as const;

export type EventTypeEnum = typeof EventType[keyof typeof EventType];

// Resource types
export interface Resource {
  id: number;
  name: string;
  employeeNumber: string;
  email: string;
  status: StatusEnum;
  projectStartDate: string;
  projectEndDate?: string;
  employeeGrade: EmployeeGradeEnum;
  skillFunction: SkillFunctionEnum;
  skillSubFunction?: SkillSubFunctionEnum;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceRequest {
  name: string;
  employeeNumber: string;
  email: string;
  status: StatusEnum;
  projectStartDate: string;
  projectEndDate?: string;
  employeeGrade: EmployeeGradeEnum;
  skillFunction: SkillFunctionEnum;
  skillSubFunction?: SkillSubFunctionEnum;
}

export interface ResourceFilters {
  status?: StatusEnum;
  skillFunction?: SkillFunctionEnum;
  skillSubFunction?: SkillSubFunctionEnum;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ResourceImportResponse {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// Notification types
export interface Notification {
  id: number;
  userId?: number;
  eventType: EventTypeEnum;
  entityType?: string;
  entityId?: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  eventType?: EventTypeEnum;
  isRead?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  username: string;
  email: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Utility functions
export const getStatusEnumName = (displayName: string): string => {
  switch (displayName) {
    case Status.ACTIVE:
      return 'ACTIVE';
    case Status.INACTIVE:
      return 'INACTIVE';
    default:
      return displayName;
  }
};

export const getSkillFunctionEnumName = (displayName: string): string => {
  switch (displayName) {
    case SkillFunction.FUNCTIONAL_DESIGN:
      return 'FUNCTIONAL_DESIGN';
    case SkillFunction.TECHNICAL_DESIGN:
      return 'TECHNICAL_DESIGN';
    case SkillFunction.BUILD:
      return 'BUILD';
    case SkillFunction.TEST:
      return 'TEST';
    case SkillFunction.PLATFORM:
      return 'PLATFORM';
    case SkillFunction.GOVERNANCE:
      return 'GOVERNANCE';
    default:
      return displayName;
  }
};

export const getSkillSubFunctionEnumName = (displayName: string): string => {
  switch (displayName) {
    case SkillSubFunction.ETL:
      return 'ETL';
    case SkillSubFunction.TALEND:
      return 'TALEND';
    case SkillSubFunction.FORGEROCK_IGA:
      return 'FORGEROCK_IGA';
    case SkillSubFunction.FORGEROCK_IDM:
      return 'FORGEROCK_IDM';
    case SkillSubFunction.FORGEROCK_IG:
      return 'FORGEROCK_IG';
    case SkillSubFunction.SAILPOINT:
      return 'SAILPOINT';
    case SkillSubFunction.FORGEROCK_UI:
      return 'FORGEROCK_UI';
    case SkillSubFunction.FUNCTIONAL_TEST:
      return 'FUNCTIONAL_TEST';
    case SkillSubFunction.AUTOMATED:
      return 'AUTOMATED';
    case SkillSubFunction.MANUAL:
      return 'MANUAL';
    default:
      return displayName;
  }
};

export const getEventTypeEnumName = (displayName: string): string => {
  switch (displayName) {
    case EventType.ALLOCATION_CONFLICT:
      return 'ALLOCATION_CONFLICT';
    case EventType.OVER_ALLOCATION:
      return 'OVER_ALLOCATION';
    case EventType.DEADLINE_APPROACHING:
      return 'DEADLINE_APPROACHING';
    case EventType.BLOCKER_ADDED:
      return 'BLOCKER_ADDED';
    case EventType.BLOCKER_RESOLVED:
      return 'BLOCKER_RESOLVED';
    default:
      return displayName;
  }
};

export const getApplicableSubFunctions = (skillFunction: SkillFunctionEnum): SkillSubFunctionEnum[] => {
  switch (skillFunction) {
    case SkillFunction.TEST:
      return [SkillSubFunction.AUTOMATED, SkillSubFunction.MANUAL];
    case SkillFunction.FUNCTIONAL_DESIGN:
      return [
        SkillSubFunction.ETL,
        SkillSubFunction.FORGEROCK_IGA,
        SkillSubFunction.FORGEROCK_IG,
        SkillSubFunction.SAILPOINT,
        SkillSubFunction.FORGEROCK_UI,
        SkillSubFunction.FUNCTIONAL_TEST
      ];
    case SkillFunction.TECHNICAL_DESIGN:
    case SkillFunction.BUILD:
      return [
        SkillSubFunction.ETL,
        SkillSubFunction.TALEND,
        SkillSubFunction.FORGEROCK_IGA,
        SkillSubFunction.FORGEROCK_IDM,
        SkillSubFunction.FORGEROCK_IG,
        SkillSubFunction.SAILPOINT,
        SkillSubFunction.FORGEROCK_UI,
        SkillSubFunction.FUNCTIONAL_TEST
      ];
    case SkillFunction.PLATFORM:
    case SkillFunction.GOVERNANCE:
    default:
      return [];
  }
};

// Weekly Allocation Types
export interface WeeklyAllocation {
  weekStart: string; // YYYY-MM-DD (Monday)
  personDays: number;
  projectName?: string;
  projectId?: string;
}

export interface ResourceAllocation {
  id: string;
  name: string;
  grade: string;
  skillFunction: string;
  skillSubFunction?: string;
  profileUrl: string;
  weeklyAllocations: WeeklyAllocation[];
}

export interface WeeklyAllocationMatrix {
  resources: ResourceAllocation[];
  currentWeekStart: string;
  timeWindow: {
    startWeek: string;
    endWeek: string;
    totalWeeks: number;
  };
}

export interface ResourceProfile {
  id: string;
  name: string;
  grade: string;
  skillFunction: string;
  skillSubFunction?: string;
  profileUrl: string;
}

// Utility functions for component badge colors
export const getComponentBadgeColor = (component?: string): string => {
  if (!component) return 'bg-gray-100 text-gray-800';
  
  const colorMap: Record<string, string> = {
    'ETL': 'bg-blue-100 text-blue-800',
    'ForgeRock IGA': 'bg-purple-100 text-purple-800',
    'ForgeRock IG': 'bg-indigo-100 text-indigo-800',
    'ForgeRock UI': 'bg-cyan-100 text-cyan-800',
    'SailPoint': 'bg-green-100 text-green-800',
    'Functional Test': 'bg-orange-100 text-orange-800'
  };
  
  return colorMap[component] || 'bg-gray-100 text-gray-800';
};
