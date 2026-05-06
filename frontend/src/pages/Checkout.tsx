import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';

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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!orderData) {
      alert('잘못된 접근입니다.');
      navigate('/');
      return;
    }

    // 포트원 초기화
    if (window.IMP) {
      window.IMP.init('imp00000000'); // 테스트용 가맹점 식별코드 (추후 교체 필요)
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

    if (!window.IMP) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 결제 데이터 설정
    const data = {
      pg: 'html5_inicis', // PG사
      pay_method: 'card', // 결제수단
      merchant_uid: `mid_${new Date().getTime()}`, // 주문번호
      amount: orderData.total_amount, // 결제금액
      name: orderData.product_name, // 주문명
      buyer_name: formData.customer_name,
      buyer_tel: formData.customer_contact,
      buyer_addr: formData.shipping_address,
    };

    setIsProcessing(true);

    // 포트원 결제창 호출
    window.IMP.request_pay(data, async (rsp: any) => {
      if (rsp.success) {
        // 결제 성공 로직
        try {
          if (import.meta.env.VITE_SUPABASE_URL === undefined) {
            // 환경변수 없으면 시뮬레이션
            setTimeout(() => {
              setIsProcessing(false);
              setIsSuccess(true);
              console.log('🔗 [Mock DB Webhook Triggered]');
            }, 1000);
            return;
          }

          // 1. Supabase Orders 테이블에 데이터 저장 (이후 Database Webhook이 자동으로 Make.com 호출)
          const { error } = await supabase
            .from('orders')
            .insert([{
              product_id: orderData.product_id,
              influencer_id: orderData.seller_id,
              customer_name: formData.customer_name,
              customer_contact: formData.customer_contact,
              shipping_address: formData.shipping_address,
              quantity: orderData.quantity,
              total_amount: orderData.total_amount,
              status: 'paid'
            }]);

          if (error) throw error;
          
          setIsSuccess(true);
        } catch (error) {
          console.error('Error saving order:', error);
          alert('결제는 완료되었으나 주문 저장 중 오류가 발생했습니다. 고객센터로 문의해주세요.');
        } finally {
          setIsProcessing(false);
        }
      } else {
        // 결제 실패 로직
        setIsProcessing(false);
        alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg}`);
      }
    });
  };

  if (!orderData) return null;

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm max-w-md w-full">
          <div className="mb-6 rounded-full bg-green-100 p-4">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">결제가 완료되었습니다!</h2>
          <p className="mb-8 text-gray-500">주문하신 상품이 안전하게 배송될 예정입니다.</p>
          
          <div className="w-full rounded-xl bg-gray-50 p-4 mb-8 text-left">
            <p className="text-sm text-gray-600 mb-1">결제 금액</p>
            <p className="text-xl font-bold text-gray-900">{orderData.total_amount.toLocaleString()}원</p>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50 pb-24 md:max-w-2xl lg:max-w-3xl lg:p-8">
      {/* 모바일 헤더 */}
      <header className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white px-4 py-4 lg:rounded-t-2xl lg:border-none">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-black">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">주문 / 결제</h1>
      </header>

      <div className="flex flex-col gap-4 p-4 lg:bg-white lg:rounded-b-2xl lg:p-8 lg:shadow-sm">
        
        {/* 주문 상품 요약 */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:border-none lg:bg-gray-50 lg:shadow-none">
          <h2 className="mb-4 text-sm font-bold text-gray-900">주문 상품 정보</h2>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900">{orderData.product_name}</span>
            <span className="text-sm text-gray-500">
              옵션: {orderData.selected_color} / {orderData.selected_size} | 수량: {orderData.quantity}개
            </span>
            <span className="mt-2 font-bold text-black">{orderData.total_amount.toLocaleString()}원</span>
          </div>
        </section>

        {/* 배송 정보 입력 */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:border-none lg:p-0 lg:shadow-none lg:mt-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900">배송 정보</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="customer_name" className="text-sm font-medium text-gray-700">받으시는 분</label>
              <input 
                type="text" 
                id="customer_name" 
                name="customer_name" 
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="이름 입력"
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="customer_contact" className="text-sm font-medium text-gray-700">연락처</label>
              <input 
                type="tel" 
                id="customer_contact" 
                name="customer_contact" 
                value={formData.customer_contact}
                onChange={handleChange}
                placeholder="010-0000-0000"
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="shipping_address" className="text-sm font-medium text-gray-700">배송 주소</label>
              <input 
                type="text" 
                id="shipping_address" 
                name="shipping_address" 
                value={formData.shipping_address}
                onChange={handleChange}
                placeholder="상세 주소 입력"
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </section>
      </div>

      {/* 하단 고정 결제 버튼 */}
      <div className="fixed bottom-0 left-0 z-50 w-full bg-white p-4 pb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:static lg:mt-6 lg:bg-transparent lg:p-0 lg:shadow-none">
        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3182f6] py-4 text-lg font-bold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:opacity-70"
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
