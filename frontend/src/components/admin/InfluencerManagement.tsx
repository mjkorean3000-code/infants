import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface Influencer {
  id: string;
  instagram_id: string;
  email: string;
  category: string;
  status: string;
  tracking_link: string | null;
  password?: string | null;
  created_at: string;
}

export function InfluencerManagement() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // 목업 데이터
        setInfluencers([
          {
            id: 'mock-1',
            instagram_id: '@test_seller',
            email: 'test@example.com',
            category: 'fashion',
            status: 'pending',
            tracking_link: null,
            password: null,
            created_at: new Date().toISOString()
          }
        ]);
        setLoading(false);
        return;
      }
      
      const [influencersRes, productsRes] = await Promise.all([
        supabase.from('influencers').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, category, assigned_influencer_ids')
      ]);
        
      if (influencersRes.error) throw influencersRes.error;
      setInfluencers(influencersRes.data as Influencer[]);
      if (productsRes.data) {
        setProducts(productsRes.data);
      }
    } catch (err) {
      console.error('Error fetching influencers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('해당 셀러를 승인하고 고유 코드를 발급하시겠습니까?')) return;
    
    setProcessingId(id);
    try {
      // 4자리 고유 코드 생성 (알파벳 대문자 + 숫자)
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // 4자리 숫자 비밀번호 랜덤 생성
      const randomPassword = Math.floor(1000 + Math.random() * 9000).toString();

      if (import.meta.env.VITE_SUPABASE_URL) {
        const { error } = await supabase
          .from('influencers')
          .update({ 
            status: 'approved',
            tracking_link: code,
            password: randomPassword
          })
          .eq('id', id);

        if (error) throw error;
      }
      
      alert(`승인 완료! 고유 코드 [${code}] 와 초기 비밀번호 [${randomPassword}] 가 발급되었습니다.`);
      fetchInfluencers(); // 목록 새로고침
    } catch (err: any) {
      console.error('Error approving influencer:', err);
      alert(`승인 중 오류 발생: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mt-6">
      <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900">인플루언서 (셀러) 관리</h2>
        <p className="text-sm text-gray-500 mt-1">입점 신청한 셀러를 승인하고 전용 판매 코드를 발급합니다.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">인스타그램 ID</th>
              <th className="px-6 py-4 font-semibold">이메일</th>
              <th className="px-6 py-4 font-semibold">카테고리</th>
              <th className="px-6 py-4 font-semibold text-center">매칭된 상품 수</th>
              <th className="px-6 py-4 font-semibold text-center">상태</th>
              <th className="px-6 py-4 font-semibold text-center">초기 비밀번호</th>
              <th className="px-6 py-4 font-semibold text-center">고유 코드</th>
              <th className="px-6 py-4 font-semibold text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {influencers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  가입한 인플루언서가 없습니다.
                </td>
              </tr>
            ) : (
              influencers.map((influencer) => (
                <tr key={influencer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {influencer.instagram_id}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {influencer.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {influencer.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(() => {
                      const matchedCount = products.filter(p => p.category === influencer.category || p.assigned_influencer_ids?.includes(influencer.id)).length;
                      return <span className="font-bold text-blue-600">{matchedCount}개</span>;
                    })()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {influencer.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        <CheckCircle2 size={12} />
                        승인됨
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                        승인 대기
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {influencer.password ? (
                      <span className="font-mono font-bold text-red-600 tracking-widest bg-red-50 px-2 py-1 rounded">
                        {influencer.password}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {influencer.tracking_link ? (
                      <span className="font-mono font-bold text-blue-600 tracking-wider">
                        {influencer.tracking_link}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {influencer.status === 'pending' && (
                      <button 
                        onClick={() => handleApprove(influencer.id)}
                        disabled={processingId === influencer.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {processingId === influencer.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          '가입 승인'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
