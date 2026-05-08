import { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [factories, setFactories] = useState<{ id: string; company_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    factory_id: '',
    factory_cost: '',
    seller_price: '',
    image_url: '',
    stock_quantity: '100'
  });

  useEffect(() => {
    if (isOpen) {
      fetchFactories();
    }
  }, [isOpen]);

  const fetchFactories = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) return;
      const { data, error } = await supabase.from('factory_applications').select('id, company_name');
      if (error) throw error;
      setFactories(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, factory_id: data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching factories:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        // Supabase 연동 시 DB에 저장
        const { error } = await supabase.from('products').insert([
          {
            name: formData.name,
            description: formData.description,
            factory_id: formData.factory_id || null, // 실제 서비스 시 필수
            factory_cost: parseFloat(formData.factory_cost),
            seller_price: parseFloat(formData.seller_price),
            image_urls: [formData.image_url],
            stock_quantity: parseInt(formData.stock_quantity, 10),
            status: 'active'
          }
        ]);
        if (error) throw error;
      } else {
        // 목업 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      alert('상품이 성공적으로 등록되었습니다!');
      onClose();
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(`오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">새 상품 추가</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-gray-700">상품명</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 프리미엄 오버핏 쭈리 맨투맨"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-gray-700">공급 공장</label>
              <select
                name="factory_id"
                value={formData.factory_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none appearance-none"
              >
                <option value="">공장 선택 (테스트용)</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.company_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">공장 원가 (원)</label>
              <input
                type="number"
                name="factory_cost"
                required
                value={formData.factory_cost}
                onChange={handleChange}
                placeholder="예: 15000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">셀러 판매가 (원)</label>
              <input
                type="number"
                name="seller_price"
                required
                value={formData.seller_price}
                onChange={handleChange}
                placeholder="예: 39000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-gray-700">메인 이미지 URL</label>
              <input
                type="url"
                name="image_url"
                required
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-gray-700">초기 재고 (개)</label>
              <input
                type="number"
                name="stock_quantity"
                required
                value={formData.stock_quantity}
                onChange={handleChange}
                placeholder="예: 100"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-gray-700">상품 설명</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="상품에 대한 상세 설명을 입력해주세요."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              상품 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
