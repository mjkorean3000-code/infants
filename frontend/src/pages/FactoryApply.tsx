import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, ChevronRight, Loader2, XCircle, ShoppingBag, ShieldCheck, BarChart3, Users, ArrowRight } from 'lucide-react';

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
    phone: '',
    main_category: 'fashion',
    product_image_url: '',
    consumer_price: '',
    supply_price: ''
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [isNotificationAgreed, setIsNotificationAgreed] = useState(false);
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
    if (!isAgreed || !isNotificationAgreed) {
      alert('필수 약관 및 알림 수신에 모두 동의해야 신청이 가능합니다.');
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
      const insertData = {
        is_dropshipping: true,
        company_name: formData.company_name,
        manager_email: formData.manager_email,
        phone: formData.phone,
        main_category: formData.main_category,
        product_image_url: formData.product_image_url,
        consumer_price: parseFloat(formData.consumer_price),
        supply_price: parseFloat(formData.supply_price),
        status: 'pending',
        ...extraData,
        agree_personal_info: true,
        agree_logistics: true,
        agree_cs_quality: true,
        agree_no_direct_trade: true,
        agree_auto_settlement: true,
        agree_notification: isNotificationAgreed
      };

      let { error: dbError } = await supabase
        .from('factory_applications')
        .insert([insertData]);

      // DB에 agree_ 관련 컬럼이 아직 없을 경우 대비한 폴백 처리 (phone은 이제 DB에 있으므로 보존)
      if (dbError && (dbError.message.includes('column') || dbError.code === 'PGRST204')) {
        const { agree_personal_info, agree_logistics, agree_cs_quality, agree_no_direct_trade, agree_auto_settlement, agree_notification, is_agreed, agreed_at, user_ip, terms_version, ...fallbackData } = insertData as any;
        const { error: fallbackError } = await supabase.from('factory_applications').insert([fallbackData]);
        if (fallbackError) throw fallbackError;
      } else if (dbError) {
        throw dbError;
      }
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
        <div className="glass-light rounded-full p-1 flex items-center shadow-premium-lg">
          <img src="/logo.jpg" alt="ONFANS" className="h-11 w-11 sm:h-14 sm:w-14 rounded-full object-cover shadow-premium-sm" />
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 sm:gap-3 glass-light rounded-full p-1.5 shadow-premium-lg">
            <button 
              onClick={() => navigate('/factory-apply')}
              className={`px-6 py-2.5 text-xs sm:text-sm font-black tracking-tight rounded-full transition-all ${
                location.pathname === '/factory-apply' 
                  ? 'bg-white text-black shadow-premium-sm' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              제조사 입점
            </button>
            <button 
              onClick={() => navigate('/apply')}
              className={`px-6 py-2.5 text-xs sm:text-sm font-black tracking-tight rounded-full transition-all ${
                location.pathname === '/apply' 
                  ? 'bg-white text-black shadow-premium-sm' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              셀러(인플루언서) 입점
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-12 px-6 sm:px-12 sm:pt-48">
        <div className="mx-auto max-w-5xl text-center animate-fade-in-up">
          <div className="mb-4 inline-flex rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-bold text-brand-400">
            공장 파트너 전용
          </div>
          <h1 className="mb-6 text-[36px] font-black leading-[1.2] tracking-tight text-white sm:text-7xl lg:text-8xl break-keep">
            생산만 하세요.<br />
            <span className="text-gradient mt-2">판매는 파트너들이 해줍니다.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-surface-400 sm:text-xl font-medium break-keep">
            마케팅, CS, 정산, 셀러 관리 — 이제 하나도 직접 안 하셔도 됩니다.<br />상품 정보 등록 한 번으로, 수백 명의 인플루언서가 팬덤에 직접 판매합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-surface-300">❌ 마케팅 비용 0원</span>
            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-surface-300">❌ 재고 리스크 없음</span>
            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-surface-300">❌ CS 인력 불필요</span>
            <span className="rounded-full bg-brand-500/10 border border-brand-500/20 px-4 py-2 text-sm font-bold text-brand-400">✅ 확정 주문만 생산·발송</span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-12 animate-fade-in duration-700">
        <div className="mx-auto max-w-4xl rounded-[2rem] glass p-8 shadow-premium-lg border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-8 sm:gap-0">
            <div className="flex flex-col items-center text-center py-4 sm:py-0">
              <span className="text-4xl font-black text-white mb-2">3분</span>
              <span className="text-surface-400 font-medium">입점 신청 완료까지</span>
            </div>
            <div className="flex flex-col items-center text-center py-4 sm:py-0">
              <span className="text-4xl font-black text-white mb-2">0원</span>
              <span className="text-surface-400 font-medium">초기 비용·월 고정비</span>
            </div>
            <div className="flex flex-col items-center text-center py-4 sm:py-0">
              <span className="text-4xl font-black text-white mb-2">100%</span>
              <span className="text-surface-400 font-medium">확정 주문 후 발송</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12 animate-fade-in-up duration-1000">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <ShoppingBag size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">상품 등록만 하면 끝</h3>
              <p className="text-surface-400 font-medium leading-relaxed">복잡한 쇼핑몰 세팅 없이 상품 정보 입력 한 번으로 수백 개 채널에 동시 노출됩니다.</p>
            </div>
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <BarChart3 size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">실시간 주문 대시보드</h3>
              <p className="text-surface-400 font-medium leading-relaxed">주문이 들어오면 시스템이 자동으로 데이터를 전달합니다. 엑셀 정리도, 별도 연락도 없습니다.</p>
            </div>
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <Users size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">인플루언서 팬덤 직공략</h3>
              <p className="text-surface-400 font-medium leading-relaxed">이미 신뢰가 쌓인 팬덤 채널을 통한 판매라 광고비 없이도 전환율이 높습니다.</p>
            </div>
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <ShieldCheck size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">직거래 방지 구조</h3>
              <p className="text-surface-400 font-medium leading-relaxed">자동 정산 파이프라인으로 셀러와의 직거래를 시스템이 차단합니다. 안정적인 수익 구조를 보장합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white sm:text-4xl">입점 전 vs 후, 공장의 하루</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[2rem] bg-red-950/20 border border-red-500/20 p-10">
              <div className="mb-6 inline-flex rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-400">
                지금까지
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 직접 마케팅 채널 운영
                </li>
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 인플루언서 개별 협상
                </li>
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 정산 엑셀 수작업
                </li>
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 반품·CS 직접 대응
                </li>
              </ul>
            </div>
            
            <div className="rounded-[2rem] bg-brand-900/20 border border-brand-500/30 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="mb-6 inline-flex rounded-full bg-brand-500/20 px-4 py-2 text-sm font-bold text-brand-400 relative z-10">
                온팬즈 입점 후
              </div>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> 상품 정보 한 번 등록
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> 주문 알림 확인 후 발송
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> 정산 자동 리포트 수령
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> 생산·품질에만 집중
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 text-brand-400 font-bold animate-pulse">
            지금 입점하면 초기 노출 우선권이 주어집니다. 선착순 마감.
          </p>
          <button 
            onClick={() => {
              document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-10 py-5 text-lg font-black text-white shadow-brand-500/20 shadow-premium-xl transition-all hover:bg-brand-600 hover:scale-105 active:scale-95 mb-6"
          >
            공장 입점 신청하기 <ArrowRight size={20} />
          </button>
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-surface-500">
            <span>별도 계약 없음</span>
            <span className="w-1 h-1 rounded-full bg-surface-700" />
            <span>초기 비용 없음</span>
            <span className="w-1 h-1 rounded-full bg-surface-700" />
            <span>언제든 탈퇴 가능</span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12 animate-fade-in duration-700">
        <div id="apply-form" className="scroll-mt-32 mx-auto max-w-2xl rounded-[2.5rem] bg-white p-8 sm:p-14 shadow-premium-xl relative overflow-hidden">
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
                <p className="text-surface-600 leading-relaxed font-medium break-keep">
                  온팬즈는 주문 발생 시 공급사에서 고객에게 <span className="text-brand-600 font-black">낱개 단위로 개별 발송(택배 발송)</span>하는 방식으로 운영됩니다. (자체 물류 또는 외부 풀필먼트 활용 모두 가능) 이 방식의 업무 이행이 가능하신가요?
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
                  <label htmlFor="phone" className="text-sm font-bold text-surface-900 ml-1">담당자 휴대폰 번호</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    required
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
                  />
                  <span className="text-[12px] text-brand-500 ml-1 font-bold">💡 정확한 번호를 입력하지 않으실 경우, 주문 및 정산 알림을 받지 못해 불이익이 발생할 수 있습니다.</span>
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
                      [파트너 입점 및 운영 규정 동의]<br />
                      개인정보 위수탁: 플랫폼으로부터 전달받은 고객의 배송 정보를 배송 및 CS 목적 외에 사용하지 않으며, 목적 달성 후 안전하게 파기합니다.<br />
                      물류 및 CS: 낱개 단위 개별 발송(드롭쉬핑)을 원칙으로 하며, 주문 확인 후 24시간 이내 송장 등록 및 제품 하자에 대한 교환/환불 책임을 부담합니다.<br />
                      거래 질서: 플랫폼 우회 직거래 시도를 금지하며, 위반 시 서비스 이용 제한 및 위약금이 부과될 수 있습니다.<br />
                      정산: 플랫폼 시스템의 자동 산출 로직(공급가 기준)에 따른 대금 정산 방식에 동의합니다.<br /><br />
                      [알림톡 발송을 위한 개인정보 수집 및 이용]<br />
                      - 수집 항목: 담당자 휴대폰 번호<br />
                      - 이용 목적: 신규 주문 발생, 셀러 매칭 및 샘플 요청 알림, 정산 및 지급 안내 (알림톡 불가 시 문자 대체 발송)<br />
                      - 보유 및 이용 기간: 서비스 이용 종료 시까지 또는 법정 보유 기간까지<br /><br />
                      [영업 양도 등에 따른 개인정보의 이전]<br />
                      회사는 합병, 분할 또는 영업양도 등으로 개인정보를 이전하는 경우, 정보주체에게 이전 사실을 통지하고 관련 법령을 준수합니다.
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

                  <div 
                    onClick={() => setIsNotificationAgreed(!isNotificationAgreed)}
                    className={`flex items-start gap-3 rounded-2xl p-5 border-2 transition-all cursor-pointer ${isNotificationAgreed ? 'border-brand-500 bg-brand-500/5' : 'border-surface-100 bg-surface-50 hover:border-surface-200'}`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${isNotificationAgreed ? 'border-brand-500 bg-brand-500' : 'border-surface-300'}`}>
                      {isNotificationAgreed && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-bold ${isNotificationAgreed ? 'text-brand-500' : 'text-surface-900'}`}>
                      [필수] 서비스 이용에 필요한 정보성 알림(주문, 정산 등) 수신 동의
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !isAgreed || !isNotificationAgreed}
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
// build trigger Wed May 13 17:10:10 KST 2026
