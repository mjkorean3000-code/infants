import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Truck, Wallet, CheckCircle2, ChevronRight, Loader2, ShieldCheck, XCircle, BarChart3, ArrowRight } from 'lucide-react';

// Fixed navigate error
function PartnerApply() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    instagram_id: '',
    email: '',
    phone: '',
    category: 'fashion'
  });
  const [userIp, setUserIp] = useState('');
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
      const insertData = {
        instagram_id: formData.instagram_id,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        status: 'pending',
        ...extraData,
        agree_ads_law: true,
        agree_tax_info: true,
        agree_no_direct_trade: true,
        agree_disclaimer: true,
        agree_ops_guide: true,
        agree_notification: isNotificationAgreed
      };

      let { error: dbError } = await supabase
        .from('influencers')
        .insert([insertData]);

      // DB에 phone, agree_notification 컬럼이 아직 없을 경우 대비한 폴백 처리
      if (dbError && (dbError.message.includes('column') || dbError.code === 'PGRST204')) {
        const { phone, agree_notification, ...fallbackData } = insertData as any;
        const { error: fallbackError } = await supabase.from('influencers').insert([fallbackData]);
        if (fallbackError) throw fallbackError;
      } else if (dbError) {
        throw dbError;
      }
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
            파트너 신청이 성공적으로 접수되었습니다. 담당자가 인스타그램 DM으로 비밀번호 발급해드리겠습니다.
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
            셀러 파트너 전용
          </div>
          <h1 className="mb-6 text-[36px] font-black leading-[1.2] tracking-tight text-white sm:text-7xl lg:text-8xl break-keep">
            무재고로 시작하는<br />
            <span className="text-gradient mt-2">나만의 브랜드.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-surface-400 sm:text-xl font-medium break-keep">
            재고 부담, 배송, CS 스트레스 없이 오직 콘텐츠에만 집중하세요.<br />온팬즈가 당신의 커머스를 현실로 만듭니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-surface-300">❌ 초기 자본 0원</span>
            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-surface-300">❌ 재고 관리 없음</span>
            <span className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-surface-300">❌ 배송/CS 처리 없음</span>
            <span className="rounded-full bg-brand-500/10 border border-brand-500/20 px-4 py-2 text-sm font-bold text-brand-400">✅ 링크 공유만으로 수익 창출</span>
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
              <span className="text-surface-400 font-medium">가입비·유지비</span>
            </div>
            <div className="flex flex-col items-center text-center py-4 sm:py-0">
              <span className="text-4xl font-black text-white mb-2">15%~</span>
              <span className="text-surface-400 font-medium">평균 판매 마진율</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12 animate-fade-in-up duration-1000">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <Package size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">무재고 커머스</h3>
              <p className="text-surface-400 font-medium leading-relaxed">자본금 없이 시작하세요. 상품 사입부터 보관까지 온팬즈가 해결합니다.</p>
            </div>
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <Truck size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">배송/CS 100% 대행</h3>
              <p className="text-surface-400 font-medium leading-relaxed">골치 아픈 택배 포장과 고객 응대는 제조사와 온팬즈 시스템이 대신합니다.</p>
            </div>
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <BarChart3 size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">실시간 데이터 확인</h3>
              <p className="text-surface-400 font-medium leading-relaxed">대시보드에서 클릭/판매 건수, 예상 수익금 등을 투명하게 실시간으로 확인하세요.</p>
            </div>
            <div className="rounded-[2rem] glass p-10 transition-all duration-300 hover:bg-surface-900/60 hover-lift">
              <div className="mb-6 inline-flex rounded-2xl bg-brand-500/10 p-4 text-brand-500">
                <Wallet size={28} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">투명한 자동 정산</h3>
              <p className="text-surface-400 font-medium leading-relaxed">판매가 완료되면 사전에 약정된 마진율에 따라 수익금이 지정된 계좌로 정산됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white sm:text-4xl">입점 전 vs 후, 셀러의 하루</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[2rem] bg-red-950/20 border border-red-500/20 p-10">
              <div className="mb-6 inline-flex rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-400">
                지금까지
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 직접 동대문 사입
                </li>
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 매일 택배 포장/발송
                </li>
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 끊임없는 CS 대응
                </li>
                <li className="flex items-center gap-3 text-surface-300 font-medium">
                  <XCircle size={20} className="text-red-500/70 shrink-0" /> 재고로 인한 적자
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
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> 맘에 드는 상품 선택
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> SNS에 판매 링크 공유
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> 배송/CS는 시스템이 알아서
                </li>
                <li className="flex items-center gap-3 text-white font-bold">
                  <CheckCircle2 size={20} className="text-brand-500 shrink-0" /> 수익금만 확인
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 text-brand-400 font-bold animate-pulse">
            지금 가입하시면 다양한 입점 혜택을 제공해 드립니다.
          </p>
          <button 
            onClick={() => {
              document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-10 py-5 text-lg font-black text-white shadow-brand-500/20 shadow-premium-xl transition-all hover:bg-brand-600 hover:scale-105 active:scale-95 mb-6"
          >
            셀러 입점 신청하기 <ArrowRight size={20} />
          </button>
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-surface-500">
            <span>자본금 불필요</span>
            <span className="w-1 h-1 rounded-full bg-surface-700" />
            <span>재고 위험 없음</span>
            <span className="w-1 h-1 rounded-full bg-surface-700" />
            <span>누구나 시작 가능</span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 sm:px-12 animate-fade-in duration-700">
        <div id="apply-form" className="scroll-mt-32 mx-auto max-w-2xl rounded-[2.5rem] bg-white p-8 sm:p-14 shadow-premium-xl relative overflow-hidden">
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
              <label htmlFor="phone" className="text-sm font-bold text-surface-900 ml-1">휴대폰 번호</label>
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
                  [셀러 필수 운영 규정 동의]<br />
                  광고법 준수: 경제적 대가 관계 표기 의무화 및 허위·과대 광고 시 모든 법적 책임은 본인에게 있음을 확인합니다.<br />
                  정산 및 세무: 수익금 지급 및 원천세(3.3%) 신고를 위한 신분증/계좌 정보 수집 및 활용에 동의합니다.<br />
                  직거래 및 유출 금지: 플랫폼 승인 없는 제조사 개별 연락 및 우회 거래를 금지하며, 공급가 등 내부 정보를 제3자에게 유출하지 않습니다.<br />
                  면책 확인: 플랫폼은 시스템 중개자이며 배송/품질/CS 책임은 제조사에 있음을 확인합니다.<br /><br />
                  [알림톡 발송을 위한 개인정보 수집 및 이용]<br />
                  - 수집 항목: 휴대폰 번호<br />
                  - 이용 목적: 샘플 배송 시작, 실시간 수익 발생 알림, 정산 리포트 발행 안내 (알림톡 불가 시 문자 대체 발송)<br />
                  - 보유 및 이용 기간: 회원 탈퇴 시까지 또는 법정 보유 기간까지<br /><br />
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
                  [필수] 온팬즈 셀러 이용약관 및 개인정보 수집·이용 전체 동의
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

            <button 
              type="submit" 
              disabled={isSubmitting || !isAgreed || !isNotificationAgreed}
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
// build trigger Wed May 13 17:10:10 KST 2026
