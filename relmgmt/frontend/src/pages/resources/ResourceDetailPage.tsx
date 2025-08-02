import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource } from '../../types';
import { Status } from '../../types';

const ResourceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadResource(parseInt(id));
    }
  }, [id]);

  const loadResource = async (resourceId: number) => {
    try {
      setLoading(true);
      setError(null);
      const resourceData = await ResourceService.getResource(resourceId);
      setResource(resourceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusClasses = (status: string) => {
    return status === Status.ACTIVE
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const handleBack = () => {
    navigate('/resources');
  };

  const handleEdit = () => {
    if (resource) {
      navigate(`/resources/${resource.id}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <div>Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-6">
        <div className="text-center">Resource not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resource Details</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Resources
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Resource
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{resource.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Number</label>
                <p className="mt-1 text-sm text-gray-900">{resource.employeeNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{resource.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(resource.status)}`}>
                  {resource.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Grade</label>
                <p className="mt-1 text-sm text-gray-900">{resource.employeeGrade}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skill Function</label>
                <p className="mt-1 text-sm text-gray-900">{resource.skillFunction}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skill Sub-function</label>
                <p className="mt-1 text-sm text-gray-900">{resource.skillSubFunction}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Project Start Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(resource.projectStartDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Project End Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(resource.projectEndDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Created:</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(resource.createdAt)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Updated:</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(resource.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Allocation Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Allocation Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Project</label>
                <p className="mt-1 text-sm text-gray-900">
                  {resource.projectStartDate && resource.projectEndDate 
                    ? `${formatDate(resource.projectStartDate)} - ${formatDate(resource.projectEndDate)}`
                    : 'Not allocated'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Allocation</label>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: resource.projectStartDate && resource.projectEndDate ? '75%' : '0%' }}
                    ></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {resource.projectStartDate && resource.projectEndDate ? '75%' : '0%'} allocated
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <p className="mt-1 text-sm text-gray-900">
                  {resource.status === Status.ACTIVE ? 'Available' : 'Not available'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {resource.skillFunction}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {resource.skillSubFunction}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage; 