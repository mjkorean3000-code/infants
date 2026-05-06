import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  summary: DashboardData['summary'];
}

export const SummaryCards = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
      
      {/* 카드 1 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-medium text-gray-600">이번 달 총 판매액</span>
          <div className="rounded-xl bg-primary-light p-2 text-primary">
            <ShoppingCart size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
          {summary.totalSalesMonth.toLocaleString()}원
        </div>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-success">
          <TrendingUp size={14} />
          <span>전월 대비 12% 증가</span>
        </div>
      </div>

      {/* 카드 2 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-medium text-gray-600">내 예상 수익금 (정산 예정)</span>
          <div className="rounded-xl bg-success-light p-2 text-success">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-primary">
          {summary.estimatedProfit.toLocaleString()}원
        </div>
        <div className="text-xs sm:text-sm font-medium text-gray-400">
          다음 달 10일 정산 예정
        </div>
      </div>

      {/* 카드 3 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-medium text-gray-600">오늘 신규 주문 수</span>
          <div className="rounded-xl bg-warning-light p-2 text-warning">
            <ShoppingCart size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
          {summary.newOrdersToday}건
        </div>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-success">
          <TrendingUp size={14} />
          <span>어제보다 3건 더 많아요!</span>
        </div>
      </div>

    </div>
  );
};
