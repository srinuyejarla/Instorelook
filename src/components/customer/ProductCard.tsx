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
    <motion.article layout whileTap={{ scale: 0.98 }} className={`${widthClass} text-left bg-white rounded-[1.35rem] border border-slate-200/80 shadow-[0_8px_30px_rgba(20,20,20,0.04)] overflow-hidden flex flex-col transition-shadow hover:shadow-lg`}>
      <button type="button" onClick={() => onOpen(product.id)} className="relative block aspect-[3/4] w-full overflow-hidden bg-slate-100 text-left" aria-label={`View ${product.name}`}>
        <img src={productImage(product)} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
        {off > 0 && <span className="absolute left-2 top-2 orange-ribbon rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-wider shadow-sm">{off}% OFF</span>}
        {outOfStock && <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]"><span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">Out of Stock</span></div>}
      </button>

      <div className="flex flex-col gap-1 p-3">
        <span className={`self-start rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${isDemoCatalog ? 'bg-[#eff8cf] text-[#40520b]' : 'bg-[#e4f7da] text-[#2f7e1a]'}`}>
          {isDemoCatalog ? 'Sample catalog · verify in store' : 'Live store inventory'}
        </span>
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={() => onOpen(product.id)} className="min-w-0 text-left" aria-label={`View ${product.name}`}>
            {product.brand && <span className="line-clamp-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{product.brand}</span>}
            <h3 className="line-clamp-2 min-h-[2rem] text-xs font-bold leading-snug text-[#1A1A1A]">{product.name}</h3>
          </button>
          <button type="button" onClick={() => toggle(product)} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save item'} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white active:scale-90">
            <Icons.Favorite size={15} className={saved ? 'text-rose-500' : 'text-slate-400'} fill={saved ? '#f43f5e' : 'none'} />
          </button>
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm font-black text-[#1A1A1A]">{formatPrice(product)}</span>
          {product.mrp && product.mrp > product.price && <span className="text-[10px] font-bold text-slate-400 line-through">{formatPrice({ price: product.mrp, currency: product.currency })}</span>}
        </div>
      </div>
    </motion.article>
  );
}
