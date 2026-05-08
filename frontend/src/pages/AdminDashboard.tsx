import { useAdminData } from '../hooks/useAdminData';
import { SettlementReport } from '../components/admin/SettlementReport';
import { ProductManagement } from '../components/admin/ProductManagement';
import { InfluencerManagement } from '../components/admin/InfluencerManagement';
import { Loader2 } from 'lucide-react';

function AdminDashboard() {
  const { data } = useAdminData();

  if (data.loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">온팬즈 통합 관리자</h1>
            <span className="rounded-md bg-gray-900 px-2 py-1 text-xs font-bold text-white">ADMIN</span>
          </div>
          <p className="text-sm sm:text-base text-gray-500">전체 플랫폼 현황 및 승인, 정산을 관리합니다.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* 중앙 메인 영역 */}
        <div className="flex flex-col gap-6">
          <InfluencerManagement />
          <ProductManagement />
          <SettlementReport 
            factorySettlements={data.factorySettlements} 
            influencerSettlements={data.influencerSettlements} 
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
