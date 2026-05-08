import { useState } from 'react';
import { Copy, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  influencer: DashboardData['influencer'];
}

export const PromoLinkCard = ({ influencer }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!influencer?.tracking_link) return;
    const fullLink = influencer.tracking_link.startsWith('http') 
      ? influencer.tracking_link 
      : `https://onfans.vercel.app/store/${influencer.tracking_link}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">내 홍보용 단축 링크</h3>
        <p className="text-sm text-gray-500">
          이 링크를 통해 발생한 주문에 대해 <b className="text-gray-900 font-semibold">{influencer?.settlement_rate}%</b>의 수수료가 정산됩니다.
        </p>
      </div>

      <div className="mt-auto flex items-center rounded-xl border border-gray-200 bg-bg-base px-4 py-3">
        <LinkIcon size={16} className="mr-2 text-gray-400 shrink-0" />
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-primary">
          {influencer?.tracking_link 
            ? (influencer.tracking_link.startsWith('http') ? influencer.tracking_link : `https://onfans.vercel.app/store/${influencer.tracking_link}`)
            : '링크 생성 중...'}
        </span>
      </div>

      <button 
        onClick={handleCopy}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-primary-hover active:bg-blue-700"
      >
        {copied ? (
          <>
            <CheckCircle2 size={18} />
            복사 완료!
          </>
        ) : (
          <>
            <Copy size={18} />
            링크 복사하기
          </>
        )}
      </button>
    </div>
  );
};
