import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ScopeService from '../../services/api/v1/scopeService';
import type { ScopeItemWithComponents, ComponentTypeEnum } from '../../services/api/sharedTypes';

// Helper function to convert enum to display label
const getComponentTypeLabel = (componentType: ComponentTypeEnum): string => {
  const labels: Record<ComponentTypeEnum, string> = {
    ETL: 'ETL',
    FORGEROCK_IGA: 'ForgeRock IGA',
    FORGEROCK_UI: 'ForgeRock UI',
    FORGEROCK_IG: 'ForgeRock IG',
    FORGEROCK_IDM: 'ForgeRock IDM',
    SAILPOINT: 'SailPoint',
    FUNCTIONAL_TEST: 'Functional Test'
  };
  return labels[componentType] || componentType;
};

const ScopeItemDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ScopeItemWithComponents | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ScopeService.getScopeItemWithComponents(Number(id));
        setItem(data);
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
      setError('Cannot delete scope item: it has components');
      return;
    }
    if (confirm('Delete this scope item?')) {
      await ScopeService.deleteScopeItem(Number(id));
      navigate(`/releases/${item?.releaseId}/scope-items`);
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

          {/* Scope Item Level Estimates */}
          <div className="mb-6">
            <h2 className="font-semibold mb-4">Scope Item Level Estimates</h2>
            <div className="bg-white border rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">Functional Design</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.functionalDesignDays} PD</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">SIT</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.sitDays} PD</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">UAT</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.uatDays} PD</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-bold">Total Scope Item Level</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{item.functionalDesignDays + item.sitDays + item.uatDays} PD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Components</h2>
              <Link to={`/scope-items/${item.id}/edit`} className="px-3 py-2 bg-blue-600 text-white rounded">Add Component</Link>
            </div>
            <div className="mt-4 bg-white border rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technical Design (days)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Build (days)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Effort</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {item.components.map((component) => (
                    <tr key={component.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{component.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getComponentTypeLabel(component.componentType)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{component.technicalDesignDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{component.buildDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{component.technicalDesignDays + component.buildDays} PD</td>
                    </tr>
                  ))}
                  {item.components.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>No components yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Effort Summary */}
          <div className="mb-6">
            <h2 className="font-semibold mb-4">Effort Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Scope Item Level:</span>
                  <span className="ml-2 font-medium">{item.functionalDesignDays + item.sitDays + item.uatDays} PD</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Component Level:</span>
                  <span className="ml-2 font-medium">
                    {item.components.reduce((total, comp) => total + comp.technicalDesignDays + comp.buildDays, 0)} PD
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">Total Effort:</span>
                  <span className="ml-2 font-bold text-lg">
                    {(item.functionalDesignDays + item.sitDays + item.uatDays) +
                     item.components.reduce((total, comp) => total + comp.technicalDesignDays + comp.buildDays, 0)} PD
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={`/releases/${item.releaseId}/scope-items`} className="px-4 py-2 border rounded">Back to Scope Items</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeItemDetailPage;


