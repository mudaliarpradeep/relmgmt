import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ScopeService from '../../services/api/v1/scopeService';
import ProjectService from '../../services/api/v1/projectService';
import type { EnhancedScopeItemRequest, BuildSubSkill, Project } from '../../types';
import { BUILD_SUB_SKILLS } from '../../types';

const EnhancedScopeItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projectIdNum = Number(projectId);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional().or(z.literal('')),
    component: z.enum(BUILD_SUB_SKILLS as readonly [BuildSubSkill, ...BuildSubSkill[]], {
      required_error: 'Component is required'
    }),
    functionalDesignDays: z
      .number({ invalid_type_error: 'Functional design days must be a number' })
      .min(0, 'Functional design days must be non-negative'),
    technicalDesignDays: z
      .number({ invalid_type_error: 'Technical design days must be a number' })
      .min(0, 'Technical design days must be non-negative'),
    buildDays: z
      .number({ invalid_type_error: 'Build days must be a number' })
      .min(0, 'Build days must be non-negative')
  }).refine((data) => 
    data.functionalDesignDays > 0 || data.technicalDesignDays > 0 || data.buildDays > 0,
    {
      message: 'At least one effort estimate must be greater than 0',
      path: ['functionalDesignDays']
    }
  );

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { 
      name: '', 
      description: '', 
      component: BUILD_SUB_SKILLS[0],
      functionalDesignDays: 1,
      technicalDesignDays: 1,
      buildDays: 1
    },
  });

  const totalDays = (watch('functionalDesignDays') || 0) + (watch('technicalDesignDays') || 0) + (watch('buildDays') || 0);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectIdNum) {
        setError('Invalid project ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectData = await ProjectService.getProject(projectIdNum);
        setProject(projectData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [projectIdNum]);

  const onSubmit = async (form: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);

      const enhancedData: EnhancedScopeItemRequest = {
        name: form.name.trim(),
        description: form.description?.trim() || '',
        component: form.component,
        functionalDesignDays: form.functionalDesignDays,
        technicalDesignDays: form.technicalDesignDays,
        buildDays: form.buildDays
      };

      await ScopeService.createEnhancedScopeItem(projectIdNum, enhancedData);
      navigate(`/projects/${projectIdNum}/scope`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create scope item');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    navigate(`/projects/${projectIdNum}/scope`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm breadcrumbs">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li><a href="#" className="hover:text-gray-700">Dashboard</a></li>
            <li className="before:content-['/'] before:mx-2">
              <a href="#" className="hover:text-gray-700">Projects</a>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <span className="text-gray-900">{project?.name || 'Project'}</span>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <a href="#" className="hover:text-gray-700">Scope</a>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <span className="text-gray-900">New Scope Item</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h1 className="text-xl font-bold">New Scope Item with Effort Estimates</h1>
            <p className="text-blue-100 mt-1">
              Create a scope item with component and effort estimates for design and build phases
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                    Scope Item Name
                  </label>
                  <input 
                    id="name" 
                    className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-300' : 'border-gray-300'}`} 
                    placeholder="e.g., User Authentication Module" 
                    {...register('name')} 
                  />
                  {errors.name && <p className="text-sm text-red-700 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="component">
                    Component/Technology
                  </label>
                  <select 
                    id="component" 
                    className={`w-full border rounded px-3 py-2 ${errors.component ? 'border-red-300' : 'border-gray-300'}`}
                    {...register('component')}
                  >
                    {BUILD_SUB_SKILLS.map((skill) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  {errors.component && <p className="text-sm text-red-700 mt-1">{errors.component.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea 
                  id="description" 
                  rows={3}
                  className={`w-full border rounded px-3 py-2 ${errors.description ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="Optional description of the scope item..." 
                  {...register('description')} 
                />
                {errors.description && <p className="text-sm text-red-700 mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Effort Estimates */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Effort Estimates (Person Days)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="functionalDesignDays">
                    Functional Design
                  </label>
                  <input 
                    id="functionalDesignDays" 
                    type="number" 
                    min="0" 
                    step="0.5"
                    className={`w-full border rounded px-3 py-2 ${errors.functionalDesignDays ? 'border-red-300' : 'border-gray-300'}`}
                    {...register('functionalDesignDays', { valueAsNumber: true })} 
                  />
                  {errors.functionalDesignDays && <p className="text-sm text-red-700 mt-1">{errors.functionalDesignDays.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Requirements and functional specifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="technicalDesignDays">
                    Technical Design
                  </label>
                  <input 
                    id="technicalDesignDays" 
                    type="number" 
                    min="0" 
                    step="0.5"
                    className={`w-full border rounded px-3 py-2 ${errors.technicalDesignDays ? 'border-red-300' : 'border-gray-300'}`}
                    {...register('technicalDesignDays', { valueAsNumber: true })} 
                  />
                  {errors.technicalDesignDays && <p className="text-sm text-red-700 mt-1">{errors.technicalDesignDays.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Architecture and technical specifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="buildDays">
                    Build/Development
                  </label>
                  <input 
                    id="buildDays" 
                    type="number" 
                    min="0" 
                    step="0.5"
                    className={`w-full border rounded px-3 py-2 ${errors.buildDays ? 'border-red-300' : 'border-gray-300'}`}
                    {...register('buildDays', { valueAsNumber: true })} 
                  />
                  {errors.buildDays && <p className="text-sm text-red-700 mt-1">{errors.buildDays.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Implementation and coding</p>
                </div>
              </div>

              {/* Total Days Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Effort:</span>
                  <span className="text-lg font-bold text-blue-600">{totalDays.toFixed(1)} person days</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <button 
                type="button" 
                onClick={onCancel} 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button 
                disabled={submitting} 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Scope Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedScopeItemForm;
