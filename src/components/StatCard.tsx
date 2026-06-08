import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?:
    | { value: number; isUp: boolean }
    | string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
  description?: string;
}

const colorClasses = {
  green: 'from-emerald-500 to-emerald-600',
  blue: 'from-blue-500 to-blue-600',
  yellow: 'from-amber-500 to-amber-600',
  purple: 'from-violet-500 to-violet-600',
  red: 'from-red-500 to-red-600',
};

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendDirection,
  color = 'green',
  description,
}: StatCardProps) {
  const renderTrend = () => {
    if (!trend) return null;

    if (typeof trend === 'string') {
      const dirClass =
        trendDirection === 'up'
          ? 'text-emerald-600'
          : trendDirection === 'down'
          ? 'text-red-600'
          : 'text-gray-500';
      return (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-sm font-medium ${dirClass}`}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : ''} {trend}
          </span>
        </div>
      );
    }

    const numValue = typeof trend.value === 'number' && !isNaN(trend.value) ? Math.abs(trend.value) : 0;
    return (
      <div className="flex items-center gap-1 mt-2">
        <span
          className={`text-sm font-medium ${
            trend.isUp ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {trend.isUp ? '↑' : '↓'} {numValue}%
        </span>
        <span className="text-xs text-gray-400">较昨日</span>
      </div>
    );
  };

  return (
    <div className="card card-hover bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-gray-800">{value}</span>
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </div>
          {renderTrend()}
          {description && (
            <p className="text-xs text-gray-400 mt-2">{description}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
