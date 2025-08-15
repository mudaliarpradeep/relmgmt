import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { AllocationConflictResponse } from '../../services/api/v1/allocationService';

export interface ConflictDatum {
  resourceName: string;
  week: string; // ISO date for week start
  overAllocation: number; // days over 4.5
}

function transformConflictsToChartData(conflicts: AllocationConflictResponse[]): ConflictDatum[] {
  const rows: ConflictDatum[] = [];
  for (const c of conflicts) {
    for (const wk of c.weeklyConflicts) {
      rows.push({ resourceName: c.resourceName, week: wk.weekStarting, overAllocation: wk.overAllocation });
    }
  }
  return rows;
}

interface ConflictsChartProps {
  conflicts: AllocationConflictResponse[];
  height?: number;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const ConflictsChart: React.FC<ConflictsChartProps> = ({ conflicts, height = 280, loading = false, error = null, emptyMessage = 'No conflicts to display.' }) => {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12" data-testid="conflicts-chart-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full" data-testid="conflicts-chart-error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  const data = transformConflictsToChartData(conflicts);
  if (!data || data.length === 0) {
    return (
      <div className="w-full text-center py-8 text-sm text-gray-500" data-testid="conflicts-chart-empty">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="w-full" data-testid="conflicts-chart">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <XAxis dataKey="resourceName" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} label={{ value: 'Over-Allocation (days)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="overAllocation" name="Over-Allocation" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConflictsChart;


