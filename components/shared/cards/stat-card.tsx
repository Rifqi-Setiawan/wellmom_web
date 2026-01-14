import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
  badge?: string;
  badgeColor?: 'orange' | 'green' | 'blue' | 'red';
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  trend,
  trendUp = true,
  badge,
  badgeColor = 'orange',
  className = '',
}: StatCardProps) {
  const badgeColors = {
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${!trendUp && 'rotate-180'}`} />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
        {badge && (
          <span
            className={`px-2.5 py-1 ${badgeColors[badgeColor]} text-xs font-semibold rounded-full`}
          >
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
