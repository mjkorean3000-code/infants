import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';

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
  status: string;
  factories?: {
    name: string;
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
  factories: {
    name: '신성 어패럴 공장'
  }
};

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // 1. 트래킹 로직 & 데이터 패치
  useEffect(() => {
    // URL에서 seller 파라미터 낚아채기
    const sellerId = searchParams.get('seller');
    if (sellerId) {
      localStorage.setItem('onfans_seller_id', sellerId);
      console.log('✅ Seller ID saved to localStorage:', sellerId);
    }

    // 상품 데이터 가져오기
    const fetchProduct = async () => {
      try {
        if (import.meta.env.VITE_SUPABASE_URL === undefined) {
          // 환경변수 없으면 시뮬레이션
          setTimeout(() => {
            setProduct(MOCK_PRODUCT);
            setLoading(false);
          }, 800);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*, factories(name)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data as ProductData);
      } catch (err) {
        console.error('Error fetching product:', err);
        // 오류 발생 시 목업 데이터로 폴백
        setProduct(MOCK_PRODUCT);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, searchParams]);

  // 이미지 슬라이더 조작
  const nextImage = () => {
    if (!product?.image_urls) return;
    setCurrentImageIndex((prev) => (prev === product.image_urls.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!product?.image_urls) return;
    setCurrentImageIndex((prev) => (prev === 0 ? product.image_urls.length - 1 : prev - 1));
  };

  // 구매하기 동작
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
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-gray-900" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-8 text-center">상품을 찾을 수 없습니다.</div>;
  }

  // 비활성 상태 상품 처리
  if (product.status !== 'active') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="mb-6 rounded-full bg-gray-200 p-4">
          <ShoppingBag size={48} className="text-gray-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">판매 준비 중인 상품입니다</h2>
        <p className="mb-8 text-gray-500">
          현재 해당 상품은 품절되었거나 판매가 일시 중단되었습니다.<br/>
          이용에 불편을 드려 죄송합니다.
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="rounded-xl bg-black px-8 py-3 text-sm font-bold text-white transition-transform hover:scale-105"
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-24 shadow-sm md:max-w-2xl lg:max-w-4xl lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8">
      
      {/* 1. 이미지 슬라이더 영역 */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 lg:rounded-2xl">
        <img 
          src={product.image_urls[currentImageIndex]} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-500"
        />
        
        {/* 슬라이더 컨트롤 */}
        {product.image_urls.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-transform hover:scale-110">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-transform hover:scale-110">
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {product.image_urls.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-black w-4' : 'bg-gray-400'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. 상품 정보 및 옵션 영역 */}
      <div className="p-5 lg:p-0 flex flex-col h-full">
        {product.factories?.name && (
          <div className="mb-2 inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
            제조사: {product.factories.name}
          </div>
        )}
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="mb-6 text-3xl font-extrabold text-gray-900">{product.seller_price.toLocaleString()}원</p>
        
        <div className="mb-8 rounded-xl bg-gray-50 p-4">
          <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
        </div>

        {/* 옵션 선택 */}
        <div className="flex flex-col gap-4">
          {product.options?.color && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-gray-700">색상 (Color)</span>
              <div className="flex flex-wrap gap-2">
                {product.options.color.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      selectedColor === color 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.options?.size && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-sm font-bold text-gray-700">사이즈 (Size)</span>
              <div className="flex flex-wrap gap-2">
                {product.options.size.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      selectedSize === size 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 수량 조절 */}
        <div className="mt-8 flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <span className="font-bold text-gray-700">수량</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="mt-6 mb-20 lg:mb-0 flex items-center justify-between py-4 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-600">총 상품 금액</span>
          <span className="text-2xl font-extrabold text-black">
            {(product.seller_price * quantity).toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 3. 하단 고정 구매하기 버튼 (모바일) */}
      <div className="fixed bottom-0 left-0 z-50 w-full bg-white p-4 pb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:static lg:col-span-2 lg:bg-transparent lg:p-0 lg:shadow-none">
        <button 
          onClick={handlePurchase}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-lg font-bold text-white transition-transform hover:bg-gray-900 active:scale-[0.98]"
        >
          <ShoppingBag size={20} />
          구매하기
        </button>
      </div>

    </div>
  );
}
