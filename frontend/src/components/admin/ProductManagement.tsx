import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Loader2, X, Check, Package, Link, Users, Sparkles, Plus, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  factory_cost: number;
  seller_price: number;
  image_urls: string[];
  status: string;
  stock_quantity: number;
  category: string;
  factory_id: string;
  assigned_influencer_ids: string[];
}

interface Influencer {
  id: string;
  instagram_id: string;
  category: string;
  status: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [matchingProduct, setMatchingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        setProducts([]);
        setInfluencers([]);
        setLoading(false);
        return;
      }
      
      const [productsRes, influencersRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('influencers').select('id, instagram_id, category, status').eq('status', 'approved')
      ]);
        
      if (productsRes.error) throw productsRes.error;
      if (influencersRes.error) throw influencersRes.error;

      setProducts((productsRes.data as Product[]).map(p => ({
        ...p,
        assigned_influencer_ids: p.assigned_influencer_ids || []
      })));
      setInfluencers(influencersRes.data as Influencer[]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingProduct) return;
    const { name, value } = e.target;
    
    if (name === 'image_url') {
      setEditingProduct({ ...editingProduct, image_urls: [value] });
    } else {
      setEditingProduct({ ...editingProduct, [name]: value });
    }
  };

  const handleAddNewClick = () => {
    window.open('/factory-apply', '_blank');
  };

  const handleMatchClick = (product: Product) => {
    setMatchingProduct({ ...product });
  };

  const handleMatchToggle = (influencerId: string) => {
    if (!matchingProduct) return;
    const currentMatches = matchingProduct.assigned_influencer_ids || [];
    const isCurrentlyMatched = currentMatches.includes(influencerId);
    
    setMatchingProduct({
      ...matchingProduct,
      assigned_influencer_ids: isCurrentlyMatched
        ? currentMatches.filter(id => id !== influencerId)
        : [...currentMatches, influencerId]
    });
  };

  const handleSaveMatching = async () => {
    if (!matchingProduct) return;
    setSaving(true);
    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        const { error } = await supabase
          .from('products')
          .update({ assigned_influencer_ids: matchingProduct.assigned_influencer_ids })
          .eq('id', matchingProduct.id);
        if (error) throw error;
      }
      alert('매칭 정보가 성공적으로 업데이트되었습니다.');
      setMatchingProduct(null);
      fetchData();
    } catch (err: any) {
      console.error('Error saving matches:', err);
      alert(`오류 발생: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);

    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        const { error } = await supabase
          .from('products')
          .update({
            name: editingProduct.name,
            description: editingProduct.description,
            factory_cost: editingProduct.factory_cost,
            seller_price: editingProduct.seller_price,
            image_urls: editingProduct.image_urls,
            status: editingProduct.status,
            stock_quantity: editingProduct.stock_quantity,
            category: editingProduct.category
          })
          .eq('id', editingProduct.id);
        if (error) throw error;
      }
      
      alert('상품 정보가 성공적으로 수정되었습니다.');
      setEditingProduct(null);
      setIsAddingNew(false);
      fetchData(); 
    } catch (err: any) {
      console.error('Error updating product:', err);
      alert(`오류 발생: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('상품이 삭제되었습니다.');
      fetchData();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(`삭제 중 오류 발생: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center glass rounded-[2rem]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-500" size={32} />
          <p className="text-sm font-bold text-surface-400">상품 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] glass overflow-hidden shadow-premium-xl border-white/5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 bg-white/5 px-8 py-8 sm:px-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package size={20} className="text-brand-400" />
            <h2 className="text-2xl font-black text-white tracking-tight">전체 상품 관리</h2>
          </div>
          <p className="text-surface-400 font-medium">공장 신청서가 들어오면 이곳에 자동으로 상품이 생성됩니다.</p>
        </div>
        <button 
          onClick={handleAddNewClick}
          className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition-all hover:bg-brand-500 hover:text-white hover:shadow-premium-lg active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} />
          새 상품 등록
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="bg-white/5 text-surface-500 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">상품 정보</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">공장 원가</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">판매가</th>
              <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">매칭 현황</th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Package className="text-surface-700" size={48} />
                    <p className="text-surface-500 font-bold">등록된 상품이 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-surface-900 border border-white/5">
                        {product.image_urls?.[0] ? (
                          <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package size={24} className="text-surface-800" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="font-black text-white line-clamp-1 group-hover:text-brand-400 transition-colors">{product.name}</div>
                        <div className="text-xs text-surface-500 font-medium line-clamp-1">{product.description || '설명 없음'}</div>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold">
                          <span className="text-surface-600 flex items-center gap-1">
                            <Link size={10} />
                            onfans.club/product/{product.id.split('-')[0]}...
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`https://onfans.club/product/${product.id}`);
                              alert('상품 판매 링크가 복사되었습니다.');
                            }}
                            className="text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            링크 복사
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right font-bold text-surface-400">
                    {Number(product.factory_cost).toLocaleString()}원
                  </td>
                  <td className="px-6 py-6 text-right font-black text-white text-base">
                    {Number(product.seller_price).toLocaleString()}원
                  </td>
                  <td className="px-6 py-6 text-center">
                    {(() => {
                      const autoMatched = influencers.filter(inf => inf.category === product.category);
                      const manualMatched = influencers.filter(inf => product.assigned_influencer_ids?.includes(inf.id));
                      const totalMatched = Array.from(new Set([...autoMatched, ...manualMatched]));
                      
                      return (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/5 text-brand-400 font-black text-xs border border-brand-500/10">
                            <Users size={12} />
                            {totalMatched.length}명 매칭
                          </div>
                          {totalMatched.length > 0 && (
                            <span className="text-[10px] font-bold text-surface-600 truncate max-w-[120px]">
                              {totalMatched.slice(0, 2).map(m => m.instagram_id).join(', ')}
                              {totalMatched.length > 2 && ' ...'}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleMatchClick(product)}
                        className="inline-flex items-center gap-2 rounded-xl bg-surface-900 border border-white/5 px-4 py-2.5 text-xs font-black text-surface-300 transition-all hover:bg-surface-800 hover:text-white"
                      >
                        <Users size={14} />
                        매칭 관리
                      </button>
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-black text-white transition-all hover:bg-white/10 hover:shadow-premium-md"
                      >
                        <Edit2 size={14} />
                        정보 수정
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs font-black text-red-400 transition-all hover:bg-red-500 hover:text-white hover:shadow-premium-md"
                      >
                        <Trash2 size={14} />
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 수정 모달 */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-surface-950 border border-white/10 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/5 px-10 py-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <Edit2 size={20} />
                </div>
                <h2 className="text-xl font-black text-white">{isAddingNew ? '새 상품 등록' : '상품 정보 수정'}</h2>
              </div>
              <button onClick={() => { setEditingProduct(null); setIsAddingNew(false); }} className="rounded-full p-2 text-surface-500 hover:bg-white/5 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">상품명 (고객 노출용)</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={editingProduct.name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">공장 원가 (원)</label>
                  <input
                    type="number"
                    name="factory_cost"
                    required
                    value={editingProduct.factory_cost}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">셀러 판매가 (원)</label>
                  <input
                    type="number"
                    name="seller_price"
                    required
                    value={editingProduct.seller_price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">대표 이미지 URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={editingProduct.image_urls[0] || ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">판매 상태</label>
                  <select
                    name="status"
                    value={editingProduct.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="inactive">비활성 (판매 대기)</option>
                    <option value="active">판매 중 (고객 구매 가능)</option>
                    <option value="out_of_stock">품절</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">카테고리</label>
                  <select
                    name="category"
                    value={editingProduct.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="fashion">의류 / 패션잡화</option>
                    <option value="beauty">뷰티 / 코스메틱</option>
                    <option value="living">리빙 / 홈데코</option>
                    <option value="digital">디지털 / 전자기기</option>
                    <option value="food">식품 / 건강</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">재고 수량</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={editingProduct.stock_quantity}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest">상세 설명</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={editingProduct.description}
                    onChange={handleChange}
                    className="w-full resize-none rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
                  />
                </div>
              </div>

              <div className="mt-12 flex items-center justify-end gap-4 border-t border-white/5 pt-10">
                <button
                  type="button"
                  onClick={() => { setEditingProduct(null); setIsAddingNew(false); }}
                  className="rounded-2xl px-8 py-4 text-sm font-black text-surface-500 hover:bg-white/5 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-2xl bg-brand-500 px-10 py-4 text-sm font-black text-white shadow-premium-lg transition-all hover:bg-brand-600 hover:shadow-brand-500/20 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                  업데이트 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 수동 매칭 모달 */}
      {matchingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-surface-950 border border-white/10 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/5 px-10 py-6">
              <div>
                <h2 className="text-xl font-black text-white">셀러 매칭 관리</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles size={12} className="text-brand-400" />
                  <p className="text-xs font-bold text-surface-500 line-clamp-1">{matchingProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setMatchingProduct(null)} className="rounded-full p-2 text-surface-500 hover:bg-white/5 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-4">
                {influencers.map(influencer => {
                  const isAutoMatched = influencer.category === matchingProduct.category;
                  const isManuallyMatched = matchingProduct.assigned_influencer_ids?.includes(influencer.id);
                  
                  return (
                    <label 
                      key={influencer.id}
                      className={`group flex items-center justify-between rounded-2xl border-2 p-5 transition-all cursor-pointer ${
                        isAutoMatched ? 'border-green-500/30 bg-green-500/5' : 
                        isManuallyMatched ? 'border-brand-500/30 bg-brand-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-white group-hover:text-brand-400 transition-colors">{influencer.instagram_id}</span>
                        <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest">{influencer.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAutoMatched ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-premium-sm">
                            <Check size={14} />
                          </div>
                        ) : (
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              checked={isManuallyMatched}
                              onChange={() => handleMatchToggle(influencer.id)}
                              className="peer h-6 w-6 appearance-none rounded-lg border-2 border-white/10 bg-white/5 transition-all checked:bg-brand-500 checked:border-brand-500 cursor-pointer"
                            />
                            <Check size={14} className="absolute left-1.5 pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-white/5 p-8 bg-white/5">
              <button
                onClick={() => setMatchingProduct(null)}
                className="rounded-2xl px-6 py-4 text-sm font-black text-surface-500 hover:bg-white/5 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSaveMatching}
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-brand-500 px-10 py-4 text-sm font-black text-white shadow-premium-lg transition-all hover:bg-brand-600 hover:shadow-brand-500/20 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                매칭 정보 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
