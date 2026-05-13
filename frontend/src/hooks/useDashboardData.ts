import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardData {
  influencer: {
    id: string;
    name: string;
    tracking_link: string;
    settlement_rate: number;
    category: string;
  } | null;
  summary: {
    totalSalesMonth: number;
    estimatedProfit: number;
    newOrdersToday: number;
  };
  revenueChart: { date: string; revenue: number }[];
  recentOrders: {
    id: string;
    productName: string;
    status: string;
    orderDate: string;
    amount: number;
  }[];
  loading: boolean;
}

// 빈 데이터로 대체 (거짓 정보 제거)
const EMPTY_DATA: DashboardData = {
  influencer: null,
  summary: {
    totalSalesMonth: 0,
    estimatedProfit: 0,
    newOrdersToday: 0,
  },
  revenueChart: [],
  recentOrders: [],
  loading: false,
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    influencer: null,
    summary: { totalSalesMonth: 0, estimatedProfit: 0, newOrdersToday: 0 },
    revenueChart: [],
    recentOrders: [],
    loading: true,
  });

  const fetchData = async () => {
    // 환경변수가 없으면 빈 데이터 사용 (로컬 테스트용)
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setTimeout(() => setData(EMPTY_DATA), 500);
      return;
    }

    try {
      // 1. 셀러 로그인 데이터가 localStorage에 있으면 우선 사용 (SNS ID 로그인은 Supabase Auth 세션 없음)
      const savedSeller = localStorage.getItem('seller_data');
      let influencer: any = savedSeller ? JSON.parse(savedSeller) : null;
      let influencerId: string | null = influencer?.id || null;

      // localStorage 없으면 Supabase Auth 세션 확인 (어드민 로그인 등)
      if (!influencer) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          influencerId = user.id;
          const { data } = await supabase
            .from('influencers')
            .select('*')
            .eq('id', influencerId)
            .single();
          influencer = data;
        }
      }

      if (!influencerId || !influencer) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      // 2. 이번 달 주문 내역 조회
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: orders } = await supabase
        .from('orders')
        .select('*, products(name)')
        .eq('influencer_id', influencerId)
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: false });

      if (influencer && orders) {
        const totalSalesMonth = orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
        const estimatedProfit = totalSalesMonth * (influencer.settlement_rate / 100);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newOrdersToday = orders.filter(o => new Date(o.created_at) >= today).length;

        const recentOrders = orders.slice(0, 5).map(o => ({
          id: o.id,
          productName: o.products?.name || '알 수 없는 상품',
          status: o.status,
          orderDate: o.created_at,
          amount: Number(o.total_amount)
        }));

        const revenueChart: { date: string; revenue: number }[] = [];

        setData({
          influencer: {
            id: influencer.id,
            name: influencer.name || influencer.instagram_id,
            tracking_link: influencer.tracking_link || '',
            settlement_rate: Number(influencer.settlement_rate) || 0,
            category: influencer.category || 'fashion'
          },
          summary: { totalSalesMonth, estimatedProfit, newOrdersToday },
          revenueChart,
          recentOrders,
          loading: false
        });
      } else {
        // 인플루언서 정보가 없는 경우 (승인 대기 또는 어드민 계정)
        setData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(EMPTY_DATA);
    }
  };

  useEffect(() => {
    fetchData();

    // Supabase Realtime Subscription (주문 정보 변경 시 자동 새로고침)
    // 환경 변수가 제대로 설정되어 있을 때만 실행
    if (import.meta.env.VITE_SUPABASE_URL !== undefined) {
      const channel = supabase.channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('Realtime event received!', payload);
            fetchData(); // 변경 감지 시 데이터 재조회 (새로고침 없이 반영)
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return data;
};
