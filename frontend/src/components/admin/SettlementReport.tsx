import type { AdminData } from '../../hooks/useAdminData';

interface Props {
  factorySettlements: AdminData['factorySettlements'];
  influencerSettlements: AdminData['influencerSettlements'];
}

export const SettlementReport = ({ factorySettlements, influencerSettlements }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. 공장 정산 리포트 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">공장 지급 정산 리포트</h3>
          <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50">
            다운로드 (CSV)
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-semibold text-gray-600">공장명</th>
                <th className="px-4 py-3 font-semibold text-gray-600">상품명</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">판매 수량</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">공급 단가</th>
                <th className="px-4 py-3 font-bold text-gray-900 text-right">총 지급액</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {factorySettlements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">정산 내역이 없습니다.</td>
                </tr>
              ) : (
                factorySettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-bold text-gray-900">{s.factoryName}</td>
                    <td className="px-4 py-4 text-gray-700">{s.productName}</td>
                    <td className="px-4 py-4 text-right text-gray-700">{s.salesCount}개</td>
                    <td className="px-4 py-4 text-right text-gray-700">{s.supplyPrice.toLocaleString()}원</td>
                    <td className="px-4 py-4 text-right font-bold text-blue-600">{s.totalAmount.toLocaleString()}원</td>
                    <td className="px-4 py-4 text-center">
                      {s.status === 'pending' ? (
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">지급 대기</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">지급 완료</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 인플루언서 정산 리포트 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">셀러(인플루언서) 수익 정산 리포트</h3>
          <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50">
            다운로드 (CSV)
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-semibold text-gray-600">셀러명 (고유코드)</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">총 판매 수량</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">총 결제 금액</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right">- 공장 지급금</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-right">- 플랫폼 수수료</th>
                <th className="px-4 py-3 font-semibold text-red-500 text-right">- 원천징수 (3.3%)</th>
                <th className="px-4 py-3 font-bold text-gray-900 text-right">최종 지급액</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {influencerSettlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">정산 내역이 없습니다.</td>
                </tr>
              ) : (
                influencerSettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-bold text-gray-900">
                      {s.influencerName} <span className="text-gray-400 font-normal">({s.trackingCode})</span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700">{s.salesCount}건</td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">{s.totalSalesAmount.toLocaleString()}원</td>
                    <td className="px-4 py-4 text-right text-gray-500">-{s.factoryPayment.toLocaleString()}원</td>
                    <td className="px-4 py-4 text-right text-gray-500">-{s.platformFee.toLocaleString()}원</td>
                    <td className="px-4 py-4 text-right text-red-500">-{Math.floor(s.taxAmount).toLocaleString()}원</td>
                    <td className="px-4 py-4 text-right font-extrabold text-blue-600">
                      {Math.floor(s.finalAmount).toLocaleString()}원
                    </td>
                    <td className="px-4 py-4 text-center">
                      {s.status === 'pending' ? (
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">지급 대기</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">지급 완료</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
          <p><strong>* 인플루언서 최종 지급액 계산식:</strong> (총 결제 금액 - 공장 지급금 - 플랫폼 수수료) - 3.3% 사업소득세</p>
        </div>
      </div>
    </div>
  );
};
