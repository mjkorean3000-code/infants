import { useDashboardData } from '../hooks/useDashboardData';
import { SummaryCards } from '../components/SummaryCards';
import { PromoLinkCard } from '../components/PromoLinkCard';
import { RevenueChart } from '../components/RevenueChart';
import { RecentOrders } from '../components/RecentOrders';
import { ProductCatalog } from '../components/ProductCatalog';
import { Loader2 } from 'lucide-react';

function SellerDashboard() {
  const { influencer, summary, revenueChart, recentOrders, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-base">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-bg-base min-h-screen flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">안녕하세요, {influencer?.name}님 👋</h1>
          <p className="text-sm sm:text-base text-gray-500">오늘도 성공적인 판매를 응원합니다!</p>
        </div>
      </header>

      {/* 상단 요약 카드 (모바일 1열, 태블릿 3열) */}
      <SummaryCards summary={summary} />

      {/* 중간 영역: 수익 차트 & 프로모션 링크 (모바일 1열, 데스크탑 2:1 비율) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChart} />
        </div>
        <div className="lg:col-span-1">
          <PromoLinkCard influencer={influencer} />
        </div>
      </div>

      {/* 메인 영역: 상품 카탈로그 (링크 자동 생성) */}
      <ProductCatalog influencer={influencer} />

      {/* 하단 최근 주문 테이블 */}
      <RecentOrders orders={recentOrders} />
    </div>
  );
}

export default SellerDashboard;
