import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Loader2, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { Footer } from '../components/Footer';

interface ProductData {
  id: string;
  name: string;
  description: string;
  seller_price: number;
  image_urls: string[];
  options: {
    color?: string[];
    size?: string[];
  };
  factory_id?: string;
  status: string;
  factories?: {
    name: string;
  };
  factory_applications?: {
    company_name: string;
  };
}

const MOCK_PRODUCT: ProductData = {
  id: 'mock-123',
  name: '프리미엄 오버핏 헤비 쭈리 맨투맨',
  description: '탄탄한 중량감과 완벽한 핏을 자랑하는 남녀공용 오버핏 맨투맨입니다. 세탁 후에도 변형이 없는 프리미엄 원단을 사용했습니다.',
  seller_price: 39000,
  image_urls: [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800&h=800',
    'https://images.unsplash.com/photo-1578587018452-892bace94f12?auto=format&fit=crop&q=80&w=800&h=800',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800&h=800'
  ],
  options: {
    color: ['블랙', '그레이', '오트밀'],
    size: ['M', 'L', 'XL']
  },
  status: 'active',
  factory_applications: {
    company_name: '신성 어패럴 공장'
  }
};

export default function ProductDetail() {
  const { id, code } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const sellerId = searchParams.get('seller');
    if (sellerId && !code) {
      localStorage.setItem('onfans_seller_id', sellerId);
    }

    const fetchProduct = async () => {
      try {
        if (import.meta.env.VITE_SUPABASE_URL === undefined) {
          if (code) localStorage.setItem('onfans_seller_id', 'mock-influencer-1234');
          setTimeout(() => {
            setProduct(MOCK_PRODUCT);
            setLoading(false);
          }, 800);
          return;
        }

        if (code) {
          const { data: infData } = await supabase
            .from('influencers')
            .select('id')
            .eq('tracking_link', code)
            .single();
            
          if (infData) {
            localStorage.setItem('onfans_seller_id', infData.id);
          }
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        const productData = data as ProductData;

        if (productData.factory_id) {
          const { data: factoryData } = await supabase
            .from('factory_applications')
            .select('company_name')
            .eq('id', productData.factory_id)
            .single();
          
          if (factoryData) {
            productData.factory_applications = factoryData;
          }
        }

        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, code, searchParams]);

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.image_urls.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.image_urls.length) % product.image_urls.length);
  };

  const handleCheckout = () => {
    if (product?.options?.color && !selectedColor) {
      alert('색상을 선택해주세요.');
      return;
    }
    if (product?.options?.size && !selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    const sellerId = localStorage.getItem('onfans_seller_id');

    navigate('/checkout', {
      state: {
        product_id: product?.id,
        product_name: product?.name,
        quantity,
        selected_color: selectedColor,
        selected_size: selectedSize,
        total_amount: (product?.seller_price || 0) * quantity,
        seller_id: sellerId
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-surface-950">
        <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
        <p className="text-surface-400 font-bold animate-pulse">상품 정보를 불러오고 있습니다...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-950 text-white font-bold">
        상품을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white pb-32">
      {/* 상단 내비게이션 - 모바일 최적화 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 sm:px-12 backdrop-blur-xl bg-surface-950/50">
        <button onClick={() => navigate(-1)} className="rounded-2xl glass p-3 text-white transition-all hover:bg-white/10 active:scale-90">
          <ChevronLeft size={24} />
        </button>
        <img src="/logo.jpg" alt="ONFANS" className="h-8 object-contain" />
        <button className="rounded-2xl glass p-3 text-white transition-all hover:bg-white/10 active:scale-90">
          <Share2 size={22} />
        </button>
      </header>

      <div className="mx-auto max-w-[1400px]">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:px-12 lg:pt-32">
          
          {/* 1. 이미지 슬라이더 영역 - 모바일 풀스크린 스타일 */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-900 lg:rounded-[2.5rem] shadow-premium-2xl animate-fade-in sm:mt-0 mt-[80px]">
            <img 
              src={product.image_urls[currentImageIndex]} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
            
            {product.image_urls.length > 1 && (
              <>
                <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between pointer-events-none">
                  <button onClick={prevImage} className="pointer-events-auto rounded-full bg-black/40 backdrop-blur-md p-4 text-white transition-all active:scale-90 lg:p-3">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="pointer-events-auto rounded-full bg-black/40 backdrop-blur-md p-4 text-white transition-all active:scale-90 lg:p-3">
                    <ChevronRight size={24} />
                  </button>
                </div>
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                  {product.image_urls.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1 rounded-full transition-all duration-500 ${idx === currentImageIndex ? 'bg-brand-500 w-6' : 'bg-white/20 w-1.5'}`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-6 left-6">
              <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10">
                <Sparkles size={14} className="text-brand-400" />
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Verified Quality</span>
              </div>
            </div>
          </div>

          {/* 2. 상품 정보 및 옵션 영역 - 모바일 패딩 조정 */}
          <div className="px-6 py-10 lg:px-0 lg:py-0 animate-fade-in-up">
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-brand-500/10 px-4 py-1.5 text-[11px] font-black text-brand-400 uppercase tracking-widest border border-brand-500/20">
                  New Arrival
                </span>
                <span className="text-sm font-bold text-surface-500 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-green-500" /> 정품 인증 완료
                </span>
              </div>
              <h1 className="mb-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl tracking-tight">
                {product.name}
              </h1>
              <p className="text-3xl font-black text-brand-400 tracking-tighter">
                {product.seller_price.toLocaleString()}원
              </p>
              <p className="mt-8 text-lg font-medium leading-relaxed text-surface-400 break-keep">
                {product.description}
              </p>
            </div>

            <div className="space-y-10">
              {/* 색상 선택 - 모바일 터치 최적화 */}
              {product.options?.color && (
                <div>
                  <label className="mb-5 block text-xs font-black text-surface-500 uppercase tracking-widest">Select Color</label>
                  <div className="flex flex-wrap gap-3">
                    {product.options.color.map(color => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-2xl px-8 py-4 text-sm font-bold transition-all active:scale-95 border-2 ${
                          selectedColor === color 
                            ? 'bg-white text-black border-white shadow-premium-lg' 
                            : 'bg-white/5 text-surface-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 사이즈 선택 */}
              {product.options?.size && (
                <div>
                  <label className="mb-5 block text-xs font-black text-surface-500 uppercase tracking-widest">Select Size</label>
                  <div className="flex flex-wrap gap-3">
                    {product.options.size.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-2xl px-10 py-4 text-sm font-bold transition-all active:scale-95 border-2 ${
                          selectedSize === size 
                            ? 'bg-white text-black border-white shadow-premium-lg' 
                            : 'bg-white/5 text-surface-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 수량 조절 */}
              <div>
                <label className="mb-5 block text-xs font-black text-surface-500 uppercase tracking-widest">Quantity</label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center rounded-2xl bg-white/5 border border-white/10 p-2 shadow-premium-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-xl p-3 text-white transition-all hover:bg-white/10 active:scale-90"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-12 text-center text-xl font-black text-white">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-xl p-3 text-white transition-all hover:bg-white/10 active:scale-90"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="text-right flex-1">
                    <p className="text-xs font-bold text-surface-500 uppercase mb-1">Total Price</p>
                    <p className="text-3xl font-black text-white tracking-tight">{(product.seller_price * quantity).toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* 하단 구매 버튼 - 모바일 최적화 (항상 고정) */}
      <div className="fixed bottom-0 left-0 z-50 w-full bg-gradient-to-t from-surface-950 via-surface-950 to-transparent p-6 pb-10">
        <div className="mx-auto max-w-2xl">
          <button 
            onClick={handleCheckout}
            className="flex w-full items-center justify-center gap-4 rounded-[1.5rem] bg-brand-500 py-6 text-xl font-black text-white shadow-premium-2xl transition-all hover:bg-brand-600 active:scale-[0.97]"
          >
            <ShoppingBag size={24} />
            지금 바로 주문하기
          </button>
        </div>
      </div>
    </div>
  );
}
// build trigger Wed May 13 17:10:10 KST 2026
