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
    monthOverMonthPct: number | null;   // null = 비교 불가 (지난달 데이터 없음)
    dayOverDayDiff: number | null;       // null = 비교 불가 (어제 데이터 없음)
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

const EMPTY_DATA: DashboardData = {
  influencer: null,
  summary: {
    totalSalesMonth: 0,
    estimatedProfit: 0,
    newOrdersToday: 0,
    monthOverMonthPct: null,
    dayOverDayDiff: null,
  },
  revenueChart: [],
  recentOrders: [],
  loading: false,
};

const formatDate = (date: Date) =>
  `${date.getMonth() + 1}/${date.getDate()}`;

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    influencer: null,
    summary: { totalSalesMonth: 0, estimatedProfit: 0, newOrdersToday: 0, monthOverMonthPct: null, dayOverDayDiff: null },
    revenueChart: [],
    recentOrders: [],
    loading: true,
  });

  const fetchData = async () => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setTimeout(() => setData(EMPTY_DATA), 500);
      return;
    }

    try {
      const savedSeller = localStorage.getItem('seller_data');
      let influencer: any = savedSeller ? JSON.parse(savedSeller) : null;
      let influencerId: string | null = influencer?.id || null;

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

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const start30Days = new Date(now);
      start30Days.setDate(now.getDate() - 29);
      start30Days.setHours(0, 0, 0, 0);

      // 최근 30일 주문 (이번달 합산 + 7일 차트 + 오늘/어제 비교)
      const { data: orders30 } = await supabase
        .from('orders')
        .select('*, products(name)')
        .eq('influencer_id', influencerId)
        .gte('created_at', start30Days.toISOString())
        .order('created_at', { ascending: false });

      // 지난달 주문 (전월 비교용)
      const { data: lastMonthOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('influencer_id', influencerId)
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString());

      const orders = orders30 || [];

      // 이번 달 판매액
      const thisMonthOrders = orders.filter(o => new Date(o.created_at) >= startOfMonth);
      const totalSalesMonth = thisMonthOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);
      const estimatedProfit = totalSalesMonth * ((influencer.settlement_rate || 0) / 100);

      // 전월 대비 증감률
      const lastMonthTotal = (lastMonthOrders || []).reduce((acc, o) => acc + Number(o.total_amount), 0);
      let monthOverMonthPct: number | null = null;
      if (lastMonthTotal > 0) {
        monthOverMonthPct = ((totalSalesMonth - lastMonthTotal) / lastMonthTotal) * 100;
      } else if (totalSalesMonth > 0) {
        monthOverMonthPct = 100;
      }

      // 오늘 / 어제 주문 수
      const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
      const yesterdayOrders = orders.filter(o => {
        const d = new Date(o.created_at);
        return d >= startOfYesterday && d < startOfToday;
      });
      const newOrdersToday = todayOrders.length;
      const dayOverDayDiff = newOrdersToday - yesterdayOrders.length;

      // 최근 5건 주문
      const recentOrders = orders.slice(0, 5).map(o => ({
        id: o.id,
        productName: o.products?.name || '알 수 없는 상품',
        status: o.status,
        orderDate: o.created_at,
        amount: Number(o.total_amount),
      }));

      // 최근 7일 일별 수익 차트
      const revenueChart: { date: string; revenue: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        const dayRevenue = orders
          .filter(o => {
            const d = new Date(o.created_at);
            return d >= day && d < nextDay;
          })
          .reduce((acc, o) => acc + Number(o.total_amount), 0);
        revenueChart.push({ date: formatDate(day), revenue: dayRevenue });
      }

      setData({
        influencer: {
          id: influencer.id,
          name: influencer.name || influencer.instagram_id,
          tracking_link: influencer.tracking_link || '',
          settlement_rate: Number(influencer.settlement_rate) || 0,
          category: influencer.category || 'fashion',
        },
        summary: { totalSalesMonth, estimatedProfit, newOrdersToday, monthOverMonthPct, dayOverDayDiff },
        revenueChart,
        recentOrders,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(EMPTY_DATA);
    }
  };

  useEffect(() => {
    fetchData();

    if (import.meta.env.VITE_SUPABASE_URL !== undefined) {
      const channel = supabase.channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('Realtime event received!', payload);
            fetchData();
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
