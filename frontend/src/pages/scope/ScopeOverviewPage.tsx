import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReleaseService from '../../services/api/v1/releaseService';
import ProjectService from '../../services/api/v1/projectService';
import ScopeService from '../../services/api/v1/scopeService';
import type { Release, Project, ScopeItem } from '../../types';

const ScopeOverviewPage: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [scopeItems, setScopeItems] = useState<Record<number, ScopeItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all releases (get first 100 releases)
        const releasesResponse = await ReleaseService.getReleases(0, 100);
        const releasesData = releasesResponse.content;
        setReleases(releasesData);
        
        // Load all projects from all releases
        const allProjects: Project[] = [];
        for (const release of releasesData) {
          try {
            const releaseProjects = await ProjectService.getAllProjects(release.id);
            allProjects.push(...releaseProjects);
          } catch (e) {
            console.warn(`Failed to load projects for release ${release.id}:`, e);
          }
        }
        setProjects(allProjects);
        
        // Load scope items for each project
        const scopeItemsMap: Record<number, ScopeItem[]> = {};
        for (const project of allProjects) {
          try {
            const items = await ScopeService.getAllScopeItems(project.id);
            scopeItemsMap[project.id] = items;
          } catch (e) {
            console.warn(`Failed to load scope items for project ${project.id}:`, e);
            scopeItemsMap[project.id] = [];
          }
        }
        setScopeItems(scopeItemsMap);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load scope overview');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scope overview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading scope overview</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalScopeItems = Object.values(scopeItems).reduce((sum, items) => sum + items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scope Management</h1>
          <p className="mt-2 text-gray-600">
            Overview of all projects and their scope items
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🚀</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Releases</dt>
                    <dd className="text-lg font-medium text-gray-900">{releases.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                    <dd className="text-lg font-medium text-gray-900">{projects.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📝</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Scope Items</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalScopeItems}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Items per Project</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {projects.length > 0 ? (totalScopeItems / projects.length).toFixed(1) : '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Projects and Scope Items</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Click on a project to view its scope items in detail
            </p>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">Create a project to start managing scope items</p>
              <Link
                to="/releases"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Releases
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map((project) => {
                const projectScopeItems = scopeItems[project.id] || [];
                const release = releases.find(r => r.id === project.releaseId);
                return (
                  <li key={project.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {project.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {project.name}
                              </p>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {projectScopeItems.length} items
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-500">
                                {project.description || 'No description'}
                              </p>
                              {release && (
                                <span className="text-xs text-gray-400">
                                  • Release: {release.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/projects/${project.id}/scope`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Scope
                          </Link>
                          <Link
                            to={`/projects/${project.id}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Project
                          </Link>
                        </div>
                      </div>
                      
                      {/* Scope Items Preview */}
                      {projectScopeItems.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Scope Items:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {projectScopeItems.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="bg-gray-50 rounded-md px-3 py-2 text-sm"
                              >
                                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-gray-500 truncate">{item.description}</p>
                              </div>
                            ))}
                            {projectScopeItems.length > 3 && (
                              <div className="bg-gray-50 rounded-md px-3 py-2 text-sm flex items-center justify-center">
                                <span className="text-gray-500">
                                  +{projectScopeItems.length - 3} more items
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeOverviewPage;
