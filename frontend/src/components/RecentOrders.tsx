import type { DashboardData } from '../hooks/useDashboardData';
import { ChevronRight, ListOrdered } from 'lucide-react';

interface Props {
  orders: DashboardData['recentOrders'];
}

export const RecentOrders = ({ orders }: Props) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'paid':
        return <span className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-500 border border-orange-500/20">결제완료</span>;
      case 'preparing':
        return <span className="inline-flex items-center rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-500 border border-brand-500/20">상품준비중</span>;
      case 'shipping':
        return <span className="inline-flex items-center rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-500 border border-brand-500/20">배송중</span>;
      case 'delivered':
        return <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500 border border-green-500/20">배송완료</span>;
      case 'cancelled':
      case 'refunded':
        return <span className="inline-flex items-center rounded-full bg-surface-800 px-3 py-1 text-xs font-bold text-surface-500">취소/환불</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-surface-800 px-3 py-1 text-xs font-bold text-surface-400">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full rounded-[2rem] glass p-8 shadow-premium-lg">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-surface-900 flex items-center justify-center">
            <ListOrdered size={20} className="text-surface-400" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">최근 주문 내역</h3>
        </div>
        <button className="flex items-center gap-1 text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors">
          전체 보기
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-surface-700">
                <ListOrdered size={48} />
              </div>
              <p className="text-surface-500 font-bold">최근 주문 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-5 flex flex-col gap-3 group transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white mb-1 group-hover:text-brand-400 transition-colors line-clamp-1">{order.productName}</p>
                      <p className="text-xs font-medium text-surface-500">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{order.amount.toLocaleString()}원</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(order.status)}
                    <div className="text-[10px] font-black text-surface-600 tracking-widest uppercase">
                      ID: {order.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {orders.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="rounded-2xl bg-surface-900/50 p-4 border border-white/5">
            <p className="text-xs font-bold text-surface-500 text-center uppercase tracking-widest">
              최근 5개 항목만 표시됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
