import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  data: DashboardData['revenueChart'];
}

export const RevenueChart = ({ data }: Props) => {
  return (
    <div className="flex h-full min-h-[320px] sm:min-h-[400px] flex-col rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
      <h3 className="mb-6 text-lg font-bold text-gray-900">최근 7일 수익 추이</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3182f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3182f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8eb" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 13, fill: '#8b95a1' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 13, fill: '#8b95a1' }}
              tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`}
              dx={-10}
              width={50}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '14px',
                fontWeight: 600
              }}
              formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '수익']}
              labelStyle={{ color: '#4e5968', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3182f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
