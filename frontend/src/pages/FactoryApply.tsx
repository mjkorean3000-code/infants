import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Factory, CheckCircle2, ChevronRight, Loader2, XCircle } from 'lucide-react';

function FactoryApply() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isDropshipping, setIsDropshipping] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    company_name: '',
    manager_email: '',
    main_category: 'fashion',
    product_image_url: '',
    consumer_price: '',
    supply_price: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNextStep = () => {
    if (isDropshipping === true) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 환경변수 없으면 시뮬레이션
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1500);
      return;
    }

    try {
      const { error } = await supabase
        .from('factory_applications')
        .insert([
          {
            is_dropshipping: true,
            company_name: formData.company_name,
            manager_email: formData.manager_email,
            main_category: formData.main_category,
            product_image_url: formData.product_image_url,
            consumer_price: parseFloat(formData.consumer_price),
            supply_price: parseFloat(formData.supply_price),
            status: 'pending'
          }
        ]);

      if (error) throw error;
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(`에러 원인: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 font-sans">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-white/10 p-4">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">입점 신청 완료!</h2>
          <p className="mb-8 max-w-md text-gray-400">
            공장 입점 신청이 성공적으로 접수되었습니다. 담당자가 영업일 기준 1~2일 내에 이메일로 연락드리겠습니다.
          </p>
          <p className="rounded-full bg-white/5 border border-white/10 px-8 py-4 text-sm font-bold text-white/50">
            이 창을 닫아주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="text-xl font-black tracking-tighter text-white">ONFANS FACTORY</div>
        <a href="/apply" className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20">
          인플루언서(셀러) 입점하기
        </a>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-12 sm:px-12 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            수만 명의 셀러와 연결되는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">가장 빠른 방법.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
            제품만 등록하세요. 마케팅과 판매는 온팬즈 파트너 셀러들이 담당합니다.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="px-6 pb-32 sm:px-12">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 sm:p-12 shadow-2xl">
          <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">공장 입점 신청</h2>
              <p className="mt-2 text-gray-500">제조사/공급사 파트너로 합류하세요.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <Factory size={24} />
            </div>
          </div>
          
          {step === 1 ? (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900">Step 1. 배송 방식 확인</h3>
              <p className="text-gray-600">
                온팬즈 셀러들이 판매한 제품을 협업 풀필먼트나 위탁 배송(드랍쉬핑) 방식으로 직접 고객에게 배송해주실 수 있나요?
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsDropshipping(true)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                    isDropshipping === true 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isDropshipping === true ? 'border-black bg-black' : 'border-gray-300'}`}>
                    {isDropshipping === true && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">네, 가능합니다</span>
                    <span className="text-sm text-gray-500">위탁 배송 / 드랍쉬핑 시스템이 준비되어 있습니다.</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsDropshipping(false)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                    isDropshipping === false 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isDropshipping === false ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                    {isDropshipping === false && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">아니요, 불가능합니다</span>
                    <span className="text-sm text-gray-500">사입(도매) 방식으로만 거래합니다.</span>
                  </div>
                </button>
              </div>

              {isDropshipping === false && (
                <div className="mt-4 rounded-xl bg-red-50 p-6 text-center animate-in fade-in slide-in-from-top-2">
                  <XCircle className="mx-auto mb-3 text-red-500" size={32} />
                  <h4 className="mb-2 font-bold text-red-900">입점이 불가능합니다</h4>
                  <p className="text-sm text-red-700">
                    현재 온팬즈는 <span className="font-bold">위탁 배송(드랍쉬핑)</span>이 가능한 파트너와만 협업하고 있습니다. 귀하의 비즈니스에 행운이 깃들길 바랍니다.
                  </p>
                </div>
              )}

              <button 
                onClick={handleNextStep}
                disabled={isDropshipping !== true}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
              >
                다음 단계로 <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Step 2. 기본 정보 입력</h3>
                <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-gray-500 hover:text-black">
                  이전으로
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="company_name" className="text-sm font-bold text-gray-900">공급사(공장) 이름</label>
                <input 
                  type="text" 
                  id="company_name" 
                  name="company_name" 
                  required
                  placeholder="예: 온팬즈 팩토리"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="manager_email" className="text-sm font-bold text-gray-900">담당자 이메일</label>
                <input 
                  type="email" 
                  id="manager_email" 
                  name="manager_email" 
                  required
                  placeholder="hello@example.com"
                  value={formData.manager_email}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="main_category" className="text-sm font-bold text-gray-900">주력 제품군</label>
                <select 
                  id="main_category" 
                  name="main_category" 
                  value={formData.main_category}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none appearance-none"
                >
                  <option value="fashion">의류 / 패션잡화</option>
                  <option value="beauty">뷰티 / 코스메틱</option>
                  <option value="living">리빙 / 홈데코</option>
                  <option value="digital">디지털 / 전자기기</option>
                  <option value="food">식품 / 건강</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="product_image_url" className="text-sm font-bold text-gray-900">주력 제품 이미지 (URL)</label>
                <input 
                  type="url" 
                  id="product_image_url" 
                  name="product_image_url" 
                  required
                  placeholder="https://example.com/image.jpg"
                  value={formData.product_image_url}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
                />
                <span className="text-xs text-gray-500">제품을 확인할 수 있는 이미지 링크나 상세페이지 링크를 입력해주세요.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="consumer_price" className="text-sm font-bold text-gray-900">소비자가 (원)</label>
                  <input 
                    type="number" 
                    id="consumer_price" 
                    name="consumer_price" 
                    required
                    placeholder="예: 30000"
                    value={formData.consumer_price}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="supply_price" className="text-sm font-bold text-gray-900">공급가 (원)</label>
                  <input 
                    type="number" 
                    id="supply_price" 
                    name="supply_price" 
                    required
                    placeholder="예: 15000"
                    value={formData.supply_price}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> 처리 중...
                  </>
                ) : (
                  <>
                    입점 신청 완료하기 <CheckCircle2 size={20} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default FactoryApply;
