import React from 'react';
import { motion } from 'motion/react';
import * as Icons from '../Icons';
import { Product, productImage, discountPct, formatPrice } from '../../lib/customerApi';
import { useWishlist } from '../../context/WishlistContext';
import { isDemoCatalog } from '../../config';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onOpen: (id: string) => void;
  variant?: 'grid' | 'carousel';
}

export default function ProductCard({ product, onOpen, variant = 'grid' }: ProductCardProps) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const off = discountPct(product);
  const outOfStock = product.status === 'Out of Stock' || product.stock === 0;

  const widthClass = variant === 'carousel' ? 'w-52 sm:w-56 shrink-0' : 'w-full';

  return (
    <motion.button
      layout
      onClick={() => onOpen(product.id)}
      whileTap={{ scale: 0.97 }}
      className={`${widthClass} text-left bg-white rounded-[1.35rem] border border-slate-200/80 shadow-[0_8px_30px_rgba(20,20,20,0.04)] overflow-hidden flex flex-col active:shadow-md transition-shadow`}
    >
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {off > 0 && (
          <span className="absolute top-2 left-2 orange-ribbon text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
            {off}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle(product);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          aria-label={saved ? 'Remove from saved' : 'Save item'}
        >
          <Icons.Favorite
            size={16}
            className={saved ? 'text-rose-500' : 'text-slate-400'}
            fill={saved ? '#f43f5e' : 'none'}
          />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <span className={`self-start rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${isDemoCatalog ? 'bg-[#eff8cf] text-[#40520b]' : 'bg-[#e4f7da] text-[#2f7e1a]'}`}>
          {isDemoCatalog ? 'Curated demo catalog' : 'Live store inventory'}
        </span>
        {product.brand && (
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">
            {product.brand}
          </span>
        )}
        <h3 className="text-xs font-bold text-[#1A1A1A] line-clamp-2 leading-snug min-h-[2rem]">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-0.5">
           <span className="text-sm font-black text-[#1A1A1A]">{formatPrice(product)}</span>
           {product.mrp && product.mrp > product.price && (
             <span className="text-[10px] font-bold text-slate-400 line-through">{formatPrice({ price: product.mrp, currency: product.currency })}</span>
           )}
        </div>
      </div>
    </motion.button>
  );
}
