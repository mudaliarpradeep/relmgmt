import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ScopeService from '../../services/api/v1/scopeService';
import ReleaseService from '../../services/api/v1/releaseService';
import type { Release, ScopeItemWithComponents } from '../../services/api/sharedTypes';
// import { ComponentType } from '../../services/api/sharedTypes';
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

const ScopeListPage: React.FC = () => {
  const { releaseId: releaseIdParam } = useParams();
  const releaseId = Number(releaseIdParam);
  const [items, setItems] = useState<ScopeItemWithComponents[]>([]);
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(releaseId)) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load release details and scope items with components in parallel
        const [releaseData, scopeItemsData] = await Promise.all([
          ReleaseService.getRelease(releaseId),
          ScopeService.getScopeItemsWithComponents(releaseId)
        ]);
        
        setRelease(releaseData);
        setItems(scopeItemsData);
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calculateTotalEffort = (item: ScopeItemWithComponents): number => {
    const scopeItemEffort = item.functionalDesignDays + item.sitDays + item.uatDays;
    const componentEffort = item.components.reduce((total, component) => {
      return total + component.technicalDesignDays + component.buildDays;
    }, 0);
    return scopeItemEffort + componentEffort;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm breadcrumbs">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link to="/releases" className="hover:text-blue-600">Releases</Link>
            </li>
            {release && (
              <li className="flex items-center">
                <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to={`/releases/${release.id}`} className="hover:text-blue-600">
                  {release.name}
                </Link>
              </li>
            )}
            <li className="flex items-center">
              <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">Scope Items</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Scope Items
                {release && (
                  <span className="text-gray-500 font-normal ml-2">
                    for {release.name}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage scope items and their components for this release
              </p>
            </div>
            <Link
              to={`/releases/${releaseId}/scope-items/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Scope Item
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Scope Items Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No scope items</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new scope item.
              </p>
              <div className="mt-6">
                <Link
                  to={`/releases/${releaseId}/scope-items/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Scope Item
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/scope-items/${item.id}`}
                    className="block hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <p className="truncate">{item.description || 'No description'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              {item.components.map((component) => (
                                <span 
                                  key={component.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {getComponentTypeLabel(component.componentType)}
                                </span>
                              ))}
                              {item.components.length === 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  No components
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              Total: {calculateTotalEffort(item)} PD
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Effort Breakdown */}
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Scope Item Level:</span>
                          <span className="ml-2 font-medium">
                            {item.functionalDesignDays + item.sitDays + item.uatDays} PD
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Component Level:</span>
                          <span className="ml-2 font-medium">
                            {item.components.reduce((total, comp) => total + comp.technicalDesignDays + comp.buildDays, 0)} PD
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary Stats */}
        {items.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Scope Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{items.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Components</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {items.reduce((total, item) => total + item.components.length, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Effort</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {items.reduce((total, item) => total + calculateTotalEffort(item), 0)} PD
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effort Summary Table */}
        <EffortSummaryTable releaseId={releaseId} />
      </div>
    </div>
  );
};

export default ScopeListPage;


