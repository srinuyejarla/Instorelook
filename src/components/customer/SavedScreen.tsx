import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from '../Icons';
import { Navigate } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { fallbackImage, discountPct, formatPrice } from '../../lib/customerApi';
import { isDemoCatalog } from '../../config';

interface Props {
  navigate: Navigate;
}

export default function SavedScreen({ navigate }: Props) {
  const { items, remove, clear, count } = useWishlist();

  return (
    <div className="min-h-full bg-[#f7f7f2] pb-10">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e4e3db] bg-[#f7f7f2]/95 px-5 pb-4 pt-5 backdrop-blur-xl sm:px-8">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.05em] text-[#171717]">Saved Items</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {count} item{count === 1 ? '' : 's'}
          </p>
        </div>
        {count > 0 && (
          <button type="button" onClick={clear} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-rose-500 active:scale-95">
            Clear all
          </button>
        )}
      </header>

      {count === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-10 py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-5">
            <Icons.Favorite size={36} className="text-rose-300" />
          </div>
          <p className="text-base font-black text-[#1A1A1A]">Nothing saved yet</p>
          <p className="text-xs font-medium text-slate-500 mt-1.5 mb-6 leading-relaxed">
            Tap the heart on any item to keep it here for when you head to the store.
          </p>
          <button
            onClick={() => navigate('customer_home')}
            className="rounded-full bg-[#171717] px-6 py-3 text-xs font-black uppercase tracking-widest text-white"
          >
            Start Browsing
          </button>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 pt-5 sm:px-8 lg:grid-cols-3">
          <AnimatePresence>
            {items.map((it) => {
              const off = discountPct({ ...it, id: it.id, name: it.name, price: it.price } as any);
              return (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col overflow-hidden rounded-[1.35rem] border border-[#deded5] bg-white shadow-[0_8px_30px_rgba(20,20,20,0.04)]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <button type="button" onClick={() => navigate('customer_product', { selectedProductId: it.id })} className="block h-full w-full">
                      <img src={it.imageUrl || fallbackImage(it.id)} alt={it.name} className="h-full w-full object-cover" />
                    </button>
                    {off > 0 && (
                      <span className="absolute top-2 left-2 orange-ribbon text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                        {off}% OFF
                      </span>
                    )}
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(it.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm active:scale-90"
                      aria-label="Remove"
                    >
                      <Icons.Favorite size={16} className="text-rose-500" fill="#f43f5e" />
                    </button>
                  </div>
                  <button type="button"
                    onClick={() => navigate('customer_product', { selectedProductId: it.id })}
                    className="flex flex-col gap-1 p-3 text-left"
                  >
                    <span className={`self-start rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${isDemoCatalog ? 'bg-[#eff8cf] text-[#40520b]' : 'bg-[#e4f7da] text-[#2f7e1a]'}`}>
                      {isDemoCatalog ? 'Curated demo catalog' : 'Live store inventory'}
                    </span>
                    {it.brand && (
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">{it.brand}</span>
                    )}
                    <h3 className="text-xs font-bold text-[#1A1A1A] line-clamp-2 leading-snug min-h-[2rem]">{it.name}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-[#1A1A1A]">{formatPrice(it)}</span>
                      {it.mrp && it.mrp > it.price && (
                        <span className="text-[10px] font-bold text-slate-400 line-through">{formatPrice({ price: it.mrp, currency: it.currency })}</span>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
