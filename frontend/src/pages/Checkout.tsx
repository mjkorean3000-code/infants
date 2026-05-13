import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle2, ChevronLeft, Loader2, Package, Truck } from 'lucide-react';

declare global {
  interface Window {
    IMP: any;
  }
}

interface OrderState {
  product_id: string;
  product_name: string;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
  total_amount: number;
  seller_id: string | null;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state as OrderState;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    shipping_address: ''
  });
  
  const [userIp, setUserIp] = useState('');
  const [isAgreedAll, setIsAgreedAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!orderData) {
      alert('잘못된 접근입니다.');
      navigate('/');
      return;
    }

    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unknown'));

    if (window.IMP) {
      window.IMP.init('imp00000000'); 
    }
  }, [orderData, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = () => {
    if (!formData.customer_name || !formData.customer_contact || !formData.shipping_address) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }

    if (!isAgreedAll) {
      alert('주문 정보 확인 및 약관에 동의하셔야 결제가 가능합니다.');
      return;
    }

    setIsProcessing(true);

    const data = {
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      amount: orderData.total_amount,
      name: orderData.product_name,
      buyer_name: formData.customer_name,
      buyer_tel: formData.customer_contact,
      buyer_addr: formData.shipping_address,
    };

    window.IMP.request_pay(data, async (rsp: any) => {
      if (rsp.success) {
        try {
          const extraData = {
            is_agreed_all: true,
            agreed_at: new Date().toISOString(),
            user_ip: userIp,
            consent_type: 'buyer_terms_v1.0'
          };

          const { error: dbError } = await supabase
            .from('orders')
            .insert([{
              product_id: orderData.product_id,
              influencer_id: orderData.seller_id,
              customer_name: formData.customer_name,
              customer_contact: formData.customer_contact,
              shipping_address: formData.shipping_address,
              quantity: orderData.quantity,
              total_amount: orderData.total_amount,
              status: 'paid',
              ...extraData
            }]);

          if (dbError) throw dbError;
          setIsSuccess(true);
        } catch (error) {
          console.error('Error saving order:', error);
          alert('결제는 완료되었으나 주문 저장 중 오류가 발생했습니다.');
        } finally {
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
        alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg}`);
      }
    });
  };

  if (!orderData) return null;

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-950 px-6 animate-fade-in">
        <div className="flex flex-col items-center rounded-[2.5rem] glass p-10 text-center shadow-premium-2xl max-w-[500px] w-full border-white/5">
          <div className="mb-8 rounded-full bg-green-500/10 border border-green-500/20 p-6 shadow-premium-lg">
            <CheckCircle2 size={56} className="text-green-400" />
          </div>
          <h2 className="mb-4 text-3xl font-black text-white">주문 완료!</h2>
          <p className="mb-10 text-surface-400 font-medium">안전하게 배송해 드리겠습니다.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full rounded-2xl bg-white py-5 font-black text-black shadow-premium-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white pb-40 lg:py-12">
      <div className="mx-auto max-w-4xl lg:px-12">
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 bg-surface-950/80 backdrop-blur-xl px-6 py-5 lg:static lg:bg-transparent lg:px-0 lg:py-0 lg:mb-10 animate-fade-in">
          <button onClick={() => navigate(-1)} className="rounded-xl glass p-2 text-surface-400 hover:text-white transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-white tracking-tight lg:text-2xl">주문 및 결제</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-24 lg:mt-0">
          <div className="lg:col-span-3 flex flex-col gap-6 px-4 lg:px-0">
            {/* 주문 상품 요약 - 모바일 압축 */}
            <section className="rounded-3xl glass p-6 shadow-premium-lg border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Package size={18} className="text-brand-400" />
                <h2 className="text-xs font-black text-surface-300 uppercase tracking-widest">Order Summary</h2>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black text-white">{orderData.product_name}</span>
                <span className="text-sm font-bold text-surface-500">
                  {orderData.selected_color} / {orderData.selected_size} | {orderData.quantity}개
                </span>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-bold text-surface-500">총 금액</span>
                  <span className="text-xl font-black text-brand-400">{orderData.total_amount.toLocaleString()}원</span>
                </div>
              </div>
            </section>

            {/* 배송 정보 - 모바일 터치 최적화 */}
            <section className="rounded-3xl glass p-6 lg:p-8 shadow-premium-lg border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Truck size={18} className="text-brand-400" />
                <h2 className="text-xs font-black text-surface-300 uppercase tracking-widest">Shipping Info</h2>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">받으시는 분</label>
                  <input 
                    type="text" 
                    name="customer_name" 
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="이름 입력"
                    className="rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">연락처</label>
                  <input 
                    type="tel" 
                    name="customer_contact" 
                    value={formData.customer_contact}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">배송 주소</label>
                  <input 
                    type="text" 
                    name="shipping_address" 
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="정확한 주소 입력"
                    className="rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 px-4 lg:px-0 mb-32 lg:mb-0">
            <div className="sticky top-10 rounded-3xl glass p-8 shadow-premium-2xl border-white/5">
              <h2 className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-6">Payment Details</h2>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm text-surface-400 font-bold">
                  <span>상품 합계</span>
                  <span>{orderData.total_amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm text-surface-400 font-bold">
                  <span>배송비</span>
                  <span className="text-brand-400">무료</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="font-black text-white text-base">최종 결제</span>
                  <span className="font-black text-brand-400 text-3xl">{orderData.total_amount.toLocaleString()}원</span>
                </div>
              </div>

              {/* 동의 영역 - 모바일 맞춤형 */}
              <div className="mb-8 space-y-4">
                <div 
                  onClick={() => setIsAgreedAll(!isAgreedAll)}
                  className={`flex items-start gap-3 rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                    isAgreedAll ? 'border-brand-500 bg-brand-500/10' : 'border-white/5 bg-white/5'
                  }`}
                >
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                    isAgreedAll ? 'border-brand-500 bg-brand-500' : 'border-surface-600'
                  }`}>
                    {isAgreedAll && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className={`text-xs font-black leading-tight ${isAgreedAll ? 'text-white' : 'text-surface-400'}`}>
                    [필수] 주문 정보 및 약관 전체 동의
                  </span>
                </div>
                <p className="text-[9px] text-surface-600 leading-normal px-1">
                  원활한 배송을 위해 정보를 상품 공급처에 위탁 제공함에 동의합니다.
                </p>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing || !isAgreedAll}
                className="hidden lg:flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 py-5 text-lg font-black text-white transition-all disabled:opacity-20 shadow-premium-lg"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                결제하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 - 모바일 전용 디자인 */}
      <div className="fixed bottom-0 left-0 z-50 w-full glass p-5 pb-8 shadow-premium-2xl lg:hidden flex flex-col gap-4">
        {!isAgreedAll && (
          <div className="text-[10px] text-center font-bold text-brand-400 animate-pulse">
            약관 동의가 필요합니다
          </div>
        )}
        <button 
          onClick={handlePayment}
          disabled={isProcessing || !isAgreedAll}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 py-5 text-lg font-black text-white shadow-premium-lg transition-all active:scale-95 disabled:opacity-20"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
          {orderData.total_amount.toLocaleString()}원 결제하기
        </button>
      </div>
    </div>
  );
}
// build trigger Wed May 13 17:10:10 KST 2026
