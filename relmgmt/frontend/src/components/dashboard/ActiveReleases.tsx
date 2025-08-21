import React from 'react';
import { Link } from 'react-router-dom';

const releases = [
  {
    name: 'Release 2024.1',
    status: 'In Progress',
    statusColor: 'blue',
    phases: [
      { name: 'Technical Design', percent: 100, color: 'green' },
      { name: 'Build', percent: 45, color: 'blue' },
      { name: 'SIT', percent: 0, color: 'gray' },
    ],
  },
  {
    name: 'Release 2024.2',
    status: 'In Progress',
    statusColor: 'blue',
    phases: [
      { name: 'Functional Design', percent: 80, color: 'blue' },
      { name: 'Technical Design', percent: 20, color: 'blue' },
    ],
  },
  {
    name: 'Release 2024.3',
    status: 'Planning',
    statusColor: 'purple',
    phases: [
      { name: 'Functional Design', percent: 30, color: 'blue' },
    ],
  },
];

const statusBadge = (status: string, color: string) => (
  <span className={`text-sm px-2 py-0.5 rounded bg-${color}-100 text-${color}-600`}>{status}</span>
);

const progressBar = (percent: number, color: string) => (
  <div className="progress-bar h-2 rounded-full bg-gray-200 overflow-hidden">
    <div className={`h-full rounded-full bg-${color}-500`} style={{ width: `${percent}%` }} />
  </div>
);

const ActiveReleases: React.FC = () => (
  <section className="card bg-blue-50 border-blue-200 mb-6" aria-labelledby="active-releases-title">
    <h2 className="card-title text-blue-800" id="active-releases-title">Active Releases</h2>
    <div className="space-y-6">
      {releases.map((release) => (
        <div key={release.name} data-testid="release-item">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-gray-900">{release.name}</span>
            {statusBadge(release.status, release.statusColor)}
          </div>
          <div className="space-y-2 text-sm">
            {release.phases.map((phase) => (
              <div key={phase.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">{phase.name}</span>
                  <span className="text-gray-900">{phase.percent === 0 ? 'Not Started' : `${phase.percent}%`}</span>
                </div>
                {progressBar(phase.percent, phase.color)}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Link to="/releases" className="link flex items-center justify-end">
        View All Releases
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </section>
);

export default ActiveReleases; 