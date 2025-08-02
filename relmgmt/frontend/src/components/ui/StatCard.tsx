import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const colorClasses: Record<StatCardProps['color'], string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
};

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <div className={`rounded-lg shadow-sm p-4 border ${colorClasses[color]} text-center`}
       data-testid="stat-card">
    <div className={`text-sm font-medium ${colorClasses[color]}`}>{title}</div>
    <div className="mt-1 flex items-baseline justify-center">
      <div className={`text-3xl font-semibold ${color === 'blue' ? 'text-blue-900' : color === 'green' ? 'text-green-900' : color === 'red' ? 'text-red-900' : 'text-purple-900'}`}>{value}</div>
    </div>
  </div>
);

export default StatCard; 