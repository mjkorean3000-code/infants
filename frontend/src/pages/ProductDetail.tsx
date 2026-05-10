import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Loader2, Share2, ShieldCheck, Sparkles } from 'lucide-react';

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
      } catch (err) {
        console.error('Error fetching product:', err);
        setProduct(MOCK_PRODUCT);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, searchParams, code]);

  const nextImage = () => {
    if (!product?.image_urls) return;
    setCurrentImageIndex((prev) => (prev === product.image_urls.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!product?.image_urls) return;
    setCurrentImageIndex((prev) => (prev === 0 ? product.image_urls.length - 1 : prev - 1));
  };

  const handlePurchase = () => {
    if (product?.options?.color && !selectedColor) return alert('색상을 선택해주세요.');
    if (product?.options?.size && !selectedSize) return alert('사이즈를 선택해주세요.');

    const savedSellerId = localStorage.getItem('onfans_seller_id');
    
    const orderData = {
      product_id: product?.id,
      product_name: product?.name,
      quantity,
      selected_color: selectedColor,
      selected_size: selectedSize,
      total_amount: (product?.seller_price || 0) * quantity,
      seller_id: savedSellerId
    };

    navigate('/checkout', { state: orderData });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface-950">
        <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
        <p className="text-surface-400 font-bold animate-pulse">상품 정보를 불러오고 있습니다...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 text-white">
        상품을 찾을 수 없습니다.
      </div>
    );
  }

  if (product.status !== 'active') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface-950 px-6 text-center">
        <div className="mb-8 rounded-full bg-white/5 p-8 shadow-premium-xl">
          <ShoppingBag size={64} className="text-surface-600" />
        </div>
        <h2 className="mb-4 text-3xl font-black text-white tracking-tight">판매 준비 중인 상품입니다</h2>
        <p className="mb-10 text-surface-400 font-medium leading-relaxed">
          현재 해당 상품은 품절되었거나 판매가 일시 중단되었습니다.<br/>
          이용에 불편을 드려 죄송합니다.
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="rounded-2xl bg-white px-10 py-4 text-sm font-black text-black shadow-premium-lg transition-all hover:bg-brand-500 hover:text-white active:scale-95"
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white lg:py-12">
      <div className="mx-auto max-w-[1400px] lg:px-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          
          {/* 1. 이미지 슬라이더 영역 */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-900 lg:rounded-[2.5rem] shadow-premium-2xl animate-fade-in">
            <img 
              src={product.image_urls[currentImageIndex]} 
              alt={product.name} 
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            
            {/* 슬라이더 컨트롤 */}
            {product.image_urls.length > 1 && (
              <>
                <div className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 justify-between pointer-events-none">
                  <button onClick={prevImage} className="pointer-events-auto rounded-2xl bg-black/40 backdrop-blur-md p-3 text-white border border-white/10 shadow-premium-md transition-all hover:bg-brand-500 hover:border-brand-400">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="pointer-events-auto rounded-2xl bg-black/40 backdrop-blur-md p-3 text-white border border-white/10 shadow-premium-md transition-all hover:bg-brand-500 hover:border-brand-400">
                    <ChevronRight size={24} />
                  </button>
                </div>
                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
                  {product.image_urls.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImageIndex ? 'bg-brand-500 w-8' : 'bg-white/20 w-3'}`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-8 left-8">
              <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10">
                <Sparkles size={14} className="text-brand-400" />
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Verified Quality</span>
              </div>
            </div>
          </div>

          {/* 2. 상품 정보 및 옵션 영역 */}
          <div className="p-8 lg:p-0 flex flex-col h-full animate-fade-in-up">
            <header className="mb-10">
              {product.factory_applications?.company_name && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 text-xs font-black text-brand-400 uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  Official: {product.factory_applications.company_name}
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight leading-tight">{product.name}</h1>
                <button className="h-12 w-12 shrink-0 rounded-2xl glass flex items-center justify-center text-surface-400 hover:text-white transition-all">
                  <Share2 size={20} />
                </button>
              </div>
              <p className="mt-6 text-4xl font-black text-gradient tracking-tight">{product.seller_price.toLocaleString()}원</p>
            </header>
            
            <div className="mb-10 rounded-[2rem] glass p-8 shadow-premium-lg border-white/5">
              <h3 className="text-xs font-black text-surface-500 uppercase tracking-widest mb-4">Product Story</h3>
              <p className="text-lg font-medium leading-relaxed text-surface-300">{product.description}</p>
            </div>

            {/* 옵션 선택 */}
            <div className="flex flex-col gap-10">
              {product.options?.color && (
                <div className="flex flex-col gap-5">
                  <span className="text-xs font-black text-surface-500 uppercase tracking-widest">Select Color</span>
                  <div className="flex flex-wrap gap-3">
                    {product.options.color.map(color => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-2xl border-2 px-6 py-3.5 text-sm font-black transition-all duration-300 ${
                          selectedColor === color 
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400 shadow-premium-md' 
                            : 'border-white/5 bg-white/5 text-surface-400 hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.options?.size && (
                <div className="flex flex-col gap-5">
                  <span className="text-xs font-black text-surface-500 uppercase tracking-widest">Select Size</span>
                  <div className="flex flex-wrap gap-3">
                    {product.options.size.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-2xl border-2 px-6 py-3.5 text-sm font-black transition-all duration-300 ${
                          selectedSize === size 
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400 shadow-premium-md' 
                            : 'border-white/5 bg-white/5 text-surface-400 hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 수량 조절 및 최종 합계 */}
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between rounded-[2rem] border-2 border-white/5 bg-white/5 p-6">
                <span className="text-sm font-black text-surface-400 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-brand-500 shadow-premium-sm"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-8 text-center text-xl font-black text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-brand-500 shadow-premium-sm"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-6">
                <span className="text-lg font-bold text-surface-500">Order Total</span>
                <span className="text-3xl font-black text-white">
                  {(product.seller_price * quantity).toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 구매 버튼 (데스크탑) */}
            <div className="hidden lg:block mt-auto">
              <button 
                onClick={handlePurchase}
                className="flex w-full items-center justify-center gap-3 rounded-3xl bg-white py-6 text-xl font-black text-black shadow-premium-2xl transition-all hover:bg-brand-500 hover:text-white active:scale-95"
              >
                <ShoppingBag size={24} />
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 구매하기 버튼 (모바일 전용) */}
      <div className="fixed bottom-0 left-0 z-50 w-full glass p-6 pb-10 shadow-premium-2xl lg:hidden">
        <button 
          onClick={handlePurchase}
          className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-white py-5 text-lg font-black text-black shadow-premium-lg transition-all hover:bg-brand-500 hover:text-white active:scale-95"
        >
          <ShoppingBag size={20} />
          구매하기
        </button>
      </div>

    </div>
  );
}
