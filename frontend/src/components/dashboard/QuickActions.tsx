import React from 'react';

const actions = [
  {
    title: 'Create New Release',
    description: 'Start a new release cycle',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: 'orange',
  },
  {
    title: 'Import Resources',
    description: 'Upload resource roster',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    color: 'blue',
  },
  {
    title: 'View Conflicts',
    description: 'Check allocation issues',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: 'red',
  },
  {
    title: 'Generate Reports',
    description: 'Export data & analytics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'green',
  },
];

const QuickActions: React.FC = () => (
  <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-labelledby="quick-actions-title">
    <h2 className="text-lg font-semibold text-gray-900 mb-4" id="quick-actions-title">Quick Actions</h2>
    <div className="space-y-3">
      {actions.map((action) => (
        <button
          key={action.title}
          className="group w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-4 transition-all duration-200 hover:shadow-sm text-left"
        >
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
              action.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              action.color === 'red' ? 'bg-red-100 text-red-600' :
              'bg-green-100 text-green-600'
            } group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {action.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  </section>
);

export default QuickActions; 