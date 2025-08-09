// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Status constants
export const Status = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
} as const;

export type StatusEnum = typeof Status[keyof typeof Status];

// Employee Grade constants
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

// Skill Function constants
export const SkillFunction = {
  FUNCTIONAL_DESIGN: 'Functional Design',
  TECHNICAL_DESIGN: 'Technical Design',
  BUILD: 'Build',
  TEST: 'Test',
  PLATFORM: 'Platform',
  GOVERNANCE: 'Governance'
} as const;

export type SkillFunctionEnum = typeof SkillFunction[keyof typeof SkillFunction];

// Skill Sub-function constants
export const SkillSubFunction = {
  TALEND: 'Talend',
  FORGEROCK_IDM: 'ForgeRock IDM',
  FORGEROCK_IG: 'ForgeRock IG',
  SAILPOINT: 'SailPoint',
  FORGEROCK_UI: 'ForgeRock UI',
  AUTOMATED: 'Automated',
  MANUAL: 'Manual'
} as const;

export type SkillSubFunctionEnum = typeof SkillSubFunction[keyof typeof SkillSubFunction];

// Utility function to get applicable sub-functions based on skill function
export const getApplicableSubFunctions = (skillFunction: SkillFunctionEnum): SkillSubFunctionEnum[] => {
  switch (skillFunction) {
    case SkillFunction.TEST:
      return [SkillSubFunction.AUTOMATED, SkillSubFunction.MANUAL];
    case SkillFunction.TECHNICAL_DESIGN:
    case SkillFunction.BUILD:
      return [
        SkillSubFunction.TALEND,
        SkillSubFunction.FORGEROCK_IDM,
        SkillSubFunction.FORGEROCK_IG,
        SkillSubFunction.SAILPOINT,
        SkillSubFunction.FORGEROCK_UI
      ];
    case SkillFunction.FUNCTIONAL_DESIGN:
    case SkillFunction.PLATFORM:
    case SkillFunction.GOVERNANCE:
    default:
      return [];
  }
};

// Utility functions to convert between display names and enum names for API calls
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
  page?: number;
  size?: number;
  sort?: string;
}

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

export interface ResourceImportResponse {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// Release types
export interface Release {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  status: ReleaseStatusEnum;
  phases: ReleasePhase[];
  blockers: ReleaseBlocker[];
  createdAt: string;
  updatedAt: string;
}

export interface ReleasePhase {
  id: number;
  releaseId: number;
  name: ReleasePhaseEnum;
  startDate: string;
  endDate: string;
  status: PhaseStatusEnum;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseBlocker {
  id: number;
  releaseId: number;
  description: string;
  severity: BlockerSeverityEnum;
  status: BlockerStatusEnum;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseRequest {
  name: string;
  identifier: string;
  description?: string;
  status: ReleaseStatusEnum;
  phases: ReleasePhaseRequest[];
}

export interface ReleasePhaseRequest {
  name: ReleasePhaseEnum;
  startDate: string;
  endDate: string;
}

// Release enums
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

// Scope types
export interface ScopeItem {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeItemRequest {
  name: string;
  description?: string;
}

export interface EffortEstimate {
  id: number;
  scopeItemId: number;
  skillFunction: SkillFunctionEnum;
  skillSubFunction?: SkillSubFunctionEnum;
  phase: ReleasePhaseEnum;
  effortDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface EffortEstimateRequest {
  skillFunction: SkillFunctionEnum;
  skillSubFunction?: SkillSubFunctionEnum;
  phase: ReleasePhaseEnum;
  effortDays: number;
}

export const getPhaseEnumName = (displayName: string): string => {
  switch (displayName) {
    case ReleasePhase.FUNCTIONAL_DESIGN:
      return 'FUNCTIONAL_DESIGN';
    case ReleasePhase.TECHNICAL_DESIGN:
      return 'TECHNICAL_DESIGN';
    case ReleasePhase.BUILD:
      return 'BUILD';
    case ReleasePhase.SIT:
      return 'SIT';
    case ReleasePhase.UAT:
      return 'UAT';
    case ReleasePhase.SMOKE_TESTING:
      return 'SMOKE_TESTING';
    case ReleasePhase.PRODUCTION_GO_LIVE:
      return 'PRODUCTION_GO_LIVE';
    default:
      return displayName;
  }
};

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

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'date' | 'number';
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: Record<string, unknown>;
} 