import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource, ResourceFilters, PaginatedResponse } from '../../types';
import { Status, SkillFunction, SkillSubFunction, getApplicableSubFunctions } from '../../types';

interface DeleteModalState {
  isOpen: boolean;
  resource: Resource | null;
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// Sortable column header component
const SortableHeader = ({ 
  field, 
  currentSort, 
  onSort, 
  children 
}: { 
  field: string;
  currentSort: SortState | null;
  onSort: (field: string) => void;
  children: React.ReactNode;
}) => {
  const isActive = currentSort?.field === field;
  const isAsc = isActive && currentSort?.direction === 'asc';
  const isDesc = isActive && currentSort?.direction === 'desc';

  return (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <svg 
            className={`w-3 h-3 ${isAsc ? 'text-blue-600' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg 
            className={`w-3 h-3 ${isDesc ? 'text-blue-600' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </th>
  );
};

// Memoized table content component to prevent unnecessary re-renders
const TableContent = React.memo(({ 
  resources, 
  onRowClick, 
  onEdit, 
  onDelete 
}: { 
  resources: Resource[];
  onRowClick: (resource: Resource) => void;
  onEdit: (resource: Resource, event: React.MouseEvent) => void;
  onDelete: (resource: Resource, event: React.MouseEvent) => void;
}) => {
  return (
    <>
      {resources.map((resource) => (
        <tr
          key={resource.id}
          onClick={() => onRowClick(resource)}
          className="hover:bg-gray-50 cursor-pointer"
        >
          <td className="px-6 py-4 text-sm font-medium text-gray-900 min-w-[150px]">
            <div className="truncate" title={resource.name}>
              {resource.name}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 min-w-[120px]">
            <div className="truncate" title={resource.employeeNumber}>
              {resource.employeeNumber}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 min-w-[200px]">
            <div className="truncate" title={resource.email}>
              {resource.email}
            </div>
          </td>
          <td className="px-6 py-4 min-w-[100px]">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              resource.status === Status.ACTIVE 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {resource.status}
            </span>
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 min-w-[120px]">
            <div className="truncate" title={resource.skillFunction}>
              {resource.skillFunction}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 min-w-[120px]">
            <div className="truncate" title={resource.skillSubFunction || 'N/A'}>
              {resource.skillSubFunction || 'N/A'}
            </div>
          </td>
          <td className="px-6 py-4 text-sm font-medium min-w-[120px]">
            <div className="flex space-x-2">
              <button
                onClick={(e) => onEdit(resource, e)}
                className="text-blue-600 hover:text-blue-900 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={(e) => onDelete(resource, e)}
                className="text-red-600 hover:text-red-900 transition-colors"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
});

// Memoized mobile card content component
const MobileCardContent = React.memo(({ 
  resources, 
  onRowClick, 
  onEdit, 
  onDelete 
}: { 
  resources: Resource[];
  onRowClick: (resource: Resource) => void;
  onEdit: (resource: Resource, event: React.MouseEvent) => void;
  onDelete: (resource: Resource, event: React.MouseEvent) => void;
}) => {
  return (
    <>
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => onRowClick(resource)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {resource.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {resource.email}
              </p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 flex-shrink-0 ${
              resource.status === Status.ACTIVE 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {resource.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">ID:</span> {resource.employeeNumber}
            </div>
            <div>
              <span className="font-medium">Function:</span> {resource.skillFunction}
            </div>
            <div>
              <span className="font-medium">Sub-Function:</span> {resource.skillSubFunction || 'N/A'}
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => onEdit(resource, e)}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => onDelete(resource, e)}
              className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </>
  );
});

const ResourceListPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<PaginatedResponse<Resource> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sort, setSort] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<ResourceFilters>({
    page: 0,
    size: 15
  });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    resource: null
  });
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load resources
  const loadResources = async (newFilters?: ResourceFilters, isTableUpdate: boolean = false) => {
    try {
      if (isTableUpdate) {
        setTableLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const filtersWithSort = {
        ...filtersToUse,
        sort: sort ? `${sort.field},${sort.direction}` : undefined
      };
      
      const response = await ResourceService.getResources(filtersWithSort);
      setResources(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      if (isTableUpdate) {
        setTableLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Handle sort changes
  const handleSort = (field: string) => {
    let newSort: SortState;
    
    if (sort?.field === field) {
      // Toggle direction if same field
      newSort = {
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      };
    } else {
      // New field, default to ascending
      newSort = {
        field,
        direction: 'asc'
      };
    }
    
    setSort(newSort);
    setCurrentPage(0); // Reset to first page when sorting
    
    // Update filters and reload
    const newFilters = { ...filters, page: 0 };
    setFilters(newFilters);
    loadResources(newFilters, true);
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof ResourceFilters, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [field]: value,
      page: 0 // Reset to first page when filtering
    };
    setFilters(newFilters);
    setCurrentPage(0);
    // Only update the table data, not the entire page
    loadResources(newFilters, true);
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters: ResourceFilters = { page: 0, size: 15 };
    setFilters(resetFilters);
    setCurrentPage(0);
    setSort(null); // Reset sort as well
    // Only update the table data, not the entire page
    loadResources(resetFilters, true);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    setCurrentPage(newPage);
    // Only update the table data, not the entire page
    loadResources(newFilters, true);
  };

  // Handle navigation
  const handleAddNew = () => {
    navigate('/resources/new');
  };

  const handleRowClick = (resource: Resource) => {
    navigate(`/resources/${resource.id}`);
  };

  const handleEdit = (resource: Resource, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    navigate(`/resources/${resource.id}/edit`);
  };

  // Handle deletion
  const handleDeleteClick = (resource: Resource, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setDeleteModal({ isOpen: true, resource });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.resource) return;

    try {
      await ResourceService.deleteResource(deleteModal.resource.id);
      setDeleteModal({ isOpen: false, resource: null });
      // Reload resources after successful deletion
      loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, resource: null });
  };

  // Handle Excel export
  const handleExport = async () => {
    try {
      const blob = await ResourceService.exportResources();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resources.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export resources');
    }
  };

  // Handle Excel import
  const handleImport = () => {
    setImportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error && !resources) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <div>Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <h1 className="text-2xl font-bold text-white">Resource Management</h1>
              <p className="text-blue-100 mt-1">Manage your team resources and allocations</p>
            </div>
        
            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Resource
                </button>
                <button
                  onClick={handleImport}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import from Excel
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to Excel
                </button>
              </div>
            </div>
          </div>

        {/* Filters */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                >
                  <option value="">All Statuses</option>
                  {Object.values(Status).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skill-function-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Function
                </label>
                <select
                  id="skill-function-filter"
                  value={filters.skillFunction || ''}
                  onChange={(e) => {
                    const value = e.target.value || undefined;
                    handleFilterChange('skillFunction', value);
                    // Reset skill sub-function when skill function changes
                    if (value) {
                      const applicableSubFunctions = getApplicableSubFunctions(value as any);
                      if (applicableSubFunctions.length === 0) {
                        handleFilterChange('skillSubFunction', undefined);
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                >
                  <option value="">All Functions</option>
                  {Object.values(SkillFunction).map(func => (
                    <option key={func} value={func}>{func}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skill-sub-function-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Sub-Function
                  {filters.skillFunction && getApplicableSubFunctions(filters.skillFunction as any).length === 0 && (
                    <span className="text-gray-500 text-xs ml-1">(Not applicable)</span>
                  )}
                </label>
                <select
                  id="skill-sub-function-filter"
                  value={filters.skillSubFunction || ''}
                  onChange={(e) => handleFilterChange('skillSubFunction', e.target.value || undefined)}
                  disabled={!filters.skillFunction || getApplicableSubFunctions(filters.skillFunction as any).length === 0}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !filters.skillFunction || getApplicableSubFunctions(filters.skillFunction as any).length === 0
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'hover:border-gray-400'
                  }`}
                >
                  <option value="">All Sub-Functions</option>
                  {filters.skillFunction && getApplicableSubFunctions(filters.skillFunction as any).map(subFunc => (
                    <option key={subFunc} value={subFunc}>{subFunc}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all font-medium shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Resources Table */}
      {resources && resources.content.length > 0 ? (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Table Loading Overlay */}
          {tableLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading...</span>
              </div>
            </div>
          )}
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto relative">
            <table className="w-full table-auto min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <SortableHeader 
                  field="skillFunction" 
                  currentSort={sort} 
                  onSort={handleSort}
                >
                  Skill Function
                </SortableHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Skill Sub-Function
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <TableContent
                resources={resources.content}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </tbody>
          </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden relative">
            {/* Mobile Loading Overlay */}
            {tableLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading...</span>
                </div>
              </div>
            )}
            <div className="divide-y divide-gray-200">
              <MobileCardContent
                resources={resources.content}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>

          {/* Pagination */}
          {resources.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="mobile-previous-button"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= resources.totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="mobile-next-button"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{currentPage * resources.size + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((currentPage + 1) * resources.size, resources.totalElements)}
                    </span>{' '}
                    of <span className="font-medium">{resources.totalElements}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="desktop-previous-button"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= resources.totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="desktop-next-button"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500">No resources found</div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.resource && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Resource
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete resource "{deleteModal.resource.name}"? 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={handleDeleteCancel}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Import Resources from Excel
                </h3>
                <div className="mb-4">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Choose File
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ResourceListPage;