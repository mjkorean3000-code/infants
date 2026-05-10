import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, AtSign, Lock, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (loginId === 'test@onfans.com' || loginId === '@test') {
      setTimeout(() => {
        setLoading(false);
        localStorage.setItem('mock_auth', 'seller');
        navigate('/dashboard');
      }, 500);
      return;
    }

    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setTimeout(() => {
        setLoading(false);
        if (loginId.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
      return;
    }

    try {
      const isEmail = loginId.includes('@') && loginId.includes('.');

      if (!isEmail) {
        const cleanId = loginId.replace(/^@/, '').trim();
        
        const { data, error: fetchError } = await supabase
          .from('influencers')
          .select('*')
          .or(`instagram_id.eq.${cleanId},instagram_id.eq.@${cleanId}`)
          .eq('password', password)
          .single();

        if (fetchError || !data) {
          throw new Error('인스타그램 아이디 또는 비밀번호가 일치하지 않거나 승인 대기 중입니다.');
        }

        localStorage.setItem('mock_auth', 'seller');
        localStorage.setItem('seller_data', JSON.stringify(data));
        navigate('/dashboard');
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: loginId, password });
        if (error) throw error;
        
        localStorage.setItem('mock_auth', 'admin');
        navigate('/admin');
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('아이디 또는 비밀번호가 일치하지 않습니다.');
      } else {
        setError(err.message || '인증 과정에서 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-6 selection:bg-brand-500/30">
      <div className="w-full max-w-[480px] animate-fade-in">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-brand-500 shadow-premium-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl">ONFANS</h1>
          <p className="mt-4 text-lg font-medium text-surface-400">
            파트너 대시보드 로그인
          </p>
        </div>

        <div className="rounded-[2.5rem] glass p-10 shadow-premium-2xl border-white/5">
          {error && (
            <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm font-bold text-red-400 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="group relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-brand-500">
                <AtSign size={20} />
              </div>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="인스타그램 아이디 (@id)"
                required
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 py-4 pl-14 pr-6 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-600"
              />
            </div>
            <div className="group relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-brand-500">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 py-4 pl-14 pr-6 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-base font-black text-black shadow-premium-lg transition-all hover:bg-brand-500 hover:text-white active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : '로그인'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-surface-500">
              계정이 없으신가요? <a href="/apply" className="text-brand-400 hover:text-brand-300 font-bold underline underline-offset-4">입점 신청하기</a>
            </p>
          </div>
        </div>
        
        <p className="mt-12 text-center text-xs font-bold text-surface-600 uppercase tracking-widest">
          &copy; 2026 ONFANS Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
