import React from 'react';

const utilization = [
  { name: 'Functional Design', percent: 85, color: 'green' },
  { name: 'Technical Design', percent: 92, color: 'yellow' },
  { name: 'Build', percent: 78, color: 'green' },
  { name: 'Test', percent: 65, color: 'green' },
  { name: 'Platform', percent: 70, color: 'green' },
];

const barColor = (color: string) => `bg-${color}-500`;

const ResourceUtilization: React.FC = () => (
  <section className="card bg-green-50 border-green-200" aria-labelledby="resource-utilization-title">
    <h2 className="card-title text-green-800" id="resource-utilization-title">Resource Utilization</h2>
    <div className="space-y-4">
      {utilization.map((item) => (
        <div key={item.name} data-testid="utilization-bar">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">{item.name}</span>
            <span className="text-gray-900">{item.percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className={`${barColor(item.color)} h-full rounded-full`} style={{ width: `${item.percent}%` }} />
          </div>
        </div>
      ))}
      <div className="pt-2">
        <a href="#" className="link flex items-center justify-end">
          View Resource Details
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </section>
);

export default ResourceUtilization; 