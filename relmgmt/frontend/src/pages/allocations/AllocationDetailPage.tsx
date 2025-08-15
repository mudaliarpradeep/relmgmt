import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allocationService, Allocation } from '../../services/api/v1/allocationService';
import { releaseService } from '../../services/api/v1/releaseService';
import { ReleaseResponse } from '../../services/api/v1/releaseService';

const AllocationDetailPage: React.FC = () => {
  const { releaseId } = useParams<{ releaseId: string }>();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [release, setRelease] = useState<ReleaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (releaseId) {
      loadReleaseAndAllocations();
    }
  }, [releaseId]);

  const loadReleaseAndAllocations = async () => {
    try {
      setLoading(true);
      const [releaseData, allocationsData] = await Promise.all([
        releaseService.getReleaseById(parseInt(releaseId!)),
        allocationService.getAllocationsForRelease(parseInt(releaseId!))
      ]);
      setRelease(releaseData);
      setAllocations(allocationsData);
      setError(null);
    } catch (err) {
      setError('Failed to load release and allocation data');
      console.error('Error loading release and allocations:', err);
    } finally {
      setLoading(false);
    }
  };

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
              Release ID: {release?.identifier} | {allocations.length} allocations
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
              disabled={generating}
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
            </dl>
          </div>
        </div>
      )}

      {/* Allocations Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Resource Allocations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Detailed view of all resource allocations for this release
          </p>
        </div>

        {allocations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No allocations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate allocations to see resource assignments for this release.
            </p>
            <div className="mt-6">
              <button
                onClick={handleGenerateAllocations}
                disabled={generating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Allocations'}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {allocations.map((allocation) => (
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
