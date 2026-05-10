import { useDashboardData } from '../hooks/useDashboardData';
import { SummaryCards } from '../components/SummaryCards';
import { RevenueChart } from '../components/RevenueChart';
import { RecentOrders } from '../components/RecentOrders';
import { ProductCatalog } from '../components/ProductCatalog';
import { Loader2 } from 'lucide-react';

function SellerDashboard() {
  const { influencer, summary, revenueChart, recentOrders, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-surface-950">
        <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
        <p className="text-surface-400 font-bold animate-pulse">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-12 sm:py-16 flex flex-col gap-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl mb-4 tracking-tight">
              안녕하세요, <span className="text-gradient">{influencer?.name}</span>님 👋
            </h1>
            <p className="text-lg text-surface-400 font-medium">오늘도 성공적인 판매를 응원합니다!</p>
          </div>
          <div className="flex items-center gap-3 glass-light rounded-2xl px-5 py-3 shadow-premium-md">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-white/80">실시간 연동 중</span>
          </div>
        </header>

        {/* 상단 요약 카드 */}
        <div className="animate-fade-in duration-700">
          <SummaryCards summary={summary} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 수익 차트 (2컬럼 차지) */}
          <div className="lg:col-span-2 animate-fade-in-up duration-700">
            <RevenueChart data={revenueChart} />
          </div>

          {/* 최근 주문 (1컬럼 차지) */}
          <div className="lg:col-span-1 animate-fade-in-up duration-1000">
            <RecentOrders orders={recentOrders} />
          </div>
        </div>

        {/* 상품 카탈로그 */}
        <div className="animate-fade-in-up duration-1000">
          <ProductCatalog influencer={influencer} />
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
