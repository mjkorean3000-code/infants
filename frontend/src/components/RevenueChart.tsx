import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  data: DashboardData['revenueChart'];
}

export const RevenueChart = ({ data }: Props) => {
  return (
    <div className="flex h-full min-h-[350px] sm:min-h-[450px] flex-col rounded-[2rem] glass p-8 shadow-premium-lg">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">최근 7일 수익 추이</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-brand-500" />
            <span className="text-xs font-bold text-surface-400">판매 수익</span>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 90%, 56%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(221, 90%, 56%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
              tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`}
              width={60}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                fontSize: '14px',
                fontWeight: 700,
                padding: '12px 16px'
              }}
              formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '수익']}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontWeight: 600 }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(221, 90%, 56%)" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
