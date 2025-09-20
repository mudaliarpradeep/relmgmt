import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import ActiveReleases from '../../components/dashboard/ActiveReleases';
import ResourceUtilization from '../../components/dashboard/ResourceUtilization';
import ReleaseTimeline from '../../components/dashboard/ReleaseTimeline';
import QuickActions from '../../components/dashboard/QuickActions';
import AllocationConflicts from '../../components/dashboard/AllocationConflicts';
import ResourceService from '../../services/api/v1/resourceService';
import ReleaseService from '../../services/api/v1/releaseService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [totalResources, setTotalResources] = useState<number>(0);
  const [resourcesLoading, setResourcesLoading] = useState<boolean>(true);
  const [, setResourcesError] = useState<string | null>(null);
  const [activeReleasesCount, setActiveReleasesCount] = useState<number>(0);
  const [activeReleasesLoading, setActiveReleasesLoading] = useState<boolean>(true);
  const [, setActiveReleasesError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchActiveReleasesCount = async () => {
      try {
        setActiveReleasesLoading(true);
        setActiveReleasesError(null);
        const releases = await ReleaseService.getActiveReleases();
        setActiveReleasesCount(releases.length);
      } catch (error) {
        console.error('Failed to fetch active releases count:', error);
        setActiveReleasesError('Failed to load active releases count');
        setActiveReleasesCount(0);
      } finally {
        setActiveReleasesLoading(false);
      }
    };

    fetchActiveReleasesCount();
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
            value={activeReleasesLoading ? '...' : activeReleasesCount} 
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