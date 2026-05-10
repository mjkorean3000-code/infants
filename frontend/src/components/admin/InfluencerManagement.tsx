import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, CheckCircle2, UserCheck, ShieldAlert, Sparkles, Instagram, Mail } from 'lucide-react';

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
    if (!confirm('해당 셀러를 승인하시겠습니까? 고유 링크가 자동으로 발급됩니다.')) return;
    
    setProcessingId(id);
    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        const { error } = await supabase
          .from('influencers')
          .update({ status: 'approved' }) // tracking_link는 DB 트리거가 자동 생성
          .eq('id', id);

        if (error) throw error;
      }
      
      alert('승인 완료! 4자리 고유 코드와 임시 비밀번호가 자동 발급되었습니다.');
      fetchInfluencers();
    } catch (err: any) {
      console.error('Error approving influencer:', err);
      alert(`승인 중 오류 발생: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center glass rounded-[2rem]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-500" size={32} />
          <p className="text-sm font-bold text-surface-400">인플루언서 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] glass overflow-hidden shadow-premium-xl border-white/5 animate-fade-in-up">
      <div className="border-b border-white/5 bg-white/5 px-8 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck size={20} className="text-brand-400" />
            <h2 className="text-2xl font-black text-white tracking-tight">인플루언서 (셀러) 관리</h2>
          </div>
          <p className="text-surface-400 font-medium">입점 신청한 셀러를 승인하고 전용 판매 코드를 발급합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-brand-500/10 border border-brand-500/20 px-4 py-2 text-xs font-bold text-brand-400">
            총 {influencers.length}명
          </div>
          <div className="rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-2 text-xs font-bold text-orange-400">
            대기 {influencers.filter(i => i.status === 'pending').length}명
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="bg-white/5 text-surface-500 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">셀러 정보</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider">카테고리</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">매칭 상품</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">계정 상태</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">임시 비번</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">고유 코드</th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">관리 액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {influencers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <ShieldAlert className="text-surface-700" size={48} />
                    <p className="text-surface-500 font-bold">가입한 인플루언서가 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              influencers.map((influencer) => (
                <tr key={influencer.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 font-black text-white group-hover:text-brand-400 transition-colors">
                        <Instagram size={14} className="opacity-60" />
                        {influencer.instagram_id}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-surface-500">
                        <Mail size={12} className="opacity-40" />
                        {influencer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="rounded-lg bg-surface-900 border border-white/5 px-3 py-1.5 text-xs font-bold text-surface-300 uppercase tracking-wide">
                      {influencer.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {(() => {
                      const matchedCount = products.filter(p => p.category === influencer.category || p.assigned_influencer_ids?.includes(influencer.id)).length;
                      return (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/5 text-brand-400 font-black">
                          <Sparkles size={12} />
                          {matchedCount}개
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-6 text-center">
                    {influencer.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-black text-green-400">
                        <CheckCircle2 size={14} />
                        승인 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-black text-orange-400 animate-pulse">
                        승인 대기
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-center">
                    {influencer.password ? (
                      <span className="font-mono font-black text-orange-400 tracking-widest bg-orange-400/10 border border-orange-400/20 px-3 py-1.5 rounded-lg text-sm shadow-premium-sm">
                        {influencer.password}
                      </span>
                    ) : (
                      <span className="text-surface-700 text-[10px] font-black tracking-widest uppercase">WAITING</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-center">
                    {influencer.tracking_link ? (
                      <span className="font-mono font-black text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg tracking-widest text-sm shadow-premium-sm">
                        {influencer.tracking_link}
                      </span>
                    ) : (
                      <span className="text-surface-700 text-[10px] font-black tracking-widest uppercase">AUTO GEN</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {influencer.status === 'pending' && (
                      <button 
                        onClick={() => handleApprove(influencer.id)}
                        disabled={processingId === influencer.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-black transition-all hover:bg-brand-500 hover:text-white hover:shadow-premium-lg active:scale-95 disabled:opacity-50"
                      >
                        {processingId === influencer.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <UserCheck size={16} />
                            계정 승인
                          </>
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
