import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ScopeService from '../../services/api/v1/scopeService';
import type { ScopeItem, EffortEstimate } from '../../types';

const ScopeItemDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ScopeItem | null>(null);
  const [estimates, setEstimates] = useState<EffortEstimate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ScopeService.getScopeItem(Number(id));
        setItem(data);
        const est = await ScopeService.getEffortEstimates(Number(id));
        setEstimates(est);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load scope item');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onDelete = async () => {
    if (!id) return;
    const canDelete = await ScopeService.canDeleteScopeItem(Number(id));
    if (!canDelete) {
      setError('Cannot delete scope item: it has effort estimates');
      return;
    }
    if (confirm('Delete this scope item?')) {
      await ScopeService.deleteScopeItem(Number(id));
      navigate(`/projects/${item?.projectId}/scope`);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!item) return <div className="p-6">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{item.name}</h1>
            </div>
            <div className="flex gap-2">
              <Link to={`/scope/${item.id}/edit`} className="px-3 py-2 bg-indigo-600 text-white rounded">Edit</Link>
              <button onClick={onDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>

          {item.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{item.description}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Effort Estimates</h2>
              <Link to={`/scope/${item.id}/estimates/new`} className="px-3 py-2 bg-blue-600 text-white rounded">Add Estimate</Link>
            </div>
            <div className="mt-4 bg-white border rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effort (days)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estimates.map((e) => (
                    <tr key={e.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{e.skillFunction}{e.skillSubFunction ? ` / ${e.skillSubFunction}` : ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{e.phase}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{e.effortDays}</td>
                    </tr>
                  ))}
                  {estimates.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-center text-gray-500" colSpan={3}>No estimates yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={`/projects/${item.projectId}/scope`} className="px-4 py-2 border rounded">Back to Scope</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeItemDetailPage;


