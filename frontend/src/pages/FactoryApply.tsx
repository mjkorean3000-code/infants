import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, ChevronRight, Loader2, XCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

// Fixed navigate error
function FactoryApply() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [isDropshipping, setIsDropshipping] = useState<boolean | null>(null);
  const [userIp, setUserIp] = useState('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    manager_email: '',
    main_category: 'fashion',
    product_image_url: '',
    consumer_price: '',
    supply_price: ''
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch User IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unknown'));
  }, []);

  const handleNextStep = () => {
    if (isDropshipping === true) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) {
      alert('필수 약관에 동의해야 신청이 가능합니다.');
      return;
    }
    setIsSubmitting(true);
    
    const extraData = {
      is_agreed: true,
      agreed_at: new Date().toISOString(),
      user_ip: userIp,
      terms_version: 'v1.0'
    };

    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1500);
      return;
    }

    try {
      const { error: dbError } = await supabase
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
            status: 'pending',
            ...extraData,
            // 개별 항목도 호환성을 위해 true로 전송
            agree_personal_info: true,
            agree_logistics: true,
            agree_cs_quality: true,
            agree_no_direct_trade: true,
            agree_auto_settlement: true
          }
        ]);

      if (dbError) throw dbError;
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
      <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4 font-sans">
        <div className="flex flex-col items-center text-center animate-scale-in">
          <div className="mb-8 rounded-full bg-brand-500/10 p-6 shadow-premium-lg">
            <CheckCircle2 size={56} className="text-brand-400" />
          </div>
          <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">상품 입점 제안 완료!</h2>
          <p className="mb-10 max-w-md text-surface-400 font-medium text-lg leading-relaxed">
            상품 입점 제안이 성공적으로 접수되었습니다. 담당자가 영업일 기준 1~2일 내에 검토 후 이메일로 연락드리겠습니다.
          </p>
          <div className="rounded-full bg-white/5 border border-white/10 px-10 py-5 text-sm font-bold text-white/40 shadow-premium-sm">
            이 창을 닫아주세요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 font-sans selection:bg-brand-500/30 selection:text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 sm:px-12 backdrop-blur-md bg-surface-950/20">
        <div className="glass-light rounded-full px-5 py-2 flex items-center shadow-premium-lg">
          <img src="/logo.png" alt="ONFANS" className="h-10 sm:h-12 object-contain" />
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1 sm:gap-2 glass-light rounded-full p-1 shadow-premium-lg">
            <button 
              onClick={() => navigate('/factory-apply')}
              className={`px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full transition-all ${
                location.pathname === '/factory-apply' 
                  ? 'bg-white text-black shadow-premium-sm' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Factory
            </button>
            <button 
              onClick={() => navigate('/apply')}
              className={`px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full transition-all ${
                location.pathname === '/apply' 
                  ? 'bg-white text-black shadow-premium-sm' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Influencer
            </button>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="rounded-full bg-white/10 border border-white/10 px-6 py-2.5 text-xs sm:text-sm font-black text-white transition-all hover:bg-white hover:text-black active:scale-95"
          >
            Login
          </button>
        </div>
      </nav>

      <section className="pt-32 pb-12 px-6 sm:px-12 sm:pt-48">
        <div className="mx-auto max-w-5xl text-center animate-fade-in-up">
          <h1 className="mb-6 text-[36px] font-black leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-8xl break-keep">
            수만 명의 셀러가 당신의
            <span className="block text-gradient mt-2">상품을 기다립니다.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-surface-400 sm:text-xl font-medium">
            최고의 상품만 준비하세요. 마케팅과 판매는 온팬즈 파트너 셀러들이 담당합니다.
          </p>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12 animate-fade-in duration-700">
        <div className="mx-auto max-w-2xl rounded-[2.5rem] bg-white p-8 sm:p-14 shadow-premium-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
          
          <div className="mb-10 flex items-center justify-between border-b border-surface-100 pb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-surface-950 sm:text-4xl">상품 입점 신청서</h2>
              <p className="mt-2 text-surface-500 font-medium">귀사의 우수한 상품을 온팬즈에 제안해 주세요.</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-950 text-white shadow-premium-lg">
              <ShoppingBag size={28} />
            </div>
          </div>
          
          {step === 1 ? (
            <div className="flex flex-col gap-8 animate-scale-in">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-surface-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-900 text-[10px] text-white">1</span>
                  배송 및 공급 방식 확인
                </h3>
                <p className="text-surface-600 leading-relaxed font-medium">
                  온팬즈는 셀러가 판매한 제품을 공급사가 직접 고객에게 배송하는 <span className="text-brand-600 font-black">위탁 배송(드랍쉬핑)</span> 방식으로 운영됩니다. 가능하신가요?
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setIsDropshipping(true)}
                  className={`group flex items-center gap-5 rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                    isDropshipping === true 
                      ? 'border-surface-950 bg-surface-50 shadow-premium-md' 
                      : 'border-surface-100 hover:border-surface-200 hover:bg-surface-50/50'
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${isDropshipping === true ? 'border-surface-950 bg-surface-950' : 'border-surface-300 group-hover:border-surface-400'}`}>
                    {isDropshipping === true && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="block font-bold text-surface-900 text-lg">네, 가능합니다</span>
                    <span className="text-sm text-surface-500 font-medium">위탁 배송 시스템이 구축되어 있습니다.</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsDropshipping(false)}
                  className={`group flex items-center gap-5 rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                    isDropshipping === false 
                      ? 'border-red-500 bg-red-50 shadow-premium-md' 
                      : 'border-surface-100 hover:border-surface-200 hover:bg-surface-50/50'
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${isDropshipping === false ? 'border-red-500 bg-red-500' : 'border-surface-300 group-hover:border-surface-400'}`}>
                    {isDropshipping === false && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="block font-bold text-surface-900 text-lg">아니요, 불가능합니다</span>
                    <span className="text-sm text-surface-500 font-medium">직배송 또는 사입 방식으로만 운영합니다.</span>
                  </div>
                </button>
              </div>

              {isDropshipping === false && (
                <div className="mt-2 rounded-2xl bg-red-50 p-6 text-center animate-blur-in">
                  <XCircle className="mx-auto mb-3 text-red-500" size={36} />
                  <h4 className="mb-2 font-bold text-red-950">입점이 어렵습니다</h4>
                  <p className="text-sm text-red-800 font-medium leading-relaxed">
                    현재 온팬즈는 <span className="font-bold underline underline-offset-2">위탁 배송(드랍쉬핑)</span>이 가능한 파트너와만 협업하고 있습니다. 시스템 구축 후 다시 제안해 주세요.
                  </p>
                </div>
              )}

              <button 
                onClick={handleNextStep}
                disabled={isDropshipping !== true}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-950 py-5 font-bold text-white transition-all hover:bg-black hover:shadow-premium-lg active:scale-[0.98] disabled:opacity-20 disabled:hover:shadow-none"
              >
                다음 단계로 <ChevronRight size={22} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-scale-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-surface-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-950 text-[10px] text-white">2</span>
                  상품 정보 입력
                </h3>
                <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-surface-400 hover:text-surface-950 transition-colors">
                  이전으로
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2.5">
                  <label htmlFor="company_name" className="text-sm font-bold text-surface-900 ml-1">상품명</label>
                  <input 
                    type="text" 
                    id="company_name" 
                    name="company_name" 
                    required
                    placeholder="예: 프리미엄 린넨 셔츠"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
                  />
                  <span className="text-[11px] text-surface-400 ml-1 font-medium italic">제안하시는 대표 상품의 이름을 입력해주세요.</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label htmlFor="manager_email" className="text-sm font-bold text-surface-900 ml-1">담당자 이메일</label>
                  <input 
                    type="email" 
                    id="manager_email" 
                    name="manager_email" 
                    required
                    placeholder="hello@example.com"
                    value={formData.manager_email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label htmlFor="main_category" className="text-sm font-bold text-surface-900 ml-1">주력 제품군</label>
                  <div className="relative">
                    <select 
                      id="main_category" 
                      name="main_category" 
                      value={formData.main_category}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="fashion">의류 / 패션잡화</option>
                      <option value="beauty">뷰티 / 코스메틱</option>
                      <option value="living">리빙 / 홈데코</option>
                      <option value="digital">디지털 / 전자기기</option>
                      <option value="food">식품 / 건강</option>
                      <option value="other">기타</option>
                    </select>
                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-surface-400">
                      <ChevronRight size={20} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label htmlFor="product_image_url" className="text-sm font-bold text-surface-900 ml-1">제품 이미지 또는 상세페이지 (URL)</label>
                  <input 
                    type="url" 
                    id="product_image_url" 
                    name="product_image_url" 
                    required
                    placeholder="https://example.com/product"
                    value={formData.product_image_url}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2.5">
                    <label htmlFor="consumer_price" className="text-sm font-bold text-surface-900 ml-1">희망 소비자가 (원)</label>
                    <input 
                      type="number" 
                      id="consumer_price" 
                      name="consumer_price" 
                      required
                      placeholder="예: 30000"
                      value={formData.consumer_price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <label htmlFor="supply_price" className="text-sm font-bold text-surface-900 ml-1">공급가 (원)</label>
                    <input 
                      type="number" 
                      id="supply_price" 
                      name="supply_price" 
                      required
                      placeholder="예: 15000"
                      value={formData.supply_price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
                    />
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <h4 className="text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> 이용약관 및 동의
                  </h4>
                  
                  <div className="rounded-2xl border-2 border-surface-100 bg-surface-50 p-4">
                    <div className="h-32 overflow-y-auto pr-2 text-[11px] font-medium text-surface-600 leading-relaxed scrollbar-thin scrollbar-thumb-surface-200">
                      본인은 아래의 모든 운영 규정에 동의합니다.<br /><br />
                      개인정보 위수탁: 배송 목적의 고객 정보 안전 취급 및 파기<br />
                      물류 및 CS: 24시간 이내 송장 등록(드롭쉬핑) 및 제품 하자 시 교환/환불 책임 부담<br />
                      거래 질서: 플랫폼 우회 직거래 금지 및 위반 시 영구 제명<br />
                      정산: 시스템 자동 산출 로직에 따른 대금 정산 수용
                    </div>
                  </div>

                  <div 
                    onClick={() => setIsAgreed(!isAgreed)}
                    className={`flex items-start gap-3 rounded-2xl p-5 border-2 transition-all cursor-pointer ${isAgreed ? 'border-brand-500 bg-brand-500/5' : 'border-surface-100 bg-surface-50 hover:border-surface-200'}`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${isAgreed ? 'border-brand-500 bg-brand-500' : 'border-surface-300'}`}>
                      {isAgreed && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-bold ${isAgreed ? 'text-brand-500' : 'text-surface-900'}`}>
                      [필수] 온팬즈 파트너 입점 약관 및 개인정보 처리 위탁 전체 동의
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !isAgreed}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-950 py-5 font-bold text-white transition-all hover:bg-black hover:shadow-premium-lg active:scale-[0.98] disabled:opacity-20 disabled:hover:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={22} className="animate-spin" /> 처리 중...
                  </>
                ) : (
                  <>
                    입점 제안 완료하기 <CheckCircle2 size={22} />
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
