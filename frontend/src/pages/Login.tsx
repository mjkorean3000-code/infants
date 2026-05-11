import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AtSign, Loader2 } from 'lucide-react';

export default function Login() {
  const [instagramId, setInstagramId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/dashboard');
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      // 입력값이 이메일 형식이면 그대로 사용, 아니면 @onfans.club을 붙임
      const email = instagramId.includes('@') ? instagramId : `${instagramId}@onfans.club`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-6 selection:bg-brand-500/30">
      <div className="w-full max-w-[480px] animate-fade-in">
        <div className="mb-12 text-center">
          {/* 자물쇠 아이콘을 제거하고 로고를 대폭 강조 */}
          <div className="mx-auto mb-12 flex h-40 w-40 items-center justify-center rounded-full bg-white/5 border border-white/10 p-1 shadow-premium-2xl overflow-hidden">
            <img src="/logo.png" alt="ONFANS" className="w-full h-full object-cover rounded-full" />
          </div>
          <p className="mt-4 text-xl font-bold text-surface-400">
            파트너 대시보드 로그인
          </p>
        </div>

        <div className="rounded-[2.5rem] glass p-10 shadow-premium-2xl border-white/5">
          {error && (
            <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm font-bold text-red-400 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black text-surface-500 uppercase tracking-widest ml-1">Instagram ID</label>
              <div className="relative">
                <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="아이디 입력"
                  value={instagramId}
                  onChange={(e) => setInstagramId(e.target.value)}
                  className="w-full rounded-2xl border-2 border-white/5 bg-white/5 py-4 pl-12 pr-5 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black text-surface-500 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" 
                required
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-6 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-5 text-lg font-black text-black transition-all hover:bg-brand-500 hover:text-white active:scale-95 shadow-premium-lg disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" /> : '로그인'}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-sm font-bold text-surface-600">
          &copy; 2026 ONFANS Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
