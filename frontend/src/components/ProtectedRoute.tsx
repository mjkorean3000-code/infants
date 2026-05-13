import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // 관리자 페이지 접근 시 권한 체크 (@onfans.club 도메인 이메일만 허용)
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const userEmail = session.user.email || '';
        
        if (isAdminRoute && !userEmail.endsWith('@onfans.club')) {
          console.warn('관리자 권한이 없는 계정입니다:', userEmail);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // 로그인 상태 변화 실시간 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      const isAdminRoute = window.location.pathname.startsWith('/admin');
      const userEmail = session.user.email || '';

      if (isAdminRoute && !userEmail.endsWith('@onfans.club')) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
