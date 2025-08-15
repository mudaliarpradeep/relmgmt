import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { allocationService } from '../../services/api/v1/allocationService';
import type { AllocationConflictResponse } from '../../services/api/v1/allocationService';
import StatCard from '../../components/ui/StatCard';
import ConflictsChart from '../../components/charts/ConflictsChart';

const AllocationListPage: React.FC = () => {
  const [conflicts, setConflicts] = useState<AllocationConflictResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllocationConflicts();
  }, []);

  const loadAllocationConflicts = async () => {
    try {
      setLoading(true);
      const data = await allocationService.getAllocationConflicts();
      setConflicts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load allocation conflicts');
      console.error('Error loading allocation conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConflictSeverity = (overAllocation: number) => {
    if (overAllocation > 2.0) return 'text-red-600 font-semibold';
    if (overAllocation > 1.0) return 'text-orange-600 font-semibold';
    return 'text-yellow-600 font-semibold';
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Allocation Management</h1>
        <p className="mt-2 text-gray-600">
          View and manage resource allocations across releases
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Conflicts"
          value={conflicts.length.toString()}
          color="red"
          onClick={() => {}}
        />
        <StatCard
          title="Active Releases"
          value="View All"
          color="blue"
          onClick={() => window.location.href = '/releases'}
        />
        <StatCard
          title="Resource Management"
          value="View All"
          color="green"
          onClick={() => window.location.href = '/resources'}
        />
      </div>

      {/* Allocation Conflicts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Allocation Conflicts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Resources with allocation conflicts that exceed the standard 4.5 days/week limit
          </p>
        </div>

        {conflicts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No conflicts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              All resources are properly allocated within capacity limits.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="px-6 pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Over-Allocation by Resource</h3>
              <ConflictsChart conflicts={conflicts} />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Week Starting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Allocation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Allocation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Over Allocation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conflicts.map((conflict) =>
                  conflict.weeklyConflicts.map((weeklyConflict, index) => (
                    <tr key={`${conflict.resourceId}-${weeklyConflict.weekStarting}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {conflict.resourceName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {conflict.resourceId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(weeklyConflict.weekStarting).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {weeklyConflict.totalAllocation.toFixed(1)} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {weeklyConflict.maxAllocation.toFixed(1)} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getConflictSeverity(weeklyConflict.overAllocation)}`}>
                          +{weeklyConflict.overAllocation.toFixed(1)} days
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/resources/${conflict.resourceId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Resource
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/releases"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Manage Releases</h3>
                <p className="text-sm text-gray-500">View and manage release allocations</p>
              </div>
            </Link>
            <Link
              to="/resources"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Manage Resources</h3>
                <p className="text-sm text-gray-500">View and manage resource allocations</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationListPage;
