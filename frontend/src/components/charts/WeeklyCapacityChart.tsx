import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Cell, ComposedChart, Line } from 'recharts';
import type { Allocation } from '../../services/api/v1/allocationService';
import { enumerateWeeks, computeWeeklyAllocationForWeek } from '../../lib/capacity';

interface WeeklyCapacityChartProps {
  allocations: Allocation[];
  selectedWeek?: string;
  height?: number;
}

interface WeeklyData {
  week: string;
  weekDisplay: string;
  totalAllocated: number;
  maxResourceAllocation: number;
  averageAllocation: number;
  capacity: number;
  phaseCount: number;
}

const WeeklyCapacityChart: React.FC<WeeklyCapacityChartProps> = ({ 
  allocations, 
  selectedWeek, 
  height = 300 
}) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];
  const weeks = enumerateWeeks(safeAllocations);

  // Get phase color mapping
  const getPhaseColor = (phase: string) => {
    const colorMap: Record<string, string> = {
      'FUNCTIONAL_DESIGN': '#3b82f6', // blue
      'TECHNICAL_DESIGN': '#8b5cf6', // purple
      'BUILD': '#10b981', // green
      'SYSTEM_INTEGRATION_TEST': '#f59e0b', // yellow
      'USER_ACCEPTANCE_TEST': '#f97316', // orange
      'SMOKE_TESTING': '#ef4444', // red
      'PRODUCTION_GO_LIVE': '#6b7280' // gray
    };
    return colorMap[phase] || '#6b7280';
  };

  // Compute weekly data
  const computeWeeklyData = (): WeeklyData[] => {
    return weeks.map(week => {
      const weekData = computeWeeklyAllocationForWeek(safeAllocations, week);
      const totalAllocated = weekData.reduce((sum, item) => sum + item.allocated, 0);
      const maxResourceAllocation = Math.max(...weekData.map(item => item.allocated), 0);
      const averageAllocation = weekData.length > 0 ? totalAllocated / weekData.length : 0;
      
      // Count unique phases active in this week
      const activePhases = new Set(
        safeAllocations
          .filter(alloc => {
            const start = new Date(alloc.startDate);
            const end = new Date(alloc.endDate);
            const weekStart = new Date(week);
            const weekEnd = new Date(week);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return start <= weekEnd && end >= weekStart;
          })
          .map(alloc => alloc.phase)
      );

      const date = new Date(week);
      const weekDisplay = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });

      return {
        week,
        weekDisplay,
        totalAllocated: Number(totalAllocated.toFixed(1)),
        maxResourceAllocation: Number(maxResourceAllocation.toFixed(1)),
        averageAllocation: Number(averageAllocation.toFixed(1)),
        capacity: 4.5,
        phaseCount: activePhases.size
      };
    });
  };

  const weeklyData = computeWeeklyData();

  // Get phases active in a specific week
  const getPhasesForWeek = (week: string) => {
    const activePhases = new Set(
      safeAllocations
        .filter(alloc => {
          const start = new Date(alloc.startDate);
          const end = new Date(alloc.endDate);
          const weekStart = new Date(week);
          const weekEnd = new Date(week);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return start <= weekEnd && end >= weekStart;
        })
        .map(alloc => alloc.phase)
    );
    return Array.from(activePhases);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const phases = getPhasesForWeek(data.week);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`Week: ${data.weekDisplay}`}</p>
          <p className="text-sm text-gray-600">Total Allocated: {data.totalAllocated} days</p>
          <p className="text-sm text-gray-600">Max per Resource: {data.maxResourceAllocation} days</p>
          <p className="text-sm text-gray-600">Average: {data.averageAllocation} days</p>
          <p className="text-sm text-gray-600">Active Phases: {data.phaseCount}</p>
          {phases.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700">Phases:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {phases.map((phase: string) => (
                  <span 
                    key={phase}
                    className="text-xs px-2 py-1 rounded text-white"
                    style={{ backgroundColor: getPhaseColor(phase) }}
                  >
                    {phase.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Get bar color based on allocation level
  const getBarColor = (value: number, capacity: number): string => {
    const ratio = value / capacity;
    if (ratio <= 0.5) return '#10b981'; // green - low
    if (ratio <= 0.8) return '#f59e0b'; // yellow - medium
    if (ratio <= 1.0) return '#f97316'; // orange - high
    return '#ef4444'; // red - over capacity
  };

  if (weeklyData.length === 0) {
    return (
      <div className="w-full text-center py-8 text-sm text-gray-500">
        No weekly capacity data to display.
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="weekly-capacity-chart">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={weeklyData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <XAxis 
            dataKey="weekDisplay" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, 8]} 
            tick={{ fontSize: 12 }} 
            label={{ value: 'Days', angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine 
            y={4.5} 
            stroke="#16a34a" 
            strokeDasharray="4 4" 
            label={{ value: 'Capacity (4.5)', position: 'right', fill: '#16a34a' }} 
          />
          <Bar dataKey="totalAllocated" name="Total Allocated" fill="#3b82f6">
            {weeklyData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.totalAllocated, entry.capacity)} />
            ))}
          </Bar>
          <Line 
            type="monotone" 
            dataKey="maxResourceAllocation" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Max per Resource"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Chart Legend */}
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Total Allocated</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Max per Resource</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded border-2 border-dashed"></div>
          <span>Capacity (4.5 days)</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCapacityChart;




