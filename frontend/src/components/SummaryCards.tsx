import { DollarSign, ShoppingCart, TrendingUp, ArrowUpRight } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  summary: DashboardData['summary'];
}

export const SummaryCards = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      
      {/* 카드 1: 이번 달 총 판매액 */}
      <div className="group flex flex-col gap-5 rounded-[2rem] glass p-8 shadow-premium-lg transition-all duration-300 hover:bg-surface-900/60 hover-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShoppingCart size={80} />
        </div>
        <div className="flex items-center justify-between relative">
          <span className="text-sm font-bold text-surface-400">이번 달 총 판매액</span>
          <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-500 shadow-premium-sm">
            <ShoppingCart size={22} />
          </div>
        </div>
        <div className="relative">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {summary.totalSalesMonth.toLocaleString()}원
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-sm font-bold text-green-400 bg-green-400/10 w-fit px-3 py-1 rounded-full border border-green-400/20">
            <TrendingUp size={16} />
            <span>전월 대비 12.5% 증가</span>
          </div>
        </div>
      </div>

      {/* 카드 2: 예상 수익금 */}
      <div className="group flex flex-col gap-5 rounded-[2rem] glass p-8 shadow-premium-lg transition-all duration-300 hover:bg-surface-900/60 hover-lift relative overflow-hidden bg-brand-500/5 border-brand-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign size={80} />
        </div>
        <div className="flex items-center justify-between relative">
          <span className="text-sm font-bold text-brand-300">내 예상 수익금 (정산 예정)</span>
          <div className="rounded-2xl bg-brand-500 p-3 text-white shadow-premium-lg">
            <DollarSign size={22} />
          </div>
        </div>
        <div className="relative">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {summary.estimatedProfit.toLocaleString()}원
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-sm font-bold text-brand-300">
            <span>다음 달 10일 정산 예정</span>
            <ArrowUpRight size={14} className="opacity-60" />
          </div>
        </div>
      </div>

      {/* 카드 3: 오늘 신규 주문 */}
      <div className="group flex flex-col gap-5 rounded-[2rem] glass p-8 shadow-premium-lg transition-all duration-300 hover:bg-surface-900/60 hover-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShoppingCart size={80} />
        </div>
        <div className="flex items-center justify-between relative">
          <span className="text-sm font-bold text-surface-400">오늘 신규 주문 수</span>
          <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-500 shadow-premium-sm">
            <ShoppingCart size={22} />
          </div>
        </div>
        <div className="relative">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {summary.newOrdersToday}건
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-sm font-bold text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>어제보다 3건 더 많아요!</span>
          </div>
        </div>
      </div>

    </div>
  );
};
