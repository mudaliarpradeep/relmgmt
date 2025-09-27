import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addWeeks, parseISO } from 'date-fns';
import type { WeeklyAllocationMatrix, ResourceAllocation, WeeklyAllocation } from '../../services/api/sharedTypes';

interface WeeklyAllocationTableProps {
  matrix: WeeklyAllocationMatrix;
  onResourceClick?: (resourceId: string) => void;
  onAllocationUpdate?: (resourceId: string, weekStart: string, personDays: number) => void;
}

const WeeklyAllocationTable: React.FC<WeeklyAllocationTableProps> = ({
  matrix,
  onResourceClick,
  onAllocationUpdate
}) => {
  const [currentWeekStart] = useState<string>(matrix.currentWeekStart);
  const [visibleWeeks, setVisibleWeeks] = useState<string[]>([]);


  // Generate visible weeks based on current week
  useEffect(() => {
    const generateVisibleWeeks = () => {
      const startDate = parseISO(currentWeekStart);
      const weeks: string[] = [];
      
      // Past 4 weeks + current week + next 24 weeks (29 weeks total)
      for (let i = -4; i <= 24; i++) {
        const weekDate = addWeeks(startDate, i);
        const mondayOfWeek = startOfWeek(weekDate, { weekStartsOn: 1 });
        weeks.push(format(mondayOfWeek, 'yyyy-MM-dd'));
      }
      
      setVisibleWeeks(weeks);
    };

    generateVisibleWeeks();
  }, [currentWeekStart]);

  // Format week display as "D-MMM" (e.g., "1-Sep", "8-Sep")
  const formatWeekDisplay = (weekStart: string): string => {
    const date = parseISO(weekStart);
    return format(date, 'd-MMM');
  };

  // Get allocation for a specific resource and week
  const getAllocationForWeek = (resource: ResourceAllocation, weekStart: string): WeeklyAllocation | undefined => {
    return resource.weeklyAllocations.find(allocation => allocation.weekStart === weekStart);
  };

  // Handle resource name click
  const handleResourceClick = (resourceId: string) => {
    if (onResourceClick) {
      onResourceClick(resourceId);
    }
  };

  // Handle allocation cell click (for future editing functionality)
  const handleAllocationClick = (resourceId: string, weekStart: string, currentPersonDays: number) => {
    if (onAllocationUpdate) {
      // For now, just log the click - in future this could open an edit dialog
      console.log(`Allocation clicked: Resource ${resourceId}, Week ${weekStart}, Current: ${currentPersonDays} days`);
    }
  };

  // Get color coding for allocation levels
  const getAllocationColor = (personDays: number): string => {
    if (personDays === 0) return 'text-gray-400';
    if (personDays < 2) return 'text-yellow-600 bg-yellow-50';
    if (personDays <= 4.5) return 'text-green-600 bg-green-50';
    if (personDays <= 5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (!matrix.resources || matrix.resources.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No resources found</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="weekly-allocation-table">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Primary Header Row */}
        <thead className="bg-gray-50 sticky top-0 z-20">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 border-r border-gray-200">
              Resource Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skill Function
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skill Sub-Function
            </th>
            {visibleWeeks.map((weekStart) => (
              <th key={weekStart} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                {formatWeekDisplay(weekStart)}
              </th>
            ))}
          </tr>
        </thead>

        {/* Secondary Header Row (Subhead) */}
        <thead className="bg-gray-100 sticky top-12 z-10">
          <tr>
            <th className="px-4 py-2 text-left text-xs text-gray-400 italic sticky left-0 bg-gray-100 z-30 border-r border-gray-200">
              linked to profile
            </th>
            <th className="px-4 py-2 text-left text-xs text-gray-400 italic">
              Level 1-12
            </th>
            <th className="px-4 py-2 text-left text-xs text-gray-400 italic">
              Engineering/Design/etc
            </th>
            <th className="px-4 py-2 text-left text-xs text-gray-400 italic">
              Frontend/Backend/etc
            </th>
            {visibleWeeks.map((weekStart) => (
              <th key={`subhead-${weekStart}`} className="px-2 py-2 text-center text-xs text-gray-400 italic">
                person days
              </th>
            ))}
          </tr>
        </thead>

        {/* Data Rows */}
        <tbody className="bg-white divide-y divide-gray-200">
          {matrix.resources.map((resource) => (
            <tr key={resource.id} data-testid={`row-${resource.id}`}>
              {/* Resource Name - linked to profile */}
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-20 border-r border-gray-200">
                <Link
                  to={resource.profileUrl}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => handleResourceClick(resource.id)}
                >
                  {resource.name}
                </Link>
              </td>

              {/* Grade */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {resource.grade}
              </td>

              {/* Skill Function */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {resource.skillFunction}
              </td>

              {/* Skill Sub-Function */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {resource.skillSubFunction || '-'}
              </td>

              {/* Weekly Allocation Columns */}
              {visibleWeeks.map((weekStart) => {
                const allocation = getAllocationForWeek(resource, weekStart);
                const personDays = allocation?.personDays || 0;
                const projectName = allocation?.projectName;
                
                return (
                  <td
                    key={`${resource.id}-${weekStart}`}
                    className={`px-2 py-3 text-center text-sm cursor-pointer hover:bg-gray-50 ${getAllocationColor(personDays)}`}
                    onClick={() => handleAllocationClick(resource.id, weekStart, personDays)}
                    title={projectName ? `Project: ${projectName}` : undefined}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {personDays > 0 ? personDays.toFixed(1) : '-'}
                      </div>
                      {projectName && (
                        <div className="text-xs opacity-75 truncate max-w-[60px]" title={projectName}>
                          {projectName}
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Time Window Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Time Window:</span> {matrix.timeWindow.startWeek} to {matrix.timeWindow.endWeek}
          </div>
          <div>
            <span className="font-medium">Total Weeks:</span> {matrix.timeWindow.totalWeeks}
          </div>
          <div>
            <span className="font-medium">Current Week:</span> {formatWeekDisplay(matrix.currentWeekStart)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAllocationTable;
