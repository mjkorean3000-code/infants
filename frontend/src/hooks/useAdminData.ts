import { useState, useEffect } from 'react';

export interface AdminData {
  summary: {
    totalGmv: number;
    activeFactories: number;
    activeSellers: number;
    pendingOrders: number;
  };
  factoryApprovals: {
    id: string;
    name: string;
    contactInfo: string;
    status: 'pending' | 'approved';
    requestDate: string;
  }[];
  settlements: {
    id: string;
    targetType: 'factory' | 'seller';
    targetName: string;
    amount: number;
    status: string;
  }[];
  loading: boolean;
}

const MOCK_ADMIN_DATA: AdminData = {
  summary: {
    totalGmv: 458900000,
    activeFactories: 12,
    activeSellers: 145,
    pendingOrders: 328,
  },
  factoryApprovals: [
    { id: 'f1', name: '신성 정밀공업', contactInfo: '010-1234-5678', status: 'pending', requestDate: '2026-05-02' },
    { id: 'f2', name: '제일 패션팩토리', contactInfo: '010-9876-5432', status: 'pending', requestDate: '2026-05-03' },
  ],
  settlements: [
    { id: 's1', targetType: 'factory', targetName: '대양 에코플라스틱', amount: 15400000, status: 'pending' },
    { id: 's2', targetType: 'seller', targetName: '뷰티크리에이터 지니', amount: 3200000, status: 'pending' },
    { id: 's3', targetType: 'seller', targetName: '테크리뷰어 김테크', amount: 4800000, status: 'completed' },
  ],
  loading: false,
};

export const useAdminData = () => {
  const [data, setData] = useState<AdminData>({
    summary: { totalGmv: 0, activeFactories: 0, activeSellers: 0, pendingOrders: 0 },
    factoryApprovals: [],
    settlements: [],
    loading: true,
  });

  useEffect(() => {
    // 실제 Supabase 연동 시, 여기에서 Admin 권한으로 데이터를 Fetch합니다.
    // 현재는 목업 데이터를 반환합니다.
    const fetchData = async () => {
      setTimeout(() => {
        setData(MOCK_ADMIN_DATA);
      }, 600);
    };

    fetchData();
  }, []);

  const approveFactory = (id: string) => {
    // 실제 DB 연동 시: supabase.from('factories').update({ status: 'approved' }).eq('id', id);
    setData(prev => ({
      ...prev,
      factoryApprovals: prev.factoryApprovals.map(f => 
        f.id === id ? { ...f, status: 'approved' } : f
      )
    }));
  };

  return { data, approveFactory };
};
