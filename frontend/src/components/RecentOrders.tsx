import type { DashboardData } from '../hooks/useDashboardData';

interface Props {
  orders: DashboardData['recentOrders'];
}

export const RecentOrders = ({ orders }: Props) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'paid':
        return <span className="inline-flex items-center rounded-md bg-warning-light px-2.5 py-1 text-xs sm:text-sm font-semibold text-warning">결제완료</span>;
      case 'preparing':
        return <span className="inline-flex items-center rounded-md bg-primary-light px-2.5 py-1 text-xs sm:text-sm font-semibold text-primary">상품준비중</span>;
      case 'shipping':
        return <span className="inline-flex items-center rounded-md bg-primary-light px-2.5 py-1 text-xs sm:text-sm font-semibold text-primary">배송중</span>;
      case 'delivered':
        return <span className="inline-flex items-center rounded-md bg-success-light px-2.5 py-1 text-xs sm:text-sm font-semibold text-success">배송완료</span>;
      case 'cancelled':
      case 'refunded':
        return <span className="inline-flex items-center rounded-md bg-bg-surface-hover px-2.5 py-1 text-xs sm:text-sm font-semibold text-gray-500">취소/환불</span>;
      default:
        return <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs sm:text-sm font-semibold text-gray-700">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">최근 주문 내역</h3>
        <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
          전체 보기
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">상품명</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">주문 금액</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">상태</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-500">주문 일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-400">
                  최근 주문 내역이 없습니다.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm sm:text-base font-medium text-gray-900">{order.productName}</td>
                  <td className="px-4 py-4 text-sm sm:text-base font-semibold text-gray-900">{order.amount.toLocaleString()}원</td>
                  <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-4 text-xs sm:text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
