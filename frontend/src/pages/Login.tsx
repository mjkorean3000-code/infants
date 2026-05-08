import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, AtSign, Lock } from 'lucide-react';

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

    // 개발/테스트용 계정 강제 우회 로직 (실제 DB에 없어도 로그인 되도록)
    if (loginId === 'test@onfans.com' || loginId === 'admin@onfans.com' || loginId === '@test') {
      setTimeout(() => {
        setLoading(false);
        // 목업 인증 토큰 저장 (ProtectedRoute 우회용)
        localStorage.setItem('mock_auth', loginId.includes('admin') ? 'admin' : 'seller');
        
        if (loginId.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
      return;
    }

    // 환경 변수 설정 안된 경우 시뮬레이션 로직
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
      // 이메일 형식(관리자)인지, 일반 아이디(셀러)인지 구분
      const isEmail = loginId.includes('@') && loginId.includes('.');

      if (!isEmail) {
        // 인플루언서(셀러) SNS 아이디 로그인 처리
        const cleanId = loginId.replace(/^@/, '').trim();
        
        const { data, error: fetchError } = await supabase
          .from('influencers')
          .select('*')
          .or(`instagram_id.eq.${cleanId},instagram_id.eq.@${cleanId}`)
          .eq('password', password)
          .single();

        if (fetchError || !data) {
          console.error("Login fetch error:", fetchError);
          throw new Error('인스타그램 아이디 또는 비밀번호가 일치하지 않거나 승인 대기 중입니다.');
        }

        // 로그인 성공 (셀러)
        localStorage.setItem('mock_auth', 'seller');
        navigate('/dashboard');
        
      } else {
        // 관리자 이메일 로그인 처리
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tighter text-black">ONFANS</h1>
          <p className="mt-2 text-sm text-gray-500">
            파트너 대시보드에 로그인하세요.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="인스타그램 아이디"
              required
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 font-medium text-black transition-colors focus:border-black focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
