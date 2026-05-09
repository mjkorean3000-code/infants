import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Copy, CheckCircle2 } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface Product {
  id: string;
  name: string;
  description: string;
  seller_price: number;
  image_urls: string[];
}

interface Props {
  influencer: DashboardData['influencer'];
}

export function ProductCatalog({ influencer }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // 목업 데이터
        setProducts([
          {
            id: 'mock-123',
            name: '프리미엄 오버핏 헤비 쭈리 맨투맨',
            description: '탄탄한 중량감과 완벽한 핏을 자랑하는 남녀공용 오버핏 맨투맨입니다.',
            seller_price: 39000,
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

  const handleCopyLink = (productId: string) => {
    if (!influencer?.tracking_link) {
      alert('고유 코드를 불러올 수 없습니다. 관리자에게 문의해주세요.');
      return;
    }

    const link = `https://onfans.club/product/${productId}/${influencer.tracking_link}`;
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900">판매 가능 상품 카탈로그</h2>
        <p className="text-sm text-gray-500 mt-1">마음에 드는 상품의 링크를 복사해서 바로 판매를 시작해보세요!</p>
      </div>

      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            현재 판매 가능한 상품이 없습니다. 곧 더 많은 상품이 추가될 예정입니다!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const myCommission = product.seller_price * ((influencer?.settlement_rate || 0) / 100);
              
              return (
                <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    {product.image_urls?.[0] ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200"></div>
                    )}
                  </div>
                  
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-lg font-extrabold text-black mb-3">{product.seller_price.toLocaleString()}원</p>
                    
                    <div className="mt-auto mb-4 inline-flex w-fit items-center rounded-lg bg-blue-50 px-3 py-1.5">
                      <span className="text-xs font-bold text-blue-700">예상 수익금: 건당 {Math.floor(myCommission).toLocaleString()}원</span>
                    </div>

                    <div className="mb-4 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">고유 판매 링크</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={`https://onfans.club/product/${product.id}/${influencer?.tracking_link || ''}`}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={() => handleCopyLink(product.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                        copiedId === product.id
                          ? 'bg-green-500 text-white'
                          : 'bg-black text-white hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      {copiedId === product.id ? (
                        <>
                          <CheckCircle2 size={16} />
                          복사 완료!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          내 수익 링크 복사
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
