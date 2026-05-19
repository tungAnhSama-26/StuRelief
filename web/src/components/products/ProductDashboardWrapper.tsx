'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Item } from '@/domain/entities/Item';
import ProductCard from './ProductCard';
import SearchAndFilter from './SearchAndFilter';
import ImageUpload from './ImageUpload';
import { Check, AlertCircle, PackageOpen, X, MessageSquare, Trash2 } from 'lucide-react';

interface ProductDashboardWrapperProps {
  initialItems: Item[];
  total: number;
  myTotal: number;
  page: number;
  limit: number;
  search?: string;
  category?: string;
  categories: string[];
}

const ProductDashboardWrapper: React.FC<ProductDashboardWrapperProps> = ({
  initialItems,
  total,
  myTotal,
  page,
  limit,
  search = '',
  category = 'Tất cả danh mục',
  categories,
}) => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [totalCount, setTotalCount] = useState(total);
  const [myTotalCount, setMyTotalCount] = useState(myTotal);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: 'STUDENT' | 'ADMIN'; fullName: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error('Lỗi khi fetch current user:', err);
      }
    };
    fetchUser();
  }, []);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setItems(initialItems);
    setTotalCount(total);
    setMyTotalCount(myTotal);
  }, [initialItems, total, myTotal]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const displayedItems = activeTab === 'all'
    ? items
    : items.filter((item) => currentUser && item.studentId === currentUser.id);

  const handleOpenCreate = () => {
    if (!currentUser) {
      showFeedback('Bạn cần đăng nhập để đăng tin bán sản phẩm!', 'error');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    setFormName('');
    setFormPrice(0);
    setFormCategory(categories[0] || '');
    setFormDescription('');
    setFormImage('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!formName.trim()) {
      showFeedback('Tên sản phẩm không được để trống!', 'error');
      return;
    }
    if (formPrice < 0) {
      showFeedback('Giá sản phẩm không được âm!', 'error');
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          price: Number(formPrice),
          category: formCategory,
          description: formDescription,
          images: [formImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop'],
          studentId: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error();

      const newProduct = await response.json();
      setItems([newProduct, ...items]);
      setTotalCount((prev) => prev + 1);
      setMyTotalCount((prev) => prev + 1);
      setIsCreateOpen(false);
      showFeedback('Đăng tin bán sản phẩm thành công!');
      router.refresh();
    } catch {
      showFeedback('Đã có lỗi xảy ra khi thêm sản phẩm!', 'error');
    }
  };

  const handleOpenEdit = (product: Item) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategory(categories.includes(product.category) ? product.category : (categories[0] || ''));
    setFormDescription(product.description || '');
    setFormImage(product.images[0] || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!formName.trim()) {
      showFeedback('Tên sản phẩm không được để trống!', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          price: Number(formPrice),
          category: formCategory,
          description: formDescription,
          images: [formImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop'],
          studentId: selectedProduct.studentId,
        }),
      });

      if (!response.ok) throw new Error();

      const updatedProduct = await response.json();
      setItems(items.map((item) => item.id === selectedProduct.id ? updatedProduct : item));
      setIsEditOpen(false);
      showFeedback('Cập nhật tin rao thành công!');
      router.refresh();
    } catch {
      showFeedback('Đã có lỗi xảy ra khi sửa sản phẩm!', 'error');
    }
  };

  const handleOpenDelete = (product: Item) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      setItems(items.filter((item) => item.id !== selectedProduct.id));
      setTotalCount((prev) => prev - 1);
      if (currentUser && selectedProduct.studentId === currentUser.id) {
        setMyTotalCount((prev) => prev - 1);
      }
      setIsDeleteOpen(false);
      showFeedback('Đã xóa sản phẩm thành công!');
      router.refresh();
    } catch {
      showFeedback('Đã có lỗi xảy ra khi xóa sản phẩm!', 'error');
    }
  };

  const handleOpenDetail = (product: Item) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div className="w-full">
      {feedback && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-lg flex items-center gap-3 border transition-all duration-300 animate-slide-in ${
          feedback.type === 'success'
            ? 'bg-emerald-500/90 text-white border-emerald-400'
            : 'bg-rose-500/90 text-white border-rose-400'
        }`}>
          <span>{feedback.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</span>
          <span className="font-semibold text-sm">{feedback.message}</span>
        </div>
      )}

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-4 px-6 text-sm font-bold transition-all relative ${
            activeTab === 'all'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Tất cả tin rao ({totalCount})
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-4 px-6 text-sm font-bold transition-all relative ${
            activeTab === 'my'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Sản phẩm của tôi ({currentUser ? items.filter((item) => item.studentId === currentUser.id).length : myTotalCount})
          {activeTab === 'my' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
        </button>
      </div>

      <SearchAndFilter
        initialSearch={search}
        initialCategory={category}
        initialLimit={limit}
        onOpenCreateModal={handleOpenCreate}
        categories={categories}
      />

      {displayedItems.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <PackageOpen className="w-16 h-16 text-zinc-400 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-1">Không tìm thấy sản phẩm nào</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Hãy thử đổi từ khóa tìm kiếm hoặc đăng bán sản phẩm mới!</p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all"
          >
            Đăng bán sản phẩm ngay
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {displayedItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            isMyProduct={product.studentId === currentUser?.id || currentUser?.role === 'ADMIN'}
          />
        ))}
      </div>

      {isDetailOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="relative h-64 md:h-80 w-full bg-zinc-100 dark:bg-zinc-800">
              <img
                src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full">
                  {selectedProduct.category}
                </span>
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-full">
                  Tình trạng: Khá tốt
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white mb-2 leading-snug">{selectedProduct.name}</h2>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-6">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
              </p>
              <hr className="border-zinc-200 dark:border-zinc-800 my-4" />
              <div className="mb-6">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-wide">Mô tả chi tiết</h4>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                  {selectedProduct.description || 'Chủ bài đăng không cung cấp mô tả thêm cho sản phẩm này.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    showFeedback('Đã sao chép thông tin liên hệ của sinh viên!');
                  }}
                  className="flex-1 py-3 bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Nhắn tin trao đổi ngay
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl text-sm transition-all"
                >
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">Đăng bán sản phẩm mới</h2>
                <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-full text-zinc-500 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Giáo trình Triết học Mác-Lênin"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Giá bán (VND) *</label>
                    <input
                      type="text"
                      required
                      value={formPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formPrice)}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, '');
                        setFormPrice(cleanValue ? Number(cleanValue) : 0);
                      }}
                      placeholder="50.000"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Danh mục *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Mô tả thêm</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Tình trạng sách, số điện thoại Zalo..."
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <ImageUpload value={formImage} onChange={setFormImage} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all">
                    Đăng tin ngay
                  </button>
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 font-bold rounded-2xl text-sm transition-all">
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">Chỉnh sửa tin rao</h2>
                <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-full text-zinc-500 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Giá bán (VND) *</label>
                    <input
                      type="text"
                      required
                      value={formPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formPrice)}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, '');
                        setFormPrice(cleanValue ? Number(cleanValue) : 0);
                      }}
                      placeholder="50.000"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Danh mục *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-semibold"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">Mô tả thêm</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <ImageUpload value={formImage} onChange={setFormImage} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all">
                    Lưu thay đổi
                  </button>
                  <button type="button" onClick={() => setIsEditOpen(false)} className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 font-bold rounded-2xl text-sm transition-all">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up">
            <div className="p-6 md:p-8 text-center">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white mb-2">Xác nhận xóa tin?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-zinc-800 dark:text-zinc-200">{selectedProduct.name}</strong>? Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition-all">
                  Xác nhận
                </button>
                <button onClick={() => setIsDeleteOpen(false)} className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 font-bold rounded-2xl text-sm transition-all">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDashboardWrapper;
