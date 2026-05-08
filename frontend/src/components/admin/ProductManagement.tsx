import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Loader2, X, Check } from 'lucide-react';

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
    
    // image_url은 배열의 첫 번째 요소로 처리
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
      fetchData(); // 리스트 새로고침
    } catch (err: any) {
      console.error('Error updating product:', err);
      alert(`오류 발생: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mt-6">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">전체 상품 관리</h2>
          <p className="text-sm text-gray-500 mt-1">공장 신청서가 들어오면 이곳에 자동으로 상품이 생성됩니다.</p>
        </div>
        <button 
          onClick={handleAddNewClick}
          className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
        >
          + 새 상품 등록
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">상품</th>
              <th className="px-6 py-4 font-semibold text-right">공장 원가</th>
              <th className="px-6 py-4 font-semibold text-right">판매가 (소비자가)</th>
              <th className="px-6 py-4 font-semibold">자동 매칭된 셀러</th>
              <th className="px-6 py-4 font-semibold text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  등록된 상품이 없습니다. 공장 입점 신청을 기다려보세요!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {product.image_urls?.[0] ? (
                          <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gray-200"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{product.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{product.description || '설명 없음'}</div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                          <span>🔗 onfans.vercel.app/product/{product.id.split('-')[0]}...</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`https://onfans.vercel.app/product/${product.id}`);
                              alert('상품 판매 링크가 복사되었습니다.');
                            }}
                            className="hover:text-gray-700 underline"
                          >
                            [링크 복사]
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-600">
                    {Number(product.factory_cost).toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {Number(product.seller_price).toLocaleString()}원
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const autoMatched = influencers.filter(inf => inf.category === product.category);
                      const manualMatched = influencers.filter(inf => product.assigned_influencer_ids?.includes(inf.id));
                      const totalMatched = Array.from(new Set([...autoMatched, ...manualMatched]));
                      
                      if (totalMatched.length === 0) return <span className="text-gray-400 text-xs">매칭 없음</span>;
                      
                      return (
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-bold text-blue-600">총 {totalMatched.length}명</span>
                          <span className="text-gray-500 truncate max-w-[150px]" title={totalMatched.map(m => m.instagram_id).join(', ')}>
                            {totalMatched.slice(0, 2).map(m => m.instagram_id).join(', ')}
                            {totalMatched.length > 2 && ' ...'}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleMatchClick(product)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-100"
                      >
                        매칭 관리
                      </button>
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        <Edit2 size={14} />
                        수정
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">{isAddingNew ? '새 상품 등록' : '상품 정보 수정'}</h2>
              <button onClick={() => { setEditingProduct(null); setIsAddingNew(false); }} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">상품명 (고객에게 노출됨)</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={editingProduct.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">공장 원가 (원)</label>
                  <input
                    type="number"
                    name="factory_cost"
                    required
                    value={editingProduct.factory_cost}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">셀러 판매가 (원)</label>
                  <input
                    type="number"
                    name="seller_price"
                    required
                    value={editingProduct.seller_price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">대표 이미지 URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={editingProduct.image_urls[0] || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label className="mb-2 block text-sm font-bold text-gray-700">판매 상태</label>
                  <select
                    name="status"
                    value={editingProduct.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none appearance-none"
                  >
                    <option value="inactive">비활성 (판매 대기)</option>
                    <option value="active">판매 중 (고객 구매 가능)</option>
                    <option value="out_of_stock">품절</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="mb-2 block text-sm font-bold text-gray-700">카테고리</label>
                  <select
                    name="category"
                    value={editingProduct.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none appearance-none"
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
                  <label className="mb-2 block text-sm font-bold text-gray-700">재고 수량</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={editingProduct.stock_quantity}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">상세 설명</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={editingProduct.description}
                    onChange={handleChange}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => { setEditingProduct(null); setIsAddingNew(false); }}
                  className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 수동 매칭 모달 */}
      {matchingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">셀러 매칭 관리</h2>
                <p className="text-xs text-gray-500 mt-1">{matchingProduct.name}</p>
              </div>
              <button onClick={() => setMatchingProduct(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-3">
                {influencers.map(influencer => {
                  const isAutoMatched = influencer.category === matchingProduct.category;
                  const isManuallyMatched = matchingProduct.assigned_influencer_ids?.includes(influencer.id);
                  
                  return (
                    <label 
                      key={influencer.id}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-colors cursor-pointer ${
                        isAutoMatched ? 'border-green-200 bg-green-50' : 
                        isManuallyMatched ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{influencer.instagram_id}</span>
                        <span className="text-xs text-gray-500">카테고리: {influencer.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAutoMatched ? (
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">자동 매칭됨</span>
                        ) : (
                          <input 
                            type="checkbox" 
                            checked={isManuallyMatched}
                            onChange={() => handleMatchToggle(influencer.id)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-6 bg-gray-50/50">
              <button
                onClick={() => setMatchingProduct(null)}
                className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveMatching}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                매칭 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
