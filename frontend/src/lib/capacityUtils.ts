interface CapacityDatum {
  resourceName: string;
  week: string; // ISO week label e.g., 2025-W01
  allocated: number; // person-days in the week
  capacity: number; // typically 4.5
}

const getCapacityBarColor = (allocated: number, capacity: number): string => {
  const epsilon = 0.001; // treat near-equality within one-thousandth as exact
  if (Math.abs(allocated - capacity) <= epsilon) return '#16a34a'; // green
  if (allocated < capacity - epsilon) return '#f59e0b'; // amber/yellow
  return '#ef4444'; // red
};

export type { CapacityDatum };
export { getCapacityBarColor };
