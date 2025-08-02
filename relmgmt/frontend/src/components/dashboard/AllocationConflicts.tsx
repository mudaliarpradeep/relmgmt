import React from 'react';

const conflicts = [
  {
    name: 'Jane Doe (Technical Design)',
    overallocated: '2.5 person-days',
    week: 'Week of May 15',
    severity: 'High',
    color: 'red',
  },
  {
    name: 'Mike Johnson (Build)',
    overallocated: '1.5 person-days',
    week: 'Week of May 22',
    severity: 'Medium',
    color: 'yellow',
  },
  {
    name: 'Sarah Williams (Test)',
    overallocated: '3 person-days',
    week: 'Week of June 5',
    severity: 'High',
    color: 'red',
  },
];

const badgeColor = (color: string) => `bg-${color}-200 text-${color}-900`;
const cardColor = (color: string) => `bg-${color}-100 border-${color}-200`;

const AllocationConflicts: React.FC = () => (
  <section className="card bg-red-50 border-red-200" aria-labelledby="allocation-conflicts-title">
    <h2 className="card-title text-red-800" id="allocation-conflicts-title">Allocation Conflicts</h2>
    <div className="space-y-4">
      {conflicts.map((c, i) => (
        <div className={`p-3 rounded-lg border ${cardColor(c.color)}`} key={i} data-testid="conflict-item">
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium text-${c.color}-900`}>{c.name}</p>
              <p className={`text-sm text-${c.color}-700`}>Overallocated by {c.overallocated}</p>
              <p className={`text-xs text-${c.color}-600`}>{c.week}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${badgeColor(c.color)}`}>{c.severity}</span>
          </div>
        </div>
      ))}
      <a href="#" className="link flex items-center justify-end">
        Resolve Conflicts
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </section>
);

export default AllocationConflicts; 