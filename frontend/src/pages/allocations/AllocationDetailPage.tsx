import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allocationService } from '../../services/api/v1/allocationService';
import type { Allocation } from '../../services/api/v1/allocationService';
import releaseService from '../../services/api/v1/releaseService';
import { ScopeService } from '../../services/api/v1/scopeService';
import type { Release } from '../../services/api/sharedTypes';
import CapacityChart from '../../components/charts/CapacityChart';
import { enumerateWeeks, computeWeeklyAllocationForWeek } from '../../lib/capacity';
import WeeklyAllocationGrid from '../../components/allocation/WeeklyAllocationGrid';
import WeeklyCapacityChart from '../../components/charts/WeeklyCapacityChart';

const AllocationDetailPage: React.FC = () => {
  const { releaseId } = useParams<{ releaseId: string }>();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'max' | 'weekly'>('max');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [canGenerateAllocations, setCanGenerateAllocations] = useState(false);

  useEffect(() => {
    if (releaseId) {
      loadReleaseAndAllocations();
    }
  }, [releaseId, loadReleaseAndAllocations]);

  const loadReleaseAndAllocations = useCallback(async () => {
    try {
      setLoading(true);
      const [releaseData, allocationsData, canGenerate] = await Promise.all([
        releaseService.getRelease(parseInt(releaseId!)),
        allocationService.getAllocationsForRelease(parseInt(releaseId!)),
        ScopeService.canGenerateAllocations(parseInt(releaseId!))
      ]);
      setRelease(releaseData);
      setAllocations(Array.isArray(allocationsData) ? allocationsData : []);
      setCanGenerateAllocations(canGenerate);
      const weeks = enumerateWeeks(Array.isArray(allocationsData) ? allocationsData : []);
      setSelectedWeek(weeks[0] || '');
      setError(null);
    } catch (err) {
      setError('Failed to load release and allocation data');
      console.error('Error loading release and allocations:', err);
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  const handleGenerateAllocations = async () => {
    try {
      setGenerating(true);
      await allocationService.generateAllocation(parseInt(releaseId!));
      await loadReleaseAndAllocations(); // Reload data
      setError(null);
    } catch (err) {
      setError('Failed to generate allocations');
      console.error('Error generating allocations:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getPhaseDisplayName = (phase: string) => {
    const phaseMap: Record<string, string> = {
      'FUNCTIONAL_DESIGN': 'Functional Design',
      'TECHNICAL_DESIGN': 'Technical Design',
      'BUILD': 'Build',
      'SYSTEM_INTEGRATION_TEST': 'System Integration Test',
      'USER_ACCEPTANCE_TEST': 'User Acceptance Test',
      'SMOKE_TESTING': 'Smoke Testing',
      'PRODUCTION_GO_LIVE': 'Production Go-Live'
    };
    return phaseMap[phase] || phase;
  };

  const getPhaseColor = (phase: string) => {
    const colorMap: Record<string, string> = {
      'FUNCTIONAL_DESIGN': 'bg-blue-100 text-blue-800',
      'TECHNICAL_DESIGN': 'bg-purple-100 text-purple-800',
      'BUILD': 'bg-green-100 text-green-800',
      'SYSTEM_INTEGRATION_TEST': 'bg-yellow-100 text-yellow-800',
      'USER_ACCEPTANCE_TEST': 'bg-orange-100 text-orange-800',
      'SMOKE_TESTING': 'bg-red-100 text-red-800',
      'PRODUCTION_GO_LIVE': 'bg-gray-100 text-gray-800'
    };
    return colorMap[phase] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Allocations for {release?.name}
            </h1>
            <p className="mt-2 text-gray-600">
              Release ID: {release?.identifier} | {Array.isArray(allocations) ? allocations.length : 0} allocations
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/allocations"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Allocations
            </Link>
            <button
              onClick={handleGenerateAllocations}
              disabled={generating || !canGenerateAllocations}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Allocations
                </>
              )}
            </button>
            {!canGenerateAllocations && (
              <div className="mt-2 text-sm text-red-600">
                ⚠️ Cannot generate allocations: No scope items with effort estimates found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Release Info */}
      {release && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Release Information</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Release Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{release.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Identifier</dt>
                <dd className="mt-1 text-sm text-gray-900">{release.identifier}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phases</dt>
                <dd className="mt-1 text-sm text-gray-900">{release.phases?.length || 0} phases</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Blockers</dt>
                <dd className="mt-1 text-sm text-gray-900">{release.blockers?.length || 0} blockers</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Scope Items</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link 
                    to={`/releases/${release.id}/scope-items`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View scope items
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Allocation Grid & Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Resource Allocations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Detailed view of all resource allocations for this release
          </p>
        </div>

        {(!Array.isArray(allocations) || allocations.length === 0) ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No allocations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate allocations to see resource assignments for this release.
            </p>
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Allocations require both phases and scope items with effort estimates. 
                    Efforts are automatically calculated from scope items and components.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleGenerateAllocations}
                disabled={generating || !canGenerateAllocations}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Allocations'}
              </button>
              {!canGenerateAllocations && (
                <div className="mt-2 text-sm text-red-600">
                  ⚠️ Cannot generate allocations: No scope items with effort estimates found
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Weekly Allocation Grid */}
            <div className="px-6 pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Weekly Allocation Grid</h3>
              <p className="text-sm text-gray-600 mb-4">
                Resource allocations by week with active release phases overlaid. 
                Each cell shows allocation days for that resource in that week.
              </p>
              <WeeklyAllocationGrid allocations={Array.isArray(allocations) ? allocations : []} />
            </div>

            {/* Weekly Capacity Chart */}
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Weekly Capacity Overview</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Total allocations and peak resource usage across all weeks
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    aria-label="View Mode"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as 'max' | 'weekly')}
                  >
                    <option value="max">Weekly Overview</option>
                    <option value="weekly">Specific Week</option>
                  </select>
                  {viewMode === 'weekly' && (
                    <select
                      aria-label="Week Selector"
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                    >
                      {enumerateWeeks(allocations).map((wk) => (
                        <option key={wk} value={wk}>{wk}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              {viewMode === 'max' ? (
                <WeeklyCapacityChart allocations={Array.isArray(allocations) ? allocations : []} />
              ) : (
                <CapacityChart
                  data={
                    selectedWeek ? computeWeeklyAllocationForWeek(Array.isArray(allocations) ? allocations : [], selectedWeek) : []
                  }
                />
              )}
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation Factor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(allocations) && allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {allocation.resourceName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {allocation.resourceId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPhaseColor(allocation.phase)}`}>
                        {getPhaseDisplayName(allocation.phase)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(allocation.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(allocation.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(allocation.allocationFactor * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allocation.allocationDays.toFixed(1)} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/resources/${allocation.resourceId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Resource
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationDetailPage;
