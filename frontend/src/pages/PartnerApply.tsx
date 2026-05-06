import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Truck, Wallet, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

function PartnerApply() {
  const [formData, setFormData] = useState({
    instagram_id: '',
    email: '',
    category: 'fashion',
    settlement_account: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        .from('influencers')
        .insert([
          {
            instagram_id: formData.instagram_id,
            email: formData.email,
            category: formData.category,
            settlement_account: formData.settlement_account,
            status: 'pending'
          }
        ]);

      if (error) throw error;
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-white/10 p-4">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">입점 신청 완료!</h2>
          <p className="mb-8 max-w-md text-gray-400">
            파트너 신청이 성공적으로 접수되었습니다. 담당자가 영업일 기준 1~2일 내에 이메일 및 인스타그램 DM으로 연락드리겠습니다.
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
        <div className="text-xl font-black tracking-tighter text-white">ONFANS</div>
        <a href="/factory-apply" className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20">
          공장 입점 제안하기
        </a>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 sm:px-12 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            무재고로 시작하는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">나만의 브랜드.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
            재고 부담, 배송, CS 스트레스 없이 오직 콘텐츠에만 집중하세요. 온팬즈가 당신의 커머스를 현실로 만듭니다.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-20 sm:px-12 lg:pb-32">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-3xl bg-[#111111] border border-white/5 p-8 transition-colors hover:bg-[#1a1a1a]">
            <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-white">
              <Package size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">재고 부담 제로</h3>
            <p className="text-gray-400">공장에서 직접 배송되는 시스템으로 재고 리스크가 전혀 없습니다.</p>
          </div>
          <div className="rounded-3xl bg-[#111111] border border-white/5 p-8 transition-colors hover:bg-[#1a1a1a]">
            <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-white">
              <Truck size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">배송/CS 100% 대행</h3>
            <p className="text-gray-400">골치 아픈 배송 처리와 고객 응대는 모두 온팬즈가 책임집니다.</p>
          </div>
          <div className="rounded-3xl bg-[#111111] border border-white/5 p-8 transition-colors hover:bg-[#1a1a1a]">
            <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-white">
              <Wallet size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">투명한 자동 정산</h3>
            <p className="text-gray-400">마진율에 따른 수익금이 지정된 계좌로 안전하게 자동 정산됩니다.</p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="px-6 pb-32 sm:px-12">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 sm:p-12 shadow-2xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-black sm:text-3xl">파트너 입점 신청</h2>
          <p className="mb-8 text-gray-500">아래 정보를 입력해주시면 빠르게 검토 후 연락드리겠습니다.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="instagram_id" className="text-sm font-bold text-gray-900">인스타그램 ID</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                <input 
                  type="text" 
                  id="instagram_id" 
                  name="instagram_id" 
                  required
                  placeholder="onfans_official"
                  value={formData.instagram_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 py-3 pl-9 pr-4 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-900">연락받으실 이메일</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                placeholder="hello@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-sm font-bold text-gray-900">주요 활동 카테고리</label>
              <select 
                id="category" 
                name="category" 
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none appearance-none"
              >
                <option value="fashion">패션 / 의류</option>
                <option value="beauty">뷰티 / 코스메틱</option>
                <option value="lifestyle">리빙 / 라이프스타일</option>
                <option value="tech">테크 / 전자기기</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="settlement_account" className="text-sm font-bold text-gray-900">정산 계좌번호</label>
              <input 
                type="text" 
                id="settlement_account" 
                name="settlement_account" 
                required
                placeholder="은행명 및 계좌번호 입력"
                value={formData.settlement_account}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
              />
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
                  입점 신청하기 <ChevronRight size={20} />
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
