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
    <div className="min-h-dvh bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white">
      {/* 모바일 최적화된 상단 내비 */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-surface-950/80 backdrop-blur-xl px-5 py-4 border-b border-white/5 lg:hidden">
        <img src="/logo.jpg" alt="ONFANS" className="h-7 object-contain" />
        <div className="flex items-center gap-2 glass-light rounded-xl px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Live</span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 pt-24 sm:px-12 sm:py-16 sm:pt-16 flex flex-col gap-6 sm:gap-12">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-4xl lg:text-5xl mb-1.5 sm:mb-3 tracking-tight leading-tight">
              안녕하세요,<br className="sm:hidden" /> <span className="text-gradient">{influencer?.name}</span>님 👋
            </h1>
            <p className="text-sm text-surface-400 font-medium sm:text-lg">성공적인 판매를 위해 온팬즈가 함께합니다.</p>
          </div>
          {/* Live 뱃지는 모바일 내비로 이동 → 데스크탑에서만 표시 */}
          <div className="hidden sm:flex items-center gap-3 glass-light rounded-2xl px-5 py-3 shadow-premium-md self-start sm:self-auto">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-black text-white/80 uppercase tracking-widest">Live Syncing</span>
          </div>
        </header>

        {/* 요약 카드 */}
        <div className="animate-fade-in duration-700">
          <SummaryCards summary={summary} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-10">
          {/* 수익 차트 */}
          <div className="lg:col-span-2 animate-fade-in-up duration-700">
            <RevenueChart data={revenueChart} />
          </div>

          {/* 최근 주문 */}
          <div className="lg:col-span-1 animate-fade-in-up duration-1000">
            <RecentOrders orders={recentOrders} />
          </div>
        </div>

        {/* 상품 카탈로그 */}
        <div className="animate-fade-in-up duration-1000 mb-10">
          <ProductCatalog influencer={influencer} />
        </div>
      </div>
    </div>
  );

}

export default SellerDashboard;
// build trigger Wed May 13 17:10:10 KST 2026
