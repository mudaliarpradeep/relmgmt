import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import ActiveReleases from '../../components/dashboard/ActiveReleases';
import ResourceUtilization from '../../components/dashboard/ResourceUtilization';
import ReleaseTimeline from '../../components/dashboard/ReleaseTimeline';
import QuickActions from '../../components/dashboard/QuickActions';
import AllocationConflicts from '../../components/dashboard/AllocationConflicts';
import ResourceService from '../../services/api/v1/resourceService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [totalResources, setTotalResources] = useState<number>(0);
  const [resourcesLoading, setResourcesLoading] = useState<boolean>(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResourceCount = async () => {
      try {
        setResourcesLoading(true);
        setResourcesError(null);
        // Fetch active resources count to minimize data transfer, we only need the total count
        const response = await ResourceService.getResources({ 
          status: 'ACTIVE' as any, // Backend expects enum name, not display name
          page: 0, 
          size: 1 
        });
        setTotalResources(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch resource count:', error);
        setResourcesError('Failed to load resource count');
        setTotalResources(0);
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResourceCount();
  }, []);

  // Navigation handlers for stat cards
  const handleActiveReleasesClick = () => {
    navigate('/releases'); // Assuming releases page exists
  };

  const handleResourcesClick = () => {
    navigate('/resources');
  };

  const handleAllocationConflictsClick = () => {
    navigate('/allocations'); // Assuming allocations page exists
  };

  const handleUpcomingGoLivesClick = () => {
    navigate('/releases'); // Assuming releases page exists, could be filtered for upcoming
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard 
            title="Active Releases" 
            value={4} 
            color="blue" 
            onClick={handleActiveReleasesClick}
          />
          <StatCard 
            title="Active Resources" 
            value={resourcesLoading ? '...' : totalResources} 
            color="green" 
            onClick={handleResourcesClick}
          />
          <StatCard 
            title="Allocation Conflicts" 
            value={3} 
            color="red" 
            onClick={handleAllocationConflictsClick}
          />
          <StatCard 
            title="Upcoming Go-Lives" 
            value={2} 
            color="purple" 
            onClick={handleUpcomingGoLivesClick}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <ActiveReleases />
          <ResourceUtilization />
        </div>
        <div className="mb-4 sm:mb-6">
          <ReleaseTimeline />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <QuickActions />
          <AllocationConflicts />
        </div>
      </div>
  );
};

export default DashboardPage; 