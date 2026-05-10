import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Truck, Wallet, CheckCircle2, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';

function PartnerApply() {
  const [formData, setFormData] = useState({
    instagram_id: '',
    email: '',
    category: 'fashion'
  });
  const [userIp, setUserIp] = useState('');
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
      terms_version: 'v1.0',
      user_type: 'influencer'
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
        .from('influencers')
        .insert([
          {
            instagram_id: formData.instagram_id,
            email: formData.email,
            category: formData.category,
            status: 'pending',
            ...extraData,
            // 개별 항목 호환성 유지
            agree_ads_law: true,
            agree_tax_info: true,
            agree_no_direct_trade: true,
            agree_disclaimer: true,
            agree_ops_guide: true
          }
        ]);

      if (dbError) throw dbError;
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
            <CheckCircle2 size={56} className="text-brand-500" />
          </div>
          <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">입점 신청 완료!</h2>
          <p className="mb-10 max-w-md text-surface-400 font-medium text-lg leading-relaxed">
            파트너 신청이 성공적으로 접수되었습니다. 담당자가 영업일 기준 1~2일 내에 이메일 및 인스타그램 DM으로 연락드리겠습니다.
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-8 sm:px-12">
        <div className="glass-light rounded-full px-6 py-2.5 flex items-center shadow-premium-lg">
          <div className="text-xs font-black tracking-tighter text-white/90">ONFANS</div>
        </div>
      </nav>

      <section className="pt-32 pb-12 px-6 sm:px-12 sm:pt-48">
        <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
          <h1 className="mb-6 text-[36px] font-black leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-8xl break-keep">
            무재고로 시작하는<br />
            <span className="text-gradient mt-2">나만의 브랜드.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-surface-400 sm:text-xl font-medium break-keep">
            재고 부담, 배송, CS 스트레스 없이 오직 콘텐츠에만 집중하세요. 온팬즈가 당신의 커머스를 현실로 만듭니다.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-12 animate-fade-in duration-700">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-[2rem] glass p-8 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
            <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500 shadow-premium-sm">
              <Package size={28} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">재고 부담 제로</h3>
            <p className="text-surface-400 font-medium leading-relaxed">공장에서 직접 배송되는 시스템으로 재고 리스크가 전혀 없습니다.</p>
          </div>
          <div className="rounded-[2rem] glass p-8 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
            <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500 shadow-premium-sm">
              <Truck size={28} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">배송/CS 100% 대행</h3>
            <p className="text-surface-400 font-medium leading-relaxed">골치 아픈 배송 처리와 고객 응대는 모두 온팬즈가 책임집니다.</p>
          </div>
          <div className="rounded-[2rem] glass p-8 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
            <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500 shadow-premium-sm">
              <Wallet size={28} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">투명한 자동 정산</h3>
            <p className="text-surface-400 font-medium leading-relaxed">마진율에 따른 수익금이 지정된 계좌로 안전하게 자동 정산됩니다.</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12 animate-fade-in-up duration-1000">
        <div className="mx-auto max-w-2xl rounded-[2.5rem] bg-white p-8 sm:p-14 shadow-premium-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
          
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-surface-950 sm:text-4xl">파트너 입점 신청</h2>
          <p className="mb-10 text-surface-500 font-medium">아래 정보를 입력해주시면 빠르게 검토 후 연락드리겠습니다.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col gap-2.5">
              <label htmlFor="instagram_id" className="text-sm font-bold text-surface-900 ml-1">인스타그램 ID</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 font-bold text-lg">@</span>
                <input 
                  type="text" 
                  id="instagram_id" 
                  name="instagram_id" 
                  required
                  placeholder="onfans_official"
                  value={formData.instagram_id}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 py-4 pl-11 pr-5 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="email" className="text-sm font-bold text-surface-900 ml-1">연락용 이메일 주소</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                placeholder="example@naver.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-surface-100 bg-surface-50 px-5 py-4 font-bold text-surface-950 transition-all focus:border-surface-950 focus:bg-white focus:outline-none placeholder:text-surface-300"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="category" className="text-sm font-bold text-surface-900 ml-1">주요 활동 카테고리</label>
              <div className="relative">
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category}
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

            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> 이용약관 및 동의
              </h4>
              
              <div className="rounded-2xl border-2 border-surface-100 bg-surface-50 p-4">
                <div className="h-32 overflow-y-auto pr-2 text-[11px] font-medium text-surface-600 leading-relaxed scrollbar-thin scrollbar-thumb-surface-200">
                  본인은 아래의 모든 운영 규정에 동의합니다.<br /><br />
                  광고법 준수: 경제적 대가 관계 표기 의무화 및 허위 광고 시 본인 책임 서약<br />
                  정산 및 세무: 수익금 지급 및 원천세(3.3%) 신고를 위한 신분증/계좌 정보 활용 동의<br />
                  직거래 금지: 플랫폼 승인 없는 제조사 개별 연락 및 우회 거래 시도 금지<br />
                  면책 확인: 플랫폼은 시스템 중개자이며 배송/품질 책임은 제조사에 있음을 확인
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
                  [필수] 온팬즈 셀러 이용약관 및 개인정보 수집·이용 전체 동의
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !isAgreed}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-950 py-5 font-bold text-white transition-all hover:bg-black hover:shadow-premium-lg active:scale-[0.98] disabled:opacity-20 disabled:hover:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" /> 처리 중...
                </>
              ) : (
                <>
                  입점 신청하기 <ChevronRight size={22} />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default PartnerApply;
