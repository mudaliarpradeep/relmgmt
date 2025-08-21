import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProjectService from '../../services/api/v1/projectService';
import ScopeService from '../../services/api/v1/scopeService';
import type { Project, ScopeItem, EnhancedScopeItemRequest, BuildSubSkill } from '../../types';
import { BUILD_SUB_SKILLS } from '../../types';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScopeForm, setShowScopeForm] = useState(false);

  // Scope item form state
  const [scopeForm, setScopeForm] = useState({
    name: '',
    description: '',
    component: BUILD_SUB_SKILLS[0] as BuildSubSkill,
    functionalDesignDays: 1,
    technicalDesignDays: 1,
    buildDays: 1,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [projectData, scopeItemsData] = await Promise.all([
          ProjectService.getProject(Number(id)),
          ScopeService.getAllScopeItems(Number(id))
        ]);
        setProject(projectData);
        setScopeItems(scopeItemsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onDelete = async () => {
    if (!id) return;
    const canDelete = await ProjectService.canDeleteProject(Number(id));
    if (!canDelete) {
      setError('Cannot delete project: it has scope items');
      return;
    }
    if (confirm('Delete this project?')) {
      await ProjectService.deleteProject(Number(id));
      navigate(`/releases/${project?.releaseId}/projects`);
    }
  };

  const handleAddScopeItem = async () => {
    if (!id) return;
    
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
      
      // Refresh scope items
      const updatedScopeItems = await ScopeService.getAllScopeItems(Number(id));
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
      const updatedScopeItems = await ScopeService.getAllScopeItems(Number(id));
      setScopeItems(updatedScopeItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete scope item');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!project) return <div className="p-6">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-gray-600">{project.type}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/projects/${project.id}/edit`} className="px-3 py-2 bg-indigo-600 text-white rounded">Edit</Link>
              <button onClick={onDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>

          {project.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{project.description}</p>
            </div>
          )}

          {/* Scope Items Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Scope Items</h2>
              <button
                onClick={() => setShowScopeForm(!showScopeForm)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {showScopeForm ? 'Cancel' : 'Add Scope Item'}
              </button>
            </div>

            {/* Scope Items List */}
            {scopeItems.length > 0 ? (
              <div className="mb-4">
                <div className="space-y-2">
                  {scopeItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/scope/${item.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteScopeItem(item.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No scope items yet. Add your first scope item to get started.</p>
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
                    onClick={() => setShowScopeForm(false)}
                    className="px-3 py-2 border rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
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

          <div className="flex gap-3 mt-6">
            <Link to={`/projects/${project.id}/scope`} className="px-4 py-2 border rounded">View All Scope Items</Link>
            <Link to={`/releases/${project.releaseId}/projects`} className="px-4 py-2 border rounded">Back to Projects</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;


