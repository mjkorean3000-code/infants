import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Copy, CheckCircle2, ExternalLink, Sparkles, X, ShieldCheck } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface Product {
  id: string;
  name: string;
  description: string;
  seller_price: number;
  factory_cost: number;
  image_urls: string[];
}

interface Props {
  influencer: DashboardData['influencer'];
}

// ─── 광고 고지 모달 ────────────────────────────────────────────────────────────
function AdDisclosureModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center px-0 sm:px-4"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* 모달 본체 */}
      <div
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-surface-900 border border-white/10 shadow-premium-xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400">
              <ShieldCheck size={20} />
            </div>
            <p className="font-black text-white text-base">수익 링크 공유 전, 꼭 확인하세요!</p>
          </div>
          <button onClick={onClose} className="text-surface-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-6 flex flex-col gap-4">
          <p className="text-sm text-surface-300 leading-relaxed">
            📢 해당 링크는 <strong className="text-white">수익이 발생하는 광고 링크</strong>입니다.<br />
            아래 사항을 반드시 지켜주세요.
          </p>

          <div className="flex flex-col gap-3">
            {/* 유료광고 표시 의무 */}
            <div className="flex gap-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 p-4">
              <span className="text-lg flex-shrink-0">✅</span>
              <div>
                <p className="text-sm font-black text-white mb-1">유료광고 표시 의무</p>
                <p className="text-xs text-surface-400 leading-relaxed">
                  게시물 상단에 <span className="text-brand-300 font-bold">"유료광고", "광고", "협찬"</span> 등의 문구를 눈에 잘 띄게 표시해야 합니다.
                </p>
              </div>
            </div>

            {/* 허위·과장 광고 금지 */}
            <div className="flex gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
              <span className="text-lg flex-shrink-0">🚫</span>
              <div>
                <p className="text-sm font-black text-white mb-1">허위·과장 광고 금지</p>
                <p className="text-xs text-surface-400 leading-relaxed">
                  실제 경험하지 않은 효과, 과장된 수익 후기, 사실과 다른 정보를 게재하면{' '}
                  <span className="text-red-400 font-bold">표시광고법 위반</span>으로 제재를 받을 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-surface-500 text-center leading-relaxed">
            위반 시 과태료 및 법적 제재를 받을 수 있으니<br />
            올바른 광고 문화를 함께 만들어 주세요 🙏
          </p>
        </div>

        {/* 확인 버튼 */}
        <div className="px-6 pb-6 sm:pb-6">
          <button
            onClick={onConfirm}
            className="w-full rounded-2xl bg-brand-500 py-4 text-sm font-black text-white shadow-premium-lg hover:bg-brand-400 active:scale-95 transition-all duration-200"
          >
            확인했습니다 — 링크 복사하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────────────────
export function ProductCatalog({ influencer }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 광고 고지 모달 상태
  const [modalProductId, setModalProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        setProducts([
          {
            id: 'mock-123',
            name: '프리미엄 오버핏 헤비 쭈리 맨투맨',
            description: '탄탄한 중량감과 완벽한 핏을 자랑하는 남녀공용 오버핏 맨투맨입니다.',
            seller_price: 39000,
            factory_cost: 20000,
            image_urls: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800&h=800']
          }
        ]);
        setLoading(false);
        return;
      }
      
      const categoryCond = `category.eq.${influencer?.category || 'fashion'}`;
      const manualCond = influencer?.id ? `assigned_influencer_ids.cs.{${influencer.id}}` : `assigned_influencer_ids.cs.{}`;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .or(`${categoryCond},${manualCond}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data as Product[]);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 클릭 시 → 모달 먼저 표시
  const handleCopyLinkClick = (productId: string) => {
    if (!influencer?.tracking_link) {
      alert('고유 코드를 불러올 수 없습니다. 관리자에게 문의해주세요.');
      return;
    }
    setModalProductId(productId);
  };

  // 모달에서 "확인했습니다" 클릭 → 실제 링크 복사
  const handleConfirmAndCopy = () => {
    if (!modalProductId || !influencer?.tracking_link) return;
    const link = `https://onfans.club/product/${modalProductId}/${influencer.tracking_link}`;
    navigator.clipboard.writeText(link);
    setCopiedId(modalProductId);
    setModalProductId(null);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center glass rounded-[2rem]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-500" size={32} />
          <p className="text-sm font-bold text-surface-400">상품을 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 광고 고지 모달 */}
      {modalProductId && (
        <AdDisclosureModal
          onConfirm={handleConfirmAndCopy}
          onClose={() => setModalProductId(null)}
        />
      )}

      <div className="rounded-[2.5rem] glass overflow-hidden shadow-premium-xl border-white/5">
        <div className="border-b border-white/5 bg-white/5 px-8 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-brand-400" />
              <h2 className="text-2xl font-black text-white tracking-tight">판매 가능 상품 카탈로그</h2>
            </div>
            <p className="text-surface-400 font-medium">마음에 드는 상품의 링크를 복사해서 바로 판매를 시작해보세요!</p>
          </div>
          <div className="hidden sm:block">
            <div className="rounded-full bg-brand-500/10 border border-brand-500/20 px-4 py-2 text-xs font-bold text-brand-400">
              총 {products.length}개의 상품
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 rounded-full bg-surface-900 flex items-center justify-center mb-6">
                <Sparkles className="text-surface-600" size={32} />
              </div>
              <p className="text-surface-400 font-bold text-lg">현재 판매 가능한 상품이 없습니다.</p>
              <p className="text-surface-500 text-sm mt-2">곧 더 많은 상품이 추가될 예정입니다!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const margin = product.seller_price - (product.factory_cost || 0);
                const myCommission = margin * ((influencer?.settlement_rate || 0) / 100);
                
                return (
                  <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-surface-900/40 border border-white/5 transition-all duration-300 hover:border-brand-500/30 hover:bg-surface-900/80 shadow-premium-md hover:shadow-premium-lg">
                    <div className="aspect-[4/5] w-full overflow-hidden bg-surface-800 relative">
                      {product.image_urls?.[0] ? (
                        <img 
                          src={product.image_urls[0]} 
                          alt={product.name} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Sparkles className="text-surface-700" size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
                          New Arrival
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-bold text-white text-lg line-clamp-1 mb-2 group-hover:text-brand-400 transition-colors">{product.name}</h3>
                      <p className="text-xl font-black text-white mb-5">{product.seller_price.toLocaleString()}원</p>
                      
                      <div className="mb-6 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-surface-400">예상 수익 (건당)</span>
                          <span className="text-brand-400">수수료 {((influencer?.settlement_rate || 0))}% 적용</span>
                        </div>
                        <div className="w-full h-12 flex items-center px-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                          <span className="text-sm font-black text-brand-400">{Math.floor(myCommission).toLocaleString()}원</span>
                        </div>
                      </div>

                      <div className="mt-auto space-y-3">
                        <button 
                          onClick={() => handleCopyLinkClick(product.id)}
                          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black transition-all duration-300 ${
                            copiedId === product.id
                              ? 'bg-green-500 text-white shadow-green-500/20'
                              : 'bg-white text-black hover:bg-brand-500 hover:text-white shadow-premium-md'
                          }`}
                        >
                          {copiedId === product.id ? (
                            <>
                              <CheckCircle2 size={18} />
                              수익 링크 복사됨!
                            </>
                          ) : (
                            <>
                              <Copy size={18} />
                              내 수익 링크 복사
                            </>
                          )}
                        </button>
                        <a 
                          href={`https://onfans.club/product/${product.id}/${influencer?.tracking_link || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-surface-400 border border-white/5 hover:bg-white/5 transition-all"
                        >
                          <ExternalLink size={18} />
                          페이지 미리보기
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
