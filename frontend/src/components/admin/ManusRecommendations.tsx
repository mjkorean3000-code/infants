import { Sparkles, TrendingUp, ChevronRight } from 'lucide-react';

export const ManusRecommendations = () => {
  const recommendations = [
    { id: 1, title: '초경량 여름 쿨토시', reason: '여름 시즌 검색량 300% 급증', badge: '급상승' },
    { id: 2, 단가: '1,500원', title: '휴대용 미니 선풍기 PRO', reason: '틱톡 숏폼 바이럴 아이템', badge: '바이럴' },
    { id: 3, 단가: '4,200원', title: '친환경 실리콘 텀블러', reason: '2030 직장인 타겟 구매전환율 높음', badge: '꾸준함' }
  ];

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
          <Sparkles size={16} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">마누스(Manus) AI 추천 트렌드</h3>
      </div>
      
      <p className="mb-6 text-sm text-gray-600">
        AI가 실시간 소셜 미디어 트렌드와 커머스 검색량을 분석하여 발굴한 차세대 히트 상품 후보군입니다.
      </p>

      <div className="flex flex-col gap-3">
        {recommendations.map((item) => (
          <div key={item.id} className="group flex cursor-pointer items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp size={20} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{item.title}</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    {item.badge}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{item.reason}</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
          </div>
        ))}
      </div>
      
      <button className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-600 shadow-sm border border-blue-100 transition-colors hover:bg-blue-50">
        추천 아이템 공장에 소싱 요청하기
      </button>
    </div>
  );
};
