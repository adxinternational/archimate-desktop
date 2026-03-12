import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700',
};

const iconBgClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
  purple: 'bg-purple-100',
};

export function KPICard({
  title,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  description,
  onClick,
  className = '',
  color = 'blue',
}: KPICardProps) {
  const isTrendPositive = trend && trend > 0;

  return (
    <Card
      onClick={onClick}
      className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              {isTrendPositive ? (
                <ArrowUpRight size={16} className="text-green-600" />
              ) : (
                <ArrowDownRight size={16} className="text-red-600" />
              )}
              <span className={`text-sm font-medium ${isTrendPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-muted-foreground">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          <div className="text-2xl">{icon}</div>
        </div>
      </div>
    </Card>
  );
}
