import { startOfWeek, addDays, isBefore, isAfter, isEqual, formatISO } from 'date-fns';
import type { Allocation } from '../services/api/v1/allocationService';
import type { CapacityDatum } from './capacityUtils';

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5; // 1=Mon .. 5=Fri
}

function clampDate(date: Date, min: Date, max: Date): Date {
  if (isBefore(date, min)) return min;
  if (isAfter(date, max)) return max;
  return date;
}

/**
 * Compute the maximum allocated days in any week for each resource, based on allocations.
 * - Weeks start on Monday
 * - Only business days (Mon-Fri) are counted
 * - Weekly allocated days = number of business days in the week that overlap the allocation range * allocationFactor
 */
export function computeMaxWeeklyAllocationPerResource(allocations: Allocation[]): CapacityDatum[] {
  // Map: resourceName -> weekStartISO -> allocatedDays
  const perResourceWeek: Record<string, Record<string, number>> = {};

  for (const alloc of allocations) {
    const start = new Date(alloc.startDate);
    const end = new Date(alloc.endDate);

    // Iterate weeks covering [start, end]
    let cursorWeekStart = startOfWeek(start, { weekStartsOn: 1 });
    const endWeekStart = startOfWeek(end, { weekStartsOn: 1 });

    while (isBefore(cursorWeekStart, addDays(endWeekStart, 7))) {
      const weekStart = cursorWeekStart;
      const weekEnd = addDays(weekStart, 6);

      // Overlap period between allocation and this week
      const overlapStart = clampDate(start, weekStart, weekEnd);
      const overlapEnd = clampDate(end, weekStart, weekEnd);

      // Skip if no overlap
      if (isAfter(overlapStart, overlapEnd)) {
        cursorWeekStart = addDays(cursorWeekStart, 7);
        continue;
      }

      // Count business days in [overlapStart, overlapEnd]
      let businessDays = 0;
      let dayCursor = new Date(overlapStart);
      while (isBefore(dayCursor, addDays(overlapEnd, 1)) || isEqual(dayCursor, overlapEnd)) {
        if (isWeekday(dayCursor)) businessDays += 1;
        dayCursor = addDays(dayCursor, 1);
      }

      const allocatedDays = businessDays * alloc.allocationFactor;
      const weekKey = formatISO(weekStart, { representation: 'date' });

      if (!perResourceWeek[alloc.resourceName]) perResourceWeek[alloc.resourceName] = {};
      perResourceWeek[alloc.resourceName][weekKey] = (perResourceWeek[alloc.resourceName][weekKey] || 0) + allocatedDays;

      cursorWeekStart = addDays(cursorWeekStart, 7);
    }
  }

  // Compute max per resource
  const result: CapacityDatum[] = Object.entries(perResourceWeek).map(([resourceName, weeks]) => {
    const maxAllocated = Object.values(weeks).reduce((acc, v) => (v > acc ? v : acc), 0);
    // pick the week that has max
    const [maxWeek] = Object.entries(weeks).reduce<[string, number]>((acc, [wk, val]) => (val > acc[1] ? [wk, val] : acc), ['', -Infinity]);
    return {
      resourceName,
      week: maxWeek || '',
      allocated: Number(maxAllocated.toFixed(2)),
      capacity: 4.5,
    };
  });

  return result;
}

/**
 * Enumerate distinct week starts (ISO date strings) covered by the given allocations.
 */
export function enumerateWeeks(allocations: Allocation[]): string[] {
  const weekSet = new Set<string>();
  for (const alloc of allocations) {
    let cursorWeekStart = startOfWeek(new Date(alloc.startDate), { weekStartsOn: 1 });
    const endWeekStart = startOfWeek(new Date(alloc.endDate), { weekStartsOn: 1 });
    while (isBefore(cursorWeekStart, addDays(endWeekStart, 7))) {
      weekSet.add(formatISO(cursorWeekStart, { representation: 'date' }));
      cursorWeekStart = addDays(cursorWeekStart, 7);
    }
  }
  return Array.from(weekSet).sort();
}

/**
 * Compute allocated days per resource for a specific weekStart ISO date (yyyy-mm-dd).
 */
export function computeWeeklyAllocationForWeek(allocations: Allocation[], weekStartIso: string): CapacityDatum[] {
  const weekStart = new Date(weekStartIso);
  const weekEnd = addDays(weekStart, 6);
  const perResource: Record<string, number> = {};

  for (const alloc of allocations) {
    const start = new Date(alloc.startDate);
    const end = new Date(alloc.endDate);
    // overlap with this week
    const overlapStart = isBefore(start, weekStart) ? weekStart : start;
    const overlapEnd = isAfter(end, weekEnd) ? weekEnd : end;
    if (isAfter(overlapStart, overlapEnd)) continue;

    let businessDays = 0;
    let dayCursor = new Date(overlapStart);
    while (isBefore(dayCursor, addDays(overlapEnd, 1)) || isEqual(dayCursor, overlapEnd)) {
      if (isWeekday(dayCursor)) businessDays += 1;
      dayCursor = addDays(dayCursor, 1);
    }
    const allocatedDays = businessDays * alloc.allocationFactor;
    perResource[alloc.resourceName] = (perResource[alloc.resourceName] || 0) + allocatedDays;
  }

  return Object.entries(perResource).map(([resourceName, allocated]) => ({
    resourceName,
    week: weekStartIso,
    allocated: Number(allocated.toFixed(2)),
    capacity: 4.5,
  }));
}


