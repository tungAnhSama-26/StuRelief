'use client';

import React from 'react';
import { Item } from '@/domain/entities/Item';
import { Pencil, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Item;
  onDetail?: (product: Item) => void;
  onEdit?: (product: Item) => void;
  onDelete?: (product: Item) => void;
  isMyProduct?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onDetail,
  onEdit,
  onDelete,
  isMyProduct = false,
}) => {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onClick={() => onDetail?.(product)}
            style={{ cursor: 'pointer' }}
          />

          {product.isQuickSell && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                Thanh lý gấp
              </span>
            </div>
          )}

          <div className="absolute bottom-3 right-3">
            <span className="bg-white/80 dark:bg-black/60 backdrop-blur-md text-zinc-800 dark:text-zinc-200 text-xs px-2 py-1 rounded-lg">
              {product.category}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => onDetail?.(product)}
          >
            {product.name}
          </h3>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400">
            {formattedPrice}
          </p>
          {product.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={() => onDetail?.(product)}
          className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all"
        >
          Xem chi tiết
        </button>

        {isMyProduct && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => onEdit?.(product)}
              className="py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <Pencil className="w-3.5 h-3.5" />
              Sửa
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
