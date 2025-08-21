import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ProjectService from '../../services/api/v1/projectService';
import ScopeService from '../../services/api/v1/scopeService';
import type { ProjectRequest, EnhancedScopeItemRequest, ScopeItem, ScopeItemWithEffort, BuildSubSkill, EffortEstimate } from '../../types';
import { ProjectType, BUILD_SUB_SKILLS, SkillFunction } from '../../types';

const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { id, releaseId } = useParams();
  const isEdit = Boolean(id) && !releaseId; // edit uses /projects/:id/edit, create uses /releases/:releaseId/projects/new

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scopeItems, setScopeItems] = useState<ScopeItemWithEffort[]>([]);
  const [showScopeForm, setShowScopeForm] = useState(false);

  const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Project name must not exceed 100 characters'),
    description: z.string().max(500, 'Project description must not exceed 500 characters').optional().or(z.literal('')),
    type: z.enum([ProjectType.DAY_1, ProjectType.DAY_2], { errorMap: () => ({ message: 'Type is required' }) }),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', type: ProjectType.DAY_1 },
  });

  // Scope item form state
  const [scopeForm, setScopeForm] = useState({
    name: '',
    description: '',
    component: BUILD_SUB_SKILLS[0] as BuildSubSkill,
    functionalDesignDays: 1,
    technicalDesignDays: 1,
    buildDays: 1,
  });

  // Function to format effort information for display
  const formatEffortInfo = (item: ScopeItemWithEffort): string => {
    const totalEffort = item.effortEstimates.reduce((sum, estimate) => sum + estimate.effortDays, 0);
    const componentName = item.component || 'N/A';
    const description = item.description || 'All features in scope';
    
    return `${componentName}: ${description}. Effort: ${totalEffort} person-days`;
  };

  // Function to fetch effort estimates for each scope item
  const fetchScopeItemsWithEffort = async (projectId: number): Promise<ScopeItemWithEffort[]> => {
    const scopeItemsData = await ScopeService.getAllScopeItems(projectId);
    
    // Fetch effort estimates for each scope item
    const scopeItemsWithEffort = await Promise.all(
      scopeItemsData.map(async (item) => {
        try {
          const effortEstimates = await ScopeService.getEffortEstimates(item.id);
          
          // Determine the main component from effort estimates
          let component: string | undefined;
          const buildEstimates = effortEstimates.filter(e => 
            e.skillFunction === SkillFunction.BUILD || e.skillFunction === SkillFunction.TECHNICAL_DESIGN
          );
          if (buildEstimates.length > 0) {
            component = buildEstimates[0].skillSubFunction;
          }
          
          return {
            ...item,
            effortEstimates,
            component
          };
        } catch (error) {
          // If effort estimates can't be fetched, return item without them
          return {
            ...item,
            effortEstimates: [],
            component: undefined
          };
        }
      })
    );
    
    return scopeItemsWithEffort;
  };

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const [project, scopeItemsWithEffort] = await Promise.all([
            ProjectService.getProject(Number(id)),
            fetchScopeItemsWithEffort(Number(id))
          ]);
          setValue('name', project.name);
          setValue('description', project.description || '');
          setValue('type', project.type);
          setScopeItems(scopeItemsWithEffort);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load project');
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [isEdit, id]);

  const onSubmit = async (form: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      if (isEdit && id) {
        await ProjectService.updateProject(Number(id), {
          name: form.name.trim(),
          description: form.description?.trim() || '',
          type: form.type,
        });
        navigate(`/projects/${id}`);
      } else if (releaseId) {
        await ProjectService.createProject(Number(releaseId), {
          name: form.name.trim(),
          description: form.description?.trim() || '',
          type: form.type,
        });
        navigate(`/releases/${releaseId}/projects`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    if (isEdit && id) navigate(`/projects/${id}`);
    else if (releaseId) navigate(`/releases/${releaseId}/projects`);
    else navigate('/releases');
  };

  const handleAddScopeItem = async () => {
    if (!isEdit || !id) return;
    
    try {
      const enhancedData: EnhancedScopeItemRequest = {
        name: scopeForm.name.trim(),
        description: scopeForm.description?.trim() || '',
        component: scopeForm.component,
        functionalDesignDays: scopeForm.functionalDesignDays,
        technicalDesignDays: scopeForm.technicalDesignDays,
        buildDays: scopeForm.buildDays
      };

      await ScopeService.createEnhancedScopeItem(Number(id), enhancedData);
      
      // Refresh scope items with effort estimates
      const updatedScopeItems = await fetchScopeItemsWithEffort(Number(id));
      setScopeItems(updatedScopeItems);
      
      // Reset form
      setScopeForm({
        name: '',
        description: '',
        component: BUILD_SUB_SKILLS[0] as BuildSubSkill,
        functionalDesignDays: 1,
        technicalDesignDays: 1,
        buildDays: 1,
      });
      setShowScopeForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add scope item');
    }
  };

  const handleDeleteScopeItem = async (scopeItemId: number) => {
    if (!confirm('Delete this scope item?')) return;
    
    try {
      await ScopeService.deleteScopeItem(scopeItemId);
      const updatedScopeItems = await fetchScopeItemsWithEffort(Number(id));
      setScopeItems(updatedScopeItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete scope item');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h1 className="text-xl font-bold">{isEdit ? 'Edit Project' : 'New Project'}</h1>
          </div>
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">Name</label>
              <input id="name" className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-300' : ''}`} placeholder="Project name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-700 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">Description</label>
              <textarea id="description" className={`w-full border rounded px-3 py-2 ${errors.description ? 'border-red-300' : ''}`} placeholder="Optional description" {...register('description')} />
              {errors.description && <p className="text-sm text-red-700 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">Type</label>
              <select id="type" className={`w-full border rounded px-3 py-2 ${errors.type ? 'border-red-300' : ''}`} {...register('type')}>
                {Object.values(ProjectType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.type && <p className="text-sm text-red-700 mt-1">{errors.type.message}</p>}
            </div>

            {/* Scope Items Section - Only show in edit mode */}
            {isEdit && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Scope Items</h2>
                  <button
                    type="button"
                    onClick={() => setShowScopeForm(!showScopeForm)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    {showScopeForm ? 'Cancel' : 'Add Scope Item'}
                  </button>
                </div>

                {/* Scope Items List */}
                {scopeItems.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Scope Items:</h3>
                    <div className="space-y-2">
                      {scopeItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {formatEffortInfo(item)}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link
                              to={`/scope/${item.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteScopeItem(item.id)}
                              className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Scope Item Form */}
                {showScopeForm && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Add New Scope Item</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scope Item Name</label>
                        <input
                          type="text"
                          value={scopeForm.name}
                          onChange={(e) => setScopeForm({ ...scopeForm, name: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                          placeholder="e.g., User Authentication Module"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Component/Technology</label>
                        <select
                          value={scopeForm.component}
                          onChange={(e) => setScopeForm({ ...scopeForm, component: e.target.value as BuildSubSkill })}
                          className="w-full border rounded px-3 py-2"
                        >
                          {BUILD_SUB_SKILLS.map((skill) => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={scopeForm.description}
                        onChange={(e) => setScopeForm({ ...scopeForm, description: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={2}
                        placeholder="Optional description..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Functional Design (days)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={scopeForm.functionalDesignDays}
                          onChange={(e) => setScopeForm({ ...scopeForm, functionalDesignDays: Number(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Technical Design (days)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={scopeForm.technicalDesignDays}
                          onChange={(e) => setScopeForm({ ...scopeForm, technicalDesignDays: Number(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Build (days)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={scopeForm.buildDays}
                          onChange={(e) => setScopeForm({ ...scopeForm, buildDays: Number(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowScopeForm(false)}
                        className="px-3 py-2 border rounded text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddScopeItem}
                        disabled={!scopeForm.name.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Add Scope Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t pt-6">
              <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;


