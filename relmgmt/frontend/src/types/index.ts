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
  createdAt: string;
  updatedAt: string;
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