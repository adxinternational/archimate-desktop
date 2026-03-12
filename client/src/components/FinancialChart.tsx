import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '@/components/ui/card';

interface DataPoint {
  month: string;
  revenue?: number;
  costs?: number;
  margin?: number;
  profit?: number;
}

interface FinancialChartProps {
  data: DataPoint[];
  title: string;
  type?: 'area' | 'bar' | 'line';
  height?: number;
}

export function FinancialChart({
  data,
  title,
  type = 'area',
  height = 300,
}: FinancialChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenus" />
            <Bar dataKey="costs" fill="#ef4444" name="Coûts" />
            <Bar dataKey="margin" fill="#10b981" name="Marge" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenus" strokeWidth={2} />
            <Line type="monotone" dataKey="costs" stroke="#ef4444" name="Coûts" strokeWidth={2} />
            <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" strokeWidth={2} />
          </LineChart>
        );
      default:
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenus"
            />
            <Area
              type="monotone"
              dataKey="costs"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorCosts)"
              name="Coûts"
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </Card>
  );
}
