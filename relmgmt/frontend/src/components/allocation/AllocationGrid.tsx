import React from 'react';
import type { Allocation } from '../../services/api/v1/allocationService';
import { enumerateWeeks, computeWeeklyAllocationForWeek } from '../../lib/capacity';

interface AllocationGridProps {
  allocations: Allocation[];
}

const AllocationGrid: React.FC<AllocationGridProps> = ({ allocations }) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];
  const weeks = enumerateWeeks(safeAllocations);
  const resourceNames = Array.from(new Set(safeAllocations.map((a) => a.resourceName))).sort();

  // Precompute per-week allocations per resource for quick lookup
  const perWeekMap: Record<string, Record<string, number>> = {};
  for (const wk of weeks) {
    const rows = computeWeeklyAllocationForWeek(safeAllocations, wk);
    for (const row of rows) {
      if (!perWeekMap[row.resourceName]) perWeekMap[row.resourceName] = {};
      perWeekMap[row.resourceName][wk] = row.allocated;
    }
  }

  return (
    <div className="overflow-x-auto" data-testid="allocation-grid">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50" data-testid="allocation-grid-header">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
            {weeks.map((wk) => (
              <th key={wk} data-week={wk} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {wk}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {resourceNames.map((name) => (
            <tr key={name} data-testid={`row-${name}`}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{name}</td>
              {weeks.map((wk) => {
                const allocated = perWeekMap[name]?.[wk] ?? 0;
                return (
                  <td key={wk} data-week={wk} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {allocated.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationGrid;


