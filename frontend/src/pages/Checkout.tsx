import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle2, ChevronLeft, Loader2, Package, Truck, User, ShieldCheck } from 'lucide-react';

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

    // Fetch User IP
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

    if (!window.IMP) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

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

    setIsProcessing(true);

    window.IMP.request_pay(data, async (rsp: any) => {
      if (rsp.success) {
        try {
          const extraData = {
            is_agreed_all: true,
            agreed_at: new Date().toISOString(),
            user_ip: userIp,
            consent_type: 'buyer_terms_v1.0'
          };

          if (import.meta.env.VITE_SUPABASE_URL === undefined) {
            setTimeout(() => {
              setIsProcessing(false);
              setIsSuccess(true);
            }, 1000);
            return;
          }

          // 1. Supabase 주문 저장
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

          // 2. Make.com 웹훅 전송 (주문용 웹훅 URL이 있을 경우)
          const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
          if (webhookUrl) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                event: 'new_order',
                ...orderData, 
                ...formData, 
                ...extraData 
              })
            }).catch(err => console.error('Webhook error:', err));
          }
          
          setIsSuccess(true);
        } catch (error) {
          console.error('Error saving order:', error);
          alert('결제는 완료되었으나 주문 저장 중 오류가 발생했습니다. 고객센터로 문의해주세요.');
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
        <div className="flex flex-col items-center rounded-[2.5rem] glass p-12 text-center shadow-premium-2xl max-w-[500px] w-full border-white/5">
          <div className="mb-8 rounded-full bg-green-500/10 border border-green-500/20 p-6 shadow-premium-lg">
            <CheckCircle2 size={64} className="text-green-400" />
          </div>
          <h2 className="mb-4 text-3xl font-black text-white tracking-tight">주문이 완료되었습니다!</h2>
          <p className="mb-10 text-surface-400 font-medium leading-relaxed">주문하신 상품이 안전하게 배송될 예정입니다.<br/>이용해주셔서 감사합니다.</p>
          
          <div className="w-full rounded-2xl bg-white/5 border border-white/5 p-6 mb-10 text-left">
            <p className="text-xs font-black text-surface-500 uppercase tracking-widest mb-2">Final Payment</p>
            <p className="text-3xl font-black text-white">{orderData.total_amount.toLocaleString()}원</p>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full rounded-2xl bg-white py-5 text-base font-black text-black transition-all hover:bg-brand-500 hover:text-white active:scale-95 shadow-premium-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white pb-32 lg:py-12">
      <div className="mx-auto max-w-4xl lg:px-12">
        <header className="mb-10 flex items-center gap-4 px-6 lg:px-0 animate-fade-in-up">
          <button onClick={() => navigate(-1)} className="rounded-xl glass p-2 text-surface-400 hover:text-white transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">주문 및 결제</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 flex flex-col gap-10 px-6 lg:px-0">
            {/* 주문 상품 요약 */}
            <section className="rounded-[2rem] glass p-8 shadow-premium-lg border-white/5 animate-fade-in-up delay-100">
              <div className="flex items-center gap-3 mb-6">
                <Package size={20} className="text-brand-400" />
                <h2 className="text-sm font-black text-surface-300 uppercase tracking-widest">Order Summary</h2>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xl font-black text-white">{orderData.product_name}</span>
                <span className="text-sm font-medium text-surface-500">
                  옵션: {orderData.selected_color} / {orderData.selected_size} | 수량: {orderData.quantity}개
                </span>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-bold text-surface-500">상품 금액</span>
                  <span className="text-xl font-black text-white">{orderData.total_amount.toLocaleString()}원</span>
                </div>
              </div>
            </section>

            {/* 배송 정보 입력 */}
            <section className="rounded-[2rem] glass p-10 shadow-premium-lg border-white/5 animate-fade-in-up delay-200">
              <div className="flex items-center gap-3 mb-8">
                <Truck size={20} className="text-brand-400" />
                <h2 className="text-sm font-black text-surface-300 uppercase tracking-widest">Shipping Info</h2>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <label htmlFor="customer_name" className="text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> 받으시는 분
                  </label>
                  <input 
                    type="text" 
                    id="customer_name" 
                    name="customer_name" 
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="이름 입력"
                    className="rounded-2xl border-2 border-white/5 bg-white/5 px-6 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <label htmlFor="customer_contact" className="text-xs font-black text-surface-500 uppercase tracking-widest">연락처</label>
                  <input 
                    type="tel" 
                    id="customer_contact" 
                    name="customer_contact" 
                    value={formData.customer_contact}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="rounded-2xl border-2 border-white/5 bg-white/5 px-6 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="shipping_address" className="text-xs font-black text-surface-500 uppercase tracking-widest">배송 주소</label>
                  <input 
                    type="text" 
                    id="shipping_address" 
                    name="shipping_address" 
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="정확한 배송지를 입력해주세요"
                    className="rounded-2xl border-2 border-white/5 bg-white/5 px-6 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 px-6 lg:px-0">
            <div className="sticky top-12 rounded-[2rem] glass p-10 shadow-premium-2xl border-white/5 animate-fade-in-up delay-300">
              <h2 className="text-sm font-black text-surface-500 uppercase tracking-widest mb-8">Payment Details</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-surface-400 font-medium">
                  <span>총 상품 금액</span>
                  <span>{orderData.total_amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-surface-400 font-medium">
                  <span>배송비</span>
                  <span className="text-brand-400">무료</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="font-black text-white text-lg tracking-tight">최종 결제 금액</span>
                  <span className="font-black text-brand-400 text-3xl">{orderData.total_amount.toLocaleString()}원</span>
                </div>
              </div>

              {/* 동의 체크박스 영역 */}
              <div className="mb-8 space-y-4">
                <div 
                  onClick={() => setIsAgreedAll(!isAgreedAll)}
                  className={`flex items-start gap-3 rounded-2xl p-4 border-2 transition-all cursor-pointer ${isAgreedAll ? 'border-brand-500 bg-brand-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                >
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${isAgreedAll ? 'border-brand-500 bg-brand-500' : 'border-surface-600'}`}>
                    {isAgreedAll && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className={`text-sm font-bold ${isAgreedAll ? 'text-brand-500' : 'text-surface-400'}`}>
                    [필수] 주문 상품 정보 확인 및 온팬즈 이용약관, 개인정보 제3자 제공에 전체 동의합니다.
                  </span>
                </div>
                <p className="text-[10px] text-surface-600 leading-tight px-1 font-medium">
                  개인정보 제3자 제공 안내: 원활한 배송 이행을 위해 수집된 배송지 정보를 해당 상품의 공급처(공장)에 위탁 제공함에 동의합니다.
                </p>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing || !isAgreedAll}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 py-5 text-lg font-black text-white shadow-premium-lg transition-all hover:bg-brand-600 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <CreditCard size={24} />
                )}
                결제하기
              </button>
              
              <p className="mt-6 text-[10px] text-center font-bold text-surface-600 uppercase tracking-widest">
                Safe & Secure Checkout via PortOne
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 결제 버튼 (모바일 전용) */}
      <div className="fixed bottom-0 left-0 z-50 w-full glass p-6 pb-10 shadow-premium-2xl lg:hidden animate-fade-in flex flex-col gap-4">
        <div 
          onClick={() => setIsAgreedAll(!isAgreedAll)}
          className={`flex items-center gap-3 px-2 transition-all cursor-pointer`}
        >
          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${isAgreedAll ? 'border-brand-500 bg-brand-500' : 'border-surface-600'}`}>
            {isAgreedAll && <CheckCircle2 size={14} className="text-white" />}
          </div>
          <span className={`text-xs font-bold ${isAgreedAll ? 'text-brand-500' : 'text-surface-400'}`}>
            [필수] 약관 및 제3자 제공 전체 동의
          </span>
        </div>
        
        <button 
          onClick={handlePayment}
          disabled={isProcessing || !isAgreedAll}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 py-5 text-lg font-black text-white shadow-premium-lg transition-all hover:bg-brand-600 active:scale-95 disabled:opacity-30"
        >
          {isProcessing ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <CreditCard size={24} />
          )}
          {orderData.total_amount.toLocaleString()}원 결제하기
        </button>
      </div>

    </div>
  );
}
