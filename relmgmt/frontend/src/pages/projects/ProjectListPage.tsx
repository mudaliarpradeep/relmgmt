import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProjectService from '../../services/api/v1/projectService';
import type { Project } from '../../types';

const ProjectListPage: React.FC = () => {
  const { id: releaseIdParam } = useParams();
  const releaseId = Number(releaseIdParam);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(releaseId)) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProjectService.getAllProjects(releaseId);
        setProjects(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    })();
  }, [releaseId]);

  if (!Number.isFinite(releaseId)) {
    return <div className="p-6">Invalid release id</div>;
  }

  if (loading) {
    return <div className="p-6">Loading projects...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-gray-600">Projects for release #{releaseId}</p>
          </div>
          <Link
            to={`/releases/${releaseId}/projects/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Project
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">{error}</div>
        )}

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      <Link to={`/projects/${p.id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                      <Link to={`/projects/${p.id}/edit`} className="text-indigo-600 hover:text-indigo-800">Edit</Link>
                      <Link to={`/projects/${p.id}/scope`} className="text-emerald-600 hover:text-emerald-800">Scope</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={3}>No projects found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectListPage;


