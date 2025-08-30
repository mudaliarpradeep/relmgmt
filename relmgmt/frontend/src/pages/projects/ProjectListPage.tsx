import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProjectService from '../../services/api/v1/projectService';
import ReleaseService from '../../services/api/v1/releaseService';
import type { Project, Release } from '../../services/api/sharedTypes';

const ProjectListPage: React.FC = () => {
  const { id: releaseIdParam } = useParams();
  const releaseId = Number(releaseIdParam);
  const [projects, setProjects] = useState<Project[]>([]);
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(releaseId)) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load release details and projects in parallel
        const [releaseData, projectsData] = await Promise.all([
          ReleaseService.getRelease(releaseId),
          ProjectService.getAllProjects(releaseId)
        ]);
        
        setRelease(releaseData);
        setProjects(projectsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
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
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm breadcrumbs">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link to="/releases" className="hover:text-blue-600">Releases</Link>
            </li>
            <li className="flex items-center">
              <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to={`/releases/${releaseId}`} className="hover:text-blue-600">
                {release ? release.name : `Release #${releaseId}`}
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">Projects</span>
            </li>
          </ol>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-gray-600">
              {release ? `Projects for release "${release.name}" (${release.identifier})` : `Projects for release #${releaseId}`}
            </p>
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


