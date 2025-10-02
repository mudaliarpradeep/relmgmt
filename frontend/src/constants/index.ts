// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 
            import.meta.env.VITE_API_URL_FALLBACK || 
            'http://localhost:8080/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  RESOURCES: '/resources',
  RELEASES: '/releases',
  PROJECTS: '/projects',
  SCOPE: '/scope',
  ALLOCATION: '/allocation',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
  AUDIT: '/audit',
} as const;

// Employee Grades
export const EMPLOYEE_GRADES = [
  'Level 12',
  'Level 11',
  'Level 10',
  'Level 9',
  'Level 8',
  'Level 7',
  'Level 6',
  'Level 5',
  'Level 4',
  'Level 3',
  'Level 2',
  'Level 1',
] as const;

// Skill Functions
export const SKILL_FUNCTIONS = [
  'Functional Design',
  'Technical Design',
  'Build',
  'Test',
  'Platform',
] as const;

// Skill Sub-functions
export const SKILL_SUB_FUNCTIONS = {
  'Technical Design': ['Talend', 'ForgeRock IDM', 'ForgeRock IG', 'SailPoint', 'ForgeRock UI'],
  'Build': ['Talend', 'ForgeRock IDM', 'ForgeRock IG', 'SailPoint', 'ForgeRock UI'],
  'Test': ['Automated', 'Manual'],
} as const;

// Release Phases
export const RELEASE_PHASES = [
  'Functional Design',
  'Technical Design',
  'Build',
  'System Integration Test (SIT)',
  'User Acceptance Test (UAT)',
  'Smoke Testing',
  'Production Go-Live',
] as const;

// Project Types
export const PROJECT_TYPES = ['Day 1', 'Day 2'] as const;

// Status Options
export const STATUS_OPTIONS = ['Active', 'Inactive'] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const; 