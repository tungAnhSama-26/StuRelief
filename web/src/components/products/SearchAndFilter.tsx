'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus } from 'lucide-react';

interface SearchAndFilterProps {
  initialSearch?: string;
  initialCategory?: string;
  initialLimit?: number;
  onOpenCreateModal: () => void;
  categories: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  initialSearch = '',
  initialCategory = 'Tất cả danh mục',
  initialLimit = 8,
  onOpenCreateModal,
  categories,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'Tất cả danh mục');
    setLimit(Number(searchParams.get('limit')) || 8);
  }, [searchParams]);

  const applyFilters = (searchVal: string, catVal: string, limitVal: number) => {
    const params = new URLSearchParams();
    params.set('page', '1');
    if (limitVal !== 8) params.set('limit', String(limitVal));
    if (searchVal.trim()) params.set('search', searchVal.trim());
    if (catVal && catVal !== 'Tất cả danh mục') params.set('category', catVal);
    router.push(`/?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, category, limit);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setCategory(cat);
    applyFilters(search, cat, limit);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lim = Number(e.target.value);
    setLimit(lim);
    applyFilters(search, category, lim);
  };

  const handleClear = () => {
    setSearch('');
    setCategory('Tất cả danh mục');
    setLimit(8);
    router.push('/');
  };

  const allCategoriesOptions = ['Tất cả danh mục', ...categories];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm sách vở, đồ dùng, điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all"
        >
          Tìm kiếm
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={limit}
          onChange={handleLimitChange}
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all font-medium cursor-pointer"
        >
          <option value="8">8 tin / trang</option>
          <option value="12">12 tin / trang</option>
          <option value="16">16 tin / trang</option>
          <option value="24">24 tin / trang</option>
        </select>

        <select
          value={category}
          onChange={handleCategoryChange}
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all font-medium cursor-pointer"
        >
          {allCategoriesOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {(search.trim() || category !== 'Tất cả danh mục' || limit !== 8) && (
          <button
            onClick={handleClear}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm font-semibold px-3 py-3"
          >
            Xóa bộ lọc
          </button>
        )}

        <button
          onClick={onOpenCreateModal}
          className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold px-5 py-3 rounded-2xl text-sm transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Đăng bán ngay
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
