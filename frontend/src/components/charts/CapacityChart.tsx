import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Cell } from 'recharts';
import { CapacityDatum, getCapacityBarColor } from '../../lib/capacityUtils';

interface CapacityChartProps {
  data: CapacityDatum[];
  height?: number;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const CapacityChart: React.FC<CapacityChartProps> = ({ data, height = 280, loading = false, error = null, emptyMessage = 'No capacity data to display.' }) => {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12" data-testid="capacity-chart-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full" data-testid="capacity-chart-error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full text-center py-8 text-sm text-gray-500" data-testid="capacity-chart-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="capacity-chart">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <XAxis dataKey="resourceName" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 7]} tick={{ fontSize: 12 }} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <ReferenceLine y={4.5} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Capacity (4.5)', position: 'right', fill: '#16a34a' }} />
          <Bar dataKey="allocated" name="Allocated">
            {data.map((d, idx) => (
              <Cell key={`cell-${idx}`} fill={getCapacityBarColor(d.allocated, d.capacity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CapacityChart;


