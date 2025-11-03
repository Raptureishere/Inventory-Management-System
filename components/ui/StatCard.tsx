import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

/**
 * Stat card component for displaying key metrics
 * Used in dashboards and reports
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'teal',
  trend,
  onClick,
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-rose-500',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500'
  };

  const trendColorClasses = trend?.isPositive
    ? 'text-emerald-600 bg-emerald-50'
    : 'text-rose-600 bg-rose-50';

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          
          {trend && (
            <div className={`inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${trendColorClasses}`}>
              <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'}`}></i>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <i className={`fas ${icon} text-white text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
