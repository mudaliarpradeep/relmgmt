import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReleaseService from '../../services/api/v1/releaseService';
import ScopeService from '../../services/api/v1/scopeService';
import type { Release, ScopeItemWithComponents } from '../../services/api/sharedTypes';
import { ReleaseStatus, PhaseStatus, BlockerSeverity, BlockerStatus } from '../../services/api/sharedTypes';
import { EffortSummaryTable } from '../../components/scope/EffortSummaryTable';

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

const ReleaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [scopeItems, setScopeItems] = useState<ScopeItemWithComponents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRelease(parseInt(id));
    }
  }, [id]);

  const loadRelease = async (releaseId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch release data and scope items in parallel
      const [releaseData, scopeItemsData] = await Promise.all([
        ReleaseService.getRelease(releaseId),
        ScopeService.getScopeItemsWithComponents(releaseId)
      ]);

      setRelease(releaseData || null);
      setScopeItems(scopeItemsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load release data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case ReleaseStatus.PLANNING:
        return 'bg-blue-100 text-blue-800';
      case ReleaseStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800';
      case ReleaseStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case ReleaseStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case ReleaseStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case PhaseStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800';
      case PhaseStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case PhaseStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PhaseStatus.BLOCKED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBlockerSeverityColor = (severity: string) => {
    switch (severity) {
      case BlockerSeverity.LOW:
        return 'bg-green-100 text-green-800';
      case BlockerSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case BlockerSeverity.HIGH:
        return 'bg-orange-100 text-orange-800';
      case BlockerSeverity.CRITICAL:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBlockerStatusColor = (status: string) => {
    switch (status) {
      case BlockerStatus.OPEN:
        return 'bg-red-100 text-red-800';
      case BlockerStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case BlockerStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case BlockerStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Unused function - commented out to fix ESLint
  // const getPrimaryComponent = (item: ScopeItemWithComponents): string => {
  //   if (item.components.length === 0) return 'No components';
  //   const firstComponent = item.components[0];
  //   if (!firstComponent || !firstComponent.componentType) {
  //     return 'Unknown Type';
  //   }
  //   const componentTypeValue = firstComponent.componentType;
  //   const componentTypeKey = Object.keys(ComponentType).find(
  //     key => ComponentType[key as keyof typeof ComponentType] === componentTypeValue
  //   );
  //   if (componentTypeKey) {
  //     return componentTypeKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  //   }
  //   return componentTypeValue;
  // };

  const calculateTotalEffort = (item: ScopeItemWithComponents): number => {
    const scopeItemEffort = item.functionalDesignDays + item.sitDays + item.uatDays;
    const componentEffort = item.components.reduce((total, component) => {
      return total + component.technicalDesignDays + component.buildDays;
    }, 0);
    return scopeItemEffort + componentEffort;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading release...</div>
        </div>
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <div>Error</div>
            <div>{error || 'Release not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/releases"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Releases
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mt-4">{release.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{release.identifier}</p>
              {release.description && (
                <p className="text-gray-600 mt-2">{release.description}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/releases/${release.id}/projects`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                View Projects
              </Link>
              <Link
                to={`/releases/${release.id}/allocations`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                View Allocations
              </Link>
              <Link
                to={`/releases/${release.id}/edit`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Edit Release
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Release Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Release Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(release.status)}`}>
                      {release.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDateTime(release.createdAt)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDateTime(release.updatedAt)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Phases</label>
                  <div className="mt-1 text-sm text-gray-900">{release.phases?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Phases */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Release Phases</h2>
                <span className="text-sm text-gray-500">{release.phases?.length || 0} phases</span>
              </div>
              
              {release.phases && release.phases.length > 0 ? (
                <div className="space-y-4">
                  {release.phases.map((phase, index) => (
                    <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Phase {index + 1}: {phase.phaseTypeDisplayName}</h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPhaseStatusColor(phase.status)}`}>
                          {phase.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Start Date</label>
                          <div className="mt-1 text-sm text-gray-900">{formatDate(phase.startDate)}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">End Date</label>
                          <div className="mt-1 text-sm text-gray-900">{formatDate(phase.endDate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No phases defined for this release.</p>
                </div>
              )}
            </div>

            {/* Scope Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Scope Items</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{(scopeItems || []).length} scope item{(scopeItems || []).length !== 1 ? 's' : ''}</span>
                  <Link
                    to={`/releases/${release.id}/scope-items`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View All
                  </Link>
                </div>
              </div>

              {(scopeItems || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">No Scope Items</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Get started by adding your first scope item for this release.
                  </p>
                  <Link
                    to={`/releases/${release.id}/scope-items/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Scope Item
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {(scopeItems || []).slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      to={`/scope-items/${item.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {item.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.components.map((component) => (
                            <span 
                              key={component.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {getComponentTypeLabel(component.componentType)}
                            </span>
                          ))}
                          {item.components.length === 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No components
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {calculateTotalEffort(item)} PD
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {(scopeItems || []).length > 3 && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <Link
                        to={`/releases/${release.id}/scope-items`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View all {(scopeItems || []).length} scope items →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Blockers */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Release Blockers</h2>
                <span className="text-sm text-gray-500">{release.blockers?.length || 0} blockers</span>
              </div>
              
              {release.blockers && release.blockers.length > 0 ? (
                <div className="space-y-4">
                  {release.blockers.map((blocker) => (
                    <div key={blocker.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBlockerSeverityColor(blocker.severity)}`}>
                            {blocker.severity}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBlockerStatusColor(blocker.status)}`}>
                            {blocker.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(blocker.createdAt)}</div>
                      </div>
                      <p className="text-gray-900">{blocker.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No blockers for this release.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/releases/${release.id}/edit`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-center block"
                >
                  Edit Release
                </Link>
                <Link
                  to={`/releases/${release.id}/phases`}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-center block"
                >
                  Manage Phases
                </Link>
                <Link
                  to={`/releases/${release.id}/blockers`}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-center block"
                >
                  Manage Blockers
                </Link>
              </div>
            </div>

            {/* Release Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Phases</span>
                  <span className="text-sm font-medium text-gray-900">{release.phases?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Active Blockers</span>
                  <span className="text-sm font-medium text-gray-900">
                    {release.blockers?.filter(b => b.status === BlockerStatus.OPEN || b.status === BlockerStatus.IN_PROGRESS).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completed Phases</span>
                  <span className="text-sm font-medium text-gray-900">
                    {release.phases?.filter(p => p.status === PhaseStatus.COMPLETED).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Days Since Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.floor((new Date().getTime() - new Date(release.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Effort Summary Table */}
        <EffortSummaryTable releaseId={parseInt(id!)} />
      </div>
    </div>
  );
};

export default ReleaseDetailPage; 