import React from 'react';
import type { Allocation } from '../../services/api/v1/allocationService';
import { enumerateWeeks, computeWeeklyAllocationForWeek } from '../../lib/capacity';
import { startOfWeek, addDays, isBefore, isAfter, isEqual, formatISO } from 'date-fns';

interface WeeklyAllocationGridProps {
  allocations: Allocation[];
}

interface PhaseOverlay {
  phase: string;
  phaseDisplayName: string;
  startWeek: string;
  endWeek: string;
  color: string;
}

const WeeklyAllocationGrid: React.FC<WeeklyAllocationGridProps> = ({ allocations }) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];
  const weeks = enumerateWeeks(safeAllocations);
  const resourceNames = Array.from(new Set(safeAllocations.map((a) => a.resourceName))).sort();

  // Get phase color mapping
  const getPhaseColor = (phase: string) => {
    const colorMap: Record<string, string> = {
      'FUNCTIONAL_DESIGN': 'bg-blue-100 text-blue-800 border-blue-200',
      'TECHNICAL_DESIGN': 'bg-purple-100 text-purple-800 border-purple-200',
      'BUILD': 'bg-green-100 text-green-800 border-green-200',
      'SYSTEM_INTEGRATION_TEST': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'USER_ACCEPTANCE_TEST': 'bg-orange-100 text-orange-800 border-orange-200',
      'SMOKE_TESTING': 'bg-red-100 text-red-800 border-red-200',
      'PRODUCTION_GO_LIVE': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[phase] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPhaseDisplayName = (phase: string) => {
    const phaseMap: Record<string, string> = {
      'FUNCTIONAL_DESIGN': 'Functional Design',
      'TECHNICAL_DESIGN': 'Technical Design',
      'BUILD': 'Build',
      'SYSTEM_INTEGRATION_TEST': 'System Integration Test',
      'USER_ACCEPTANCE_TEST': 'User Acceptance Test',
      'SMOKE_TESTING': 'Smoke Testing',
      'PRODUCTION_GO_LIVE': 'Production Go-Live'
    };
    return phaseMap[phase] || phase;
  };

  // Compute phase overlays for each week
  const computePhaseOverlays = (): PhaseOverlay[] => {
    const phaseMap = new Map<string, { start: Date; end: Date; phase: string }>();
    
    // Group allocations by phase and find the overall start/end for each phase
    safeAllocations.forEach(alloc => {
      const start = new Date(alloc.startDate);
      const end = new Date(alloc.endDate);
      
      if (!phaseMap.has(alloc.phase)) {
        phaseMap.set(alloc.phase, { start, end, phase: alloc.phase });
      } else {
        const existing = phaseMap.get(alloc.phase)!;
        if (isBefore(start, existing.start)) existing.start = start;
        if (isAfter(end, existing.end)) existing.end = end;
      }
    });

    // Convert to week-based overlays
    const overlays: PhaseOverlay[] = [];
    phaseMap.forEach(({ start, end, phase }) => {
      const startWeek = formatISO(startOfWeek(start, { weekStartsOn: 1 }), { representation: 'date' });
      const endWeek = formatISO(startOfWeek(end, { weekStartsOn: 1 }), { representation: 'date' });
      
      overlays.push({
        phase,
        phaseDisplayName: getPhaseDisplayName(phase),
        startWeek,
        endWeek,
        color: getPhaseColor(phase)
      });
    });

    return overlays.sort((a, b) => a.startWeek.localeCompare(b.startWeek));
  };

  const phaseOverlays = computePhaseOverlays();

  // Precompute per-week allocations per resource for quick lookup
  const perWeekMap: Record<string, Record<string, number>> = {};
  for (const wk of weeks) {
    const rows = computeWeeklyAllocationForWeek(safeAllocations, wk);
    for (const row of rows) {
      if (!perWeekMap[row.resourceName]) perWeekMap[row.resourceName] = {};
      perWeekMap[row.resourceName][wk] = row.allocated;
    }
  }

  // Get phases active in a specific week
  const getPhasesForWeek = (week: string): PhaseOverlay[] => {
    return phaseOverlays.filter(overlay => 
      week >= overlay.startWeek && week <= overlay.endWeek
    );
  };

  // Format week display
  const formatWeekDisplay = (week: string) => {
    const date = new Date(week);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="overflow-x-auto" data-testid="weekly-allocation-grid">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
              Resource
            </th>
            {weeks.map((wk) => {
              const phases = getPhasesForWeek(wk);
              return (
                <th key={wk} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  <div className="space-y-1">
                    <div className="font-semibold">{formatWeekDisplay(wk)}</div>
                    {phases.length > 0 && (
                      <div className="space-y-1">
                        {phases.map((phase, idx) => (
                          <div 
                            key={`${wk}-${phase.phase}-${idx}`}
                            className={`inline-block px-2 py-1 text-xs rounded border ${phase.color}`}
                            title={phase.phaseDisplayName}
                          >
                            {phase.phaseDisplayName.split(' ').map(word => word[0]).join('')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {resourceNames.map((name) => (
            <tr key={name} data-testid={`row-${name}`}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                {name}
              </td>
              {weeks.map((wk) => {
                const allocated = perWeekMap[name]?.[wk] ?? 0;
                const phases = getPhasesForWeek(wk);
                const hasAllocation = allocated > 0;
                
                return (
                  <td 
                    key={wk} 
                    className={`px-2 py-3 text-center text-sm ${
                      hasAllocation 
                        ? 'bg-blue-50 text-blue-900 font-medium' 
                        : 'text-gray-500'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className={`text-lg font-semibold ${
                        hasAllocation ? 'text-blue-900' : 'text-gray-400'
                      }`}>
                        {allocated.toFixed(1)}
                      </div>
                      {hasAllocation && phases.length > 0 && (
                        <div className="text-xs text-gray-600">
                          {phases.map(phase => phase.phaseDisplayName.split(' ')[0]).join(', ')}
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
      
      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Phase Legend</h4>
        <div className="flex flex-wrap gap-2">
          {phaseOverlays.map((overlay) => (
            <div key={overlay.phase} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded border ${overlay.color}`}></div>
              <span className="text-xs text-gray-700">{overlay.phaseDisplayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyAllocationGrid;




