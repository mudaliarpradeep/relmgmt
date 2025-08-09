import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProjectService from '../../services/api/v1/projectService';
import type { Project } from '../../types';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProjectService.getProject(Number(id));
        setProject(data);
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

          <div className="flex gap-3">
            <Link to={`/projects/${project.id}/scope`} className="px-4 py-2 border rounded">View Scope Items</Link>
            <Link to={`/releases/${project.releaseId}/projects`} className="px-4 py-2 border rounded">Back to Projects</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;


