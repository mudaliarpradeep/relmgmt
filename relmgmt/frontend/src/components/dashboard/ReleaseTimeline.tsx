import React from 'react';

const timeline = [
  { name: 'R2024.1', label: 'Release 2024.1', start: 0, span: 1, color: 'blue' },
  { name: 'R2024.2', label: 'Release 2024.2', start: 1, span: 1, color: 'blue' },
  { name: 'R2024.3', label: 'Release 2024.3', start: 2, span: 1, color: 'purple' },
  { name: 'R2024.4', label: 'Release 2024.4', start: 3, span: 1, color: 'purple' },
];

const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];

const ReleaseTimeline: React.FC = () => (
  <section className="card bg-purple-50 border-purple-200 mb-6" aria-labelledby="release-timeline-title">
    <h2 className="card-title text-purple-800" id="release-timeline-title">Release Timeline Overview</h2>
    <div className="overflow-x-auto">
      <div className="min-w-full py-2" style={{ minWidth: 600 }}>
        {/* Timeline header */}
        <div className="flex mb-4">
          <div className="w-1/6 text-gray-500 text-sm font-medium"></div>
          {quarters.map((q) => (
            <div key={q} className="w-1/4 text-gray-500 text-sm font-medium">{q}</div>
          ))}
        </div>
        {/* Timeline rows */}
        <div className="space-y-6">
          {timeline.map((row) => (
            <div className="flex items-center" key={row.name} data-testid="timeline-row">
              <div className="w-1/6 text-gray-900 font-medium">{row.name}</div>
              <div className="w-3/4 flex">
                {Array(row.start).fill(null).map((_, i) => (
                  <div key={i} className={`w-1/${quarters.length}`}></div>
                ))}
                <div className={`h-8 bg-${row.color}-500 rounded-lg w-1/${quarters.length} relative flex items-center justify-center text-white text-xs`}>
                  {row.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-4">
      <a href="#" className="link flex items-center justify-end">
        View Full Gantt Chart
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </section>
);

export default ReleaseTimeline; 