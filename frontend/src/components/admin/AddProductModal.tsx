import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Package, Info, DollarSign, Image as ImageIcon } from 'lucide-react';
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
        const { error } = await supabase.from('products').insert([
          {
            name: formData.name,
            description: formData.description,
            factory_id: formData.factory_id || null,
            factory_cost: parseFloat(formData.factory_cost),
            seller_price: parseFloat(formData.seller_price),
            image_urls: [formData.image_url],
            stock_quantity: parseInt(formData.stock_quantity, 10),
            status: 'active'
          }
        ]);
        if (error) throw error;
      } else {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-surface-950 border border-white/10 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-white/5 px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <Plus size={24} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">새 상품 등록</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-surface-500 hover:bg-white/5 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} /> 상품명
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 프리미엄 오버핏 쭈리 맨투맨"
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> 공급 공장 선택
              </label>
              <select
                name="factory_id"
                value={formData.factory_id}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">공장 선택 (테스트용)</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.company_name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} /> 공장 원가 (원)
              </label>
              <input
                type="number"
                name="factory_cost"
                required
                value={formData.factory_cost}
                onChange={handleChange}
                placeholder="예: 15000"
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} /> 셀러 판매가 (원)
              </label>
              <input
                type="number"
                name="seller_price"
                required
                value={formData.seller_price}
                onChange={handleChange}
                placeholder="예: 39000"
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} /> 메인 이미지 URL
              </label>
              <input
                type="url"
                name="image_url"
                required
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} /> 초기 재고 (개)
              </label>
              <input
                type="number"
                name="stock_quantity"
                required
                value={formData.stock_quantity}
                onChange={handleChange}
                placeholder="예: 100"
                className="w-full rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-2.5 block text-xs font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                상세 설명
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="상품에 대한 상세 설명을 입력해주세요."
                className="w-full resize-none rounded-2xl border-2 border-white/5 bg-white/5 px-5 py-4 font-bold text-white transition-all focus:border-brand-500 focus:bg-surface-900 focus:outline-none placeholder:text-surface-700"
              />
            </div>
          </div>

          <div className="mt-12 flex items-center justify-end gap-4 border-t border-white/5 pt-10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-8 py-4 text-sm font-black text-surface-500 hover:bg-white/5 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-brand-500 px-10 py-4 text-sm font-black text-white shadow-premium-lg transition-all hover:bg-brand-600 hover:shadow-brand-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              상품 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
