'use client';

import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Item } from '@/domain/entities/Item';
import { aiImageUrl } from '@/lib/aiImage';
import { PRODUCT_STATUS_CLASSES, PRODUCT_STATUS_LABELS } from '@shared';

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
            src={product.images[0] || aiImageUrl(`realistic AI student marketplace product photo of ${product.name}`, { width: 400, height: 400, seed: product.id })}
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

          {product.status !== 'AVAILABLE' && (
            <div className="absolute top-3 left-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${PRODUCT_STATUS_CLASSES[product.status]}`}>
                {PRODUCT_STATUS_LABELS[product.status]}
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
        <div className={`flex items-center ${isMyProduct ? 'gap-2' : ''}`}>
          <button
            onClick={() => onDetail?.(product)}
            className={`h-10 w-10 shrink-0 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all flex items-center justify-center`}
            aria-label="Xem chi tiết"
            title="Xem chi tiết"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>

          {isMyProduct && (
            <>
              <button
                onClick={() => onEdit?.(product)}
                className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 transition-all flex items-center justify-center"
                aria-label="Sửa"
                title="Sửa"
              >
                <Pencil className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => onDelete?.(product)}
                className="h-10 w-10 shrink-0 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 transition-all flex items-center justify-center"
                aria-label="Xóa"
                title="Xóa"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
