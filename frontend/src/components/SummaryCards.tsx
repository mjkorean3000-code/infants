import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, ArrowUpRight, Minus } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  summary: DashboardData['summary'];
}

export const SummaryCards = ({ summary }: Props) => {
  const { totalSalesMonth, estimatedProfit, newOrdersToday, monthOverMonthPct, dayOverDayDiff } = summary;

  // 전월 대비 뱃지 렌더링
  const renderMonthBadge = () => {
    if (monthOverMonthPct === null) {
      return (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-surface-500 bg-surface-800/60 w-fit px-3 py-1.5 rounded-full">
          <Minus size={13} />
          <span>전월 데이터 없음</span>
        </div>
      );
    }
    const pct = Math.abs(monthOverMonthPct).toFixed(1);
    if (monthOverMonthPct >= 0) {
      return (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 w-fit px-3 py-1.5 rounded-full border border-green-400/20">
          <TrendingUp size={13} />
          <span>전월 대비 {pct}% 증가</span>
        </div>
      );
    }
    return (
      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-400/10 w-fit px-3 py-1.5 rounded-full border border-red-400/20">
        <TrendingDown size={13} />
        <span>전월 대비 {pct}% 감소</span>
      </div>
    );
  };

  // 어제 대비 뱃지 렌더링
  const renderDayBadge = () => {
    if (dayOverDayDiff === null) {
      return (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-surface-500 bg-surface-800/60 w-fit px-3 py-1.5 rounded-full">
          <Minus size={13} />
          <span>어제 데이터 없음</span>
        </div>
      );
    }
    if (dayOverDayDiff > 0) {
      return (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 w-fit px-3 py-1.5 rounded-full border border-green-400/20">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span>어제보다 {dayOverDayDiff}건 더 많아요!</span>
        </div>
      );
    }
    if (dayOverDayDiff < 0) {
      return (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-400/10 w-fit px-3 py-1.5 rounded-full border border-orange-400/20">
          <TrendingDown size={13} />
          <span>어제보다 {Math.abs(dayOverDayDiff)}건 적어요</span>
        </div>
      );
    }
    return (
      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-surface-400 bg-surface-800/60 w-fit px-3 py-1.5 rounded-full">
        <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
        <span>오늘도 화이팅!</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">

      {/* 카드 1: 이번 달 총 판매액 */}
      <div className="group flex flex-col gap-4 rounded-2xl sm:rounded-[2rem] glass p-5 sm:p-8 shadow-premium-lg transition-all duration-300 hover:bg-surface-900/60 hover-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShoppingCart size={72} />
        </div>
        <div className="flex items-center justify-between relative">
          <span className="text-xs sm:text-sm font-bold text-surface-400">이번 달 총 판매액</span>
          <div className="rounded-xl sm:rounded-2xl bg-brand-500/10 p-2.5 sm:p-3 text-brand-500 shadow-premium-sm flex-shrink-0">
            <ShoppingCart size={18} />
          </div>
        </div>
        <div className="relative">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight break-all">
            {totalSalesMonth.toLocaleString()}원
          </div>
          {renderMonthBadge()}
        </div>
      </div>

      {/* 카드 2: 예상 수익금 */}
      <div className="group flex flex-col gap-4 rounded-2xl sm:rounded-[2rem] glass p-5 sm:p-8 shadow-premium-lg transition-all duration-300 hover:bg-surface-900/60 hover-lift relative overflow-hidden bg-brand-500/5 border-brand-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign size={72} />
        </div>
        <div className="flex items-center justify-between relative">
          <span className="text-xs sm:text-sm font-bold text-brand-300">내 예상 수익금 (정산 예정)</span>
          <div className="rounded-xl sm:rounded-2xl bg-brand-500 p-2.5 sm:p-3 text-white shadow-premium-lg flex-shrink-0">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="relative">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight break-all">
            {estimatedProfit.toLocaleString()}원
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-300">
            <span>다음 달 10일 정산 예정</span>
            <ArrowUpRight size={13} className="opacity-60" />
          </div>
        </div>
      </div>

      {/* 카드 3: 오늘 신규 주문 */}
      <div className="group flex flex-col gap-4 rounded-2xl sm:rounded-[2rem] glass p-5 sm:p-8 shadow-premium-lg transition-all duration-300 hover:bg-surface-900/60 hover-lift relative overflow-hidden sm:col-span-2 md:col-span-1">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShoppingCart size={72} />
        </div>
        <div className="flex items-center justify-between relative">
          <span className="text-xs sm:text-sm font-bold text-surface-400">오늘 신규 주문 수</span>
          <div className="rounded-xl sm:rounded-2xl bg-orange-500/10 p-2.5 sm:p-3 text-orange-500 shadow-premium-sm flex-shrink-0">
            <ShoppingCart size={18} />
          </div>
        </div>
        <div className="relative">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            {newOrdersToday}건
          </div>
          {renderDayBadge()}
        </div>
      </div>

    </div>
  );
};
