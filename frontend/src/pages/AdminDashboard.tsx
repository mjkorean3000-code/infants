import { InfluencerManagement } from '../components/admin/InfluencerManagement';
import { ProductManagement } from '../components/admin/ProductManagement';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function AdminDashboard() {
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-surface-950">
        <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
        <p className="text-surface-400 font-bold animate-pulse">관리자 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-12 sm:py-16 flex flex-col gap-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-2 shadow-premium-lg">
                <img src="/logo.png" alt="ONFANS" className="h-10 w-10 object-contain" />
              </div>
              <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight">
                온팬즈 <span className="text-gradient">통합 관리자</span>
              </h1>
              <span className="rounded-full bg-white/10 border border-white/10 px-4 py-1 text-[10px] font-black text-white tracking-widest uppercase mt-2">
                System Admin
              </span>
            </div>
            <p className="text-lg text-surface-400 font-medium">전체 플랫폼 현황 및 승인, 정산을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-3 glass-light rounded-2xl px-5 py-3 shadow-premium-md">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm font-bold text-white/80">시스템 모니터링 활성</span>
          </div>
        </header>

        <div className="flex flex-col gap-12 animate-fade-in duration-700">
          <InfluencerManagement />
          <ProductManagement />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
