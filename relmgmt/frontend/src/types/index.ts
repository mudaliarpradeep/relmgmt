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

// Resource types
export interface Resource {
  id: number;
  name: string;
  employeeNumber: string;
  email: string;
  status: 'Active' | 'Inactive';
  projectStartDate: string;
  projectEndDate: string;
  employeeGrade: string;
  skillFunction: string;
  skillSubFunction: string;
  createdAt: string;
  updatedAt: string;
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

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'date' | 'number';
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: Record<string, unknown>;
} 