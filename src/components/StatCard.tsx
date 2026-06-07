import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
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

const bgColorClasses = {
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  yellow: 'bg-amber-50 text-amber-600',
  purple: 'bg-violet-50 text-violet-600',
  red: 'bg-red-50 text-red-600',
};

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = 'green',
  description,
}: StatCardProps) {
  return (
    <div className="card card-hover bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-gray-800">{value}</span>
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isUp ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400">较昨日</span>
            </div>
          )}
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
