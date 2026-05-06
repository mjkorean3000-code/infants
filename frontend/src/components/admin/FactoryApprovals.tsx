import { Check, Clock } from 'lucide-react';
import type { AdminData } from '../../hooks/useAdminData';

interface Props {
  approvals: AdminData['factoryApprovals'];
  onApprove: (id: string) => void;
}

export const FactoryApprovals = ({ approvals, onApprove }: Props) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">신규 공장 입점 신청</h3>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
          대기 {approvals.filter(a => a.status === 'pending').length}건
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {approvals.length === 0 ? (
          <div className="py-8 text-center text-gray-400">대기 중인 신청이 없습니다.</div>
        ) : (
          approvals.map(factory => (
            <div key={factory.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{factory.name}</span>
                  {factory.status === 'pending' ? (
                    <span className="flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                      <Clock size={12} /> 대기중
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      <Check size={12} /> 승인완료
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">연락처: {factory.contactInfo} | 신청일: {factory.requestDate}</span>
              </div>
              
              {factory.status === 'pending' && (
                <button 
                  onClick={() => onApprove(factory.id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
                >
                  승인
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
