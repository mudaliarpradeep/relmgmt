import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource, ResourceRequest } from '../../services/api/sharedTypes';
import { Status, EmployeeGrade, SkillFunction, SkillSubFunction, getApplicableSubFunctions } from '../../services/api/sharedTypes';

interface FormData {
  name: string;
  employeeNumber: string;
  email: string;
  status: string;
  projectStartDate: string;
  projectEndDate: string;
  employeeGrade: string;
  skillFunction: string;
  skillSubFunction: string;
}

interface ValidationErrors {
  name?: string;
  employeeNumber?: string;
  email?: string;
  projectEndDate?: string;
}

const ResourceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    employeeNumber: '',
    email: '',
    status: Status.ACTIVE,
    projectStartDate: '',
    projectEndDate: '',
    employeeGrade: EmployeeGrade.LEVEL_1,
    skillFunction: SkillFunction.FUNCTIONAL_DESIGN,
    skillSubFunction: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load resource data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadResource(parseInt(id));
    }
  }, [isEditMode, id]);

  const loadResource = async (resourceId: number) => {
    try {
      setLoading(true);
      setError(null);
      const resource = await ResourceService.getResource(resourceId);
      
      // Validate skill sub-function against skill function to ensure it's still applicable
      const applicableSubFunctions = getApplicableSubFunctions(resource.skillFunction as any);
      const validSkillSubFunction = resource.skillSubFunction && 
        applicableSubFunctions.includes(resource.skillSubFunction as any) 
        ? resource.skillSubFunction 
        : '';
      
      setFormData({
        name: resource.name,
        employeeNumber: resource.employeeNumber,
        email: resource.email,
        status: resource.status,
        projectStartDate: resource.projectStartDate || '',
        projectEndDate: resource.projectEndDate || '',
        employeeGrade: resource.employeeGrade,
        skillFunction: resource.skillFunction,
        skillSubFunction: validSkillSubFunction
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.employeeNumber.trim()) {
      newErrors.employeeNumber = 'Employee Number is required';
    } else if (!/^\d{8}$/.test(formData.employeeNumber)) {
      newErrors.employeeNumber = 'Employee Number must be 8 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    // Date validation
    if (formData.projectStartDate && formData.projectEndDate) {
      const startDate = new Date(formData.projectStartDate);
      const endDate = new Date(formData.projectEndDate);
      if (endDate <= startDate) {
        newErrors.projectEndDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If skill function changed, reset skill sub-function to first applicable option or empty
      if (field === 'skillFunction') {
        const applicableSubFunctions = getApplicableSubFunctions(value as any);
        newData.skillSubFunction = applicableSubFunctions.length > 0 ? applicableSubFunctions[0] : '';
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const resourceRequest: ResourceRequest = {
        name: formData.name.trim(),
        employeeNumber: formData.employeeNumber.trim(),
        email: formData.email.trim(),
        status: formData.status as any,
        projectStartDate: formData.projectStartDate || undefined,
        projectEndDate: formData.projectEndDate || undefined,
        employeeGrade: formData.employeeGrade as any,
        skillFunction: formData.skillFunction as any,
        skillSubFunction: formData.skillSubFunction && formData.skillSubFunction.trim() !== '' ? formData.skillSubFunction as any : undefined
      };

      if (isEditMode && id) {
        await ResourceService.updateResource(parseInt(id), resourceRequest);
      } else {
        await ResourceService.createResource(resourceRequest);
      }

      navigate('/resources');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/resources');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error && !isEditMode) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <div>Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Resource' : 'Add New Resource'}
            </h1>
            <p className="text-blue-100 mt-1">
              {isEditMode ? 'Update resource information' : 'Create a new resource entry'}
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8" role="form">
          {/* Basic Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name */}
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>}
              </div>

              {/* Employee Number */}
              <div className="flex flex-col">
                <label htmlFor="employeeNumber" className="text-sm font-medium text-gray-700 mb-2">
                  Employee Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                  className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.employeeNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="8-digit number"
                />
                {errors.employeeNumber && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.employeeNumber}
                </p>}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="email@company.com"
                />
                {errors.email && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>}
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                >
                  {Object.values(Status).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Project Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Start Date */}
              <div className="flex flex-col">
                <label htmlFor="projectStartDate" className="text-sm font-medium text-gray-700 mb-2">
                  Project Start Date
                </label>
                <input
                  type="date"
                  id="projectStartDate"
                  value={formData.projectStartDate}
                  onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                />
              </div>

              {/* Project End Date */}
              <div className="flex flex-col">
                <label htmlFor="projectEndDate" className="text-sm font-medium text-gray-700 mb-2">
                  Project End Date
                </label>
                <input
                  type="date"
                  id="projectEndDate"
                  value={formData.projectEndDate}
                  onChange={(e) => handleInputChange('projectEndDate', e.target.value)}
                  className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.projectEndDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.projectEndDate && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.projectEndDate}
                </p>}
              </div>
            </div>
          </div>

          {/* Skills & Grade Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Grade</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Grade */}
              <div className="flex flex-col">
                <label htmlFor="employeeGrade" className="text-sm font-medium text-gray-700 mb-2">
                  Employee Grade
                </label>
                <select
                  id="employeeGrade"
                  value={formData.employeeGrade}
                  onChange={(e) => handleInputChange('employeeGrade', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                >
                  {Object.values(EmployeeGrade).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Skill Function */}
              <div className="flex flex-col">
                <label htmlFor="skillFunction" className="text-sm font-medium text-gray-700 mb-2">
                  Skill Function
                </label>
                <select
                  id="skillFunction"
                  value={formData.skillFunction}
                  onChange={(e) => handleInputChange('skillFunction', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                >
                  {Object.values(SkillFunction).map(func => (
                    <option key={func} value={func}>{func}</option>
                  ))}
                </select>
              </div>

              {/* Skill Sub-function */}
              <div className="flex flex-col">
                <label htmlFor="skillSubFunction" className="text-sm font-medium text-gray-700 mb-2">
                  Skill Sub-function
                  {getApplicableSubFunctions(formData.skillFunction as any).length === 0 && (
                    <span className="text-gray-500 text-xs ml-1">(Not applicable)</span>
                  )}
                </label>
                <select
                  id="skillSubFunction"
                  value={formData.skillSubFunction}
                  onChange={(e) => handleInputChange('skillSubFunction', e.target.value)}
                  disabled={getApplicableSubFunctions(formData.skillFunction as any).length === 0}
                  className={`px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    getApplicableSubFunctions(formData.skillFunction as any).length === 0 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'hover:border-gray-400'
                  }`}
                >
                  {getApplicableSubFunctions(formData.skillFunction as any).length === 0 ? (
                    <option value="">No sub-functions available</option>
                  ) : (
                    getApplicableSubFunctions(formData.skillFunction as any).map(subFunc => (
                      <option key={subFunc} value={subFunc}>{subFunc}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                isEditMode ? 'Update Resource' : 'Create Resource'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ResourceForm; 