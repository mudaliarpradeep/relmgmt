import React from 'react';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/ui/StatCard';
import ActiveReleases from '../../components/dashboard/ActiveReleases';
import ResourceUtilization from '../../components/dashboard/ResourceUtilization';
import ReleaseTimeline from '../../components/dashboard/ReleaseTimeline';
import QuickActions from '../../components/dashboard/QuickActions';
import AllocationConflicts from '../../components/dashboard/AllocationConflicts';

const DashboardPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard title="Active Releases" value={4} color="blue" />
          <StatCard title="Total Resources" value={125} color="green" />
          <StatCard title="Allocation Conflicts" value={3} color="red" />
          <StatCard title="Upcoming Go-Lives" value={2} color="purple" />
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
    </AppLayout>
  );
};

export default DashboardPage; 