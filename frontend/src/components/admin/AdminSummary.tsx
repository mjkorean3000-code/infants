import { DollarSign, Factory, Users, AlertCircle } from 'lucide-react';
import type { AdminData } from '../../hooks/useAdminData';

interface Props {
  summary: AdminData['summary'];
}

export const AdminSummary = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">전체 플랫폼 GMV</span>
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
          {(summary.totalGmv / 100000000).toFixed(1)}억 원
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">활성 공장 수</span>
          <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
            <Factory size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
          {summary.activeFactories}개
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">활성 셀러 수</span>
          <div className="rounded-xl bg-green-50 p-2 text-green-600">
            <Users size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
          {summary.activeSellers}명
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm border-l-4 border-l-red-500">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-red-600">미처리 발주 건수</span>
          <div className="rounded-xl bg-red-50 p-2 text-red-600">
            <AlertCircle size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-red-600">
          {summary.pendingOrders}건
        </div>
      </div>

    </div>
  );
};
