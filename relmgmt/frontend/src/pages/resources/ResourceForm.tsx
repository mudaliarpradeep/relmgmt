import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource, ResourceRequest } from '../../types';
import { Status, EmployeeGrade, SkillFunction, SkillSubFunction } from '../../types';

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
    skillSubFunction: SkillSubFunction.TALEND
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
      setFormData({
        name: resource.name,
        employeeNumber: resource.employeeNumber,
        email: resource.email,
        status: resource.status,
        projectStartDate: resource.projectStartDate || '',
        projectEndDate: resource.projectEndDate || '',
        employeeGrade: resource.employeeGrade,
        skillFunction: resource.skillFunction,
        skillSubFunction: resource.skillSubFunction
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
        skillSubFunction: formData.skillSubFunction as any
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
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Resource' : 'Add New Resource'}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Employee Number */}
          <div>
            <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Employee Number *
            </label>
            <input
              type="text"
              id="employeeNumber"
              value={formData.employeeNumber}
              onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employeeNumber ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.employeeNumber && <p className="mt-1 text-sm text-red-600">{errors.employeeNumber}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(Status).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Project Start Date */}
          <div>
            <label htmlFor="projectStartDate" className="block text-sm font-medium text-gray-700 mb-1">
              Project Start Date
            </label>
            <input
              type="date"
              id="projectStartDate"
              value={formData.projectStartDate}
              onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Project End Date */}
          <div>
            <label htmlFor="projectEndDate" className="block text-sm font-medium text-gray-700 mb-1">
              Project End Date
            </label>
            <input
              type="date"
              id="projectEndDate"
              value={formData.projectEndDate}
              onChange={(e) => handleInputChange('projectEndDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.projectEndDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.projectEndDate && <p className="mt-1 text-sm text-red-600">{errors.projectEndDate}</p>}
          </div>

          {/* Employee Grade */}
          <div>
            <label htmlFor="employeeGrade" className="block text-sm font-medium text-gray-700 mb-1">
              Employee Grade
            </label>
            <select
              id="employeeGrade"
              value={formData.employeeGrade}
              onChange={(e) => handleInputChange('employeeGrade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(EmployeeGrade).map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* Skill Function */}
          <div>
            <label htmlFor="skillFunction" className="block text-sm font-medium text-gray-700 mb-1">
              Skill Function
            </label>
            <select
              id="skillFunction"
              value={formData.skillFunction}
              onChange={(e) => handleInputChange('skillFunction', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(SkillFunction).map(func => (
                <option key={func} value={func}>{func}</option>
              ))}
            </select>
          </div>

          {/* Skill Sub-function */}
          <div>
            <label htmlFor="skillSubFunction" className="block text-sm font-medium text-gray-700 mb-1">
              Skill Sub-function
            </label>
            <select
              id="skillSubFunction"
              value={formData.skillSubFunction}
              onChange={(e) => handleInputChange('skillSubFunction', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(SkillSubFunction).map(subFunc => (
                <option key={subFunc} value={subFunc}>{subFunc}</option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm; 