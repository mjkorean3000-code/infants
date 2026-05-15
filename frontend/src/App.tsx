import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PartnerApply from './pages/PartnerApply';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import FactoryApply from './pages/FactoryApply';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  // 'APPLY' (입점 신청 전용), 'MAIN' (대시보드/판매 전용), 'ALL' (통합 - 로컬용)
  const appType = import.meta.env.VITE_APP_TYPE || 'ALL';

  return (
    <Router>
      <Routes>
        {/* MAIN 전용 또는 ALL 환경에서만 보이는 페이지 (대시보드, 상품, 결제, 로그인) */}
        {appType !== 'APPLY' && (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product/:id/:code" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* APPLY 전용 또는 ALL 환경에서만 보이는 페이지 (입점 신청서) */}
        {appType !== 'MAIN' && (
          <>
            <Route path="/apply" element={<PartnerApply />} />
            <Route path="/factory-apply" element={<FactoryApply />} />
            {/* APPLY 전용 모드일 때 메인 도메인으로 접속하면 파트너 신청서로 자동 이동 */}
            {appType === 'APPLY' && <Route path="/" element={<Navigate to="/apply" replace />} />}
          </>
        )}

        {/* 그 외 없는 주소로 접속 시 메인으로 돌려보냄 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
