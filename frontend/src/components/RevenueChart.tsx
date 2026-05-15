import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  data: DashboardData['revenueChart'];
}

export const RevenueChart = ({ data }: Props) => {
  const hasData = data.some(d => d.revenue > 0);

  return (
    <div className="flex h-full min-h-[280px] sm:min-h-[400px] flex-col rounded-2xl sm:rounded-[2rem] glass p-5 sm:p-8 shadow-premium-lg">
      <div className="mb-5 sm:mb-8 flex items-center justify-between">
        <h3 className="text-base sm:text-xl font-bold text-white">최근 7일 수익 추이</h3>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            <span className="text-xs font-bold text-surface-400">판매 수익</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-surface-400 font-bold text-sm">아직 판매 데이터가 없어요</p>
          <p className="text-surface-600 text-xs">첫 주문이 들어오면 차트가 바로 업데이트됩니다!</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 90%, 56%)" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="hsl(221, 90%, 56%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }}
                tickFormatter={(value) => value === 0 ? '0' : `${(value / 10000).toFixed(0)}만`}
                width={46}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 14px',
                }}
                formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '수익']}
                labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontWeight: 600 }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(221, 90%, 56%)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                animationDuration={1200}
                dot={{ fill: 'hsl(221, 90%, 56%)', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'hsl(221, 90%, 56%)', strokeWidth: 2, stroke: 'rgba(255,255,255,0.3)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
