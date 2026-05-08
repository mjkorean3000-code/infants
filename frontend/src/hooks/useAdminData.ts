import { useState, useEffect } from 'react';

export interface AdminData {
  factorySettlements: {
    id: string;
    productName: string;
    factoryName: string;
    supplyPrice: number;
    salesCount: number;
    totalAmount: number;
    status: string;
  }[];
  influencerSettlements: {
    id: string;
    influencerName: string;
    trackingCode: string;
    salesCount: number;
    totalSalesAmount: number;
    factoryPayment: number;
    platformFee: number;
    taxAmount: number;
    finalAmount: number;
    status: string;
  }[];
  loading: boolean;
}

const MOCK_ADMIN_DATA: AdminData = {
  factorySettlements: [
    {
      id: 'fs1',
      productName: '프리미엄 오버핏 맨투맨',
      factoryName: '제일 패션팩토리',
      supplyPrice: 15000,
      salesCount: 120,
      totalAmount: 1800000,
      status: 'pending'
    }
  ],
  influencerSettlements: [
    {
      id: 'is1',
      influencerName: '뷰티크리에이터 지니',
      trackingCode: 'A1B2',
      salesCount: 120,
      totalSalesAmount: 4680000, // 39000원 * 120
      factoryPayment: 1800000,
      platformFee: 468000, // 10%
      taxAmount: 79596, // (4680000 - 1800000 - 468000) * 0.033
      finalAmount: 2332404,
      status: 'pending'
    }
  ],
  loading: false,
};

export const useAdminData = () => {
  const [data, setData] = useState<AdminData>({
    factorySettlements: [],
    influencerSettlements: [],
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

  return { data };
};
