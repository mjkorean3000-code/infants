import type { AdminData } from '../../hooks/useAdminData';

interface Props {
  settlements: AdminData['settlements'];
}

export const SettlementReport = ({ settlements }: Props) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">이번 주 정산 리포트</h3>
        <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50">
          전체 다운로드 (CSV)
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">구분</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">대상명</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">지급액</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {settlements.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  {s.targetType === 'factory' ? (
                    <span className="rounded bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">공장</span>
                  ) : (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">셀러</span>
                  )}
                </td>
                <td className="px-4 py-4 font-medium text-gray-900">{s.targetName}</td>
                <td className="px-4 py-4 font-bold text-gray-900">{s.amount.toLocaleString()}원</td>
                <td className="px-4 py-4">
                  {s.status === 'pending' ? (
                    <span className="text-sm font-medium text-orange-600">지급 대기</span>
                  ) : (
                    <span className="text-sm font-medium text-green-600">지급 완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
