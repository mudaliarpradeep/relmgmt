import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ScopeService from '../../services/api/v1/scopeService';
import type { ScopeItem } from '../../types';

const ScopeListPage: React.FC = () => {
  const { id: projectIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const [items, setItems] = useState<ScopeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(projectId)) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ScopeService.getAllScopeItems(projectId);
        setItems(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load scope items');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  if (!Number.isFinite(projectId)) {
    return <div className="p-6">Invalid project id</div>;
  }

  if (loading) {
    return <div className="p-6">Loading scope items...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scope Items</h1>
            <p className="text-gray-600">For project #{projectId}</p>
          </div>
          <Link
            to={`/projects/${projectId}/scope/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Scope Item
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      <Link to={`/scope/${s.id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                      <Link to={`/scope/${s.id}/edit`} className="text-indigo-600 hover:text-indigo-800">Edit</Link>
                      <Link to={`/scope/${s.id}/estimates`} className="text-emerald-600 hover:text-emerald-800">Estimates</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={2}>No scope items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScopeListPage;


