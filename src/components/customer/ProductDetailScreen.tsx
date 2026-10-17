import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from '../Icons';
import { Navigate } from '../../types';
import { customerApi, ProductDetail, productImage, discountPct, formatPrice } from '../../lib/customerApi';
import { useWishlist } from '../../context/WishlistContext';
import { isDemoCatalog } from '../../config';

interface Props {
  navigate: Navigate;
  productId?: string;
}

export default function ProductDetailScreen({ navigate, productId }: Props) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const { has, toggle } = useWishlist();

  useEffect(() => {
    setActiveImg(0);
    setSelectedSize(null);
    setNotice('');
    if (!productId) {
      setError(true);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(false);
    customerApi
      .product(productId)
      .then((p) => active && setProduct(p))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId]);

  const shareProduct = async () => {
    if (!product) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: shareUrl });
        return;
      }
      await navigator.clipboard?.writeText(shareUrl);
      setNotice('Link copied');
    } catch {
      setNotice('Sharing was cancelled');
    }
  };

  if (loading) return <DetailSkeleton onBack={() => navigate('customer_home')} />;

  if (error || !product) {
    return (
      <div className="flex flex-col h-full bg-white">
        <TopBar onBack={() => navigate('customer_home')} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <Icons.Warning size={44} className="text-slate-300 mb-3" />
          <p className="text-sm font-black text-[#1A1A1A]">Product not found</p>
          <p className="text-xs font-medium text-slate-500 mt-1 mb-5">It may have been removed or is out of stock.</p>
          <button onClick={() => navigate('customer_search')} className="teal-btn px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">
            Keep Browsing
          </button>
        </div>
      </div>
    );
  }

  const images = (product.images && product.images.length ? product.images : [productImage(product)]).slice(0, 10);
  const off = discountPct(product);
  const saved = has(product.id);
  const store = product.seller;
  const outOfStock = product.status === 'Out of Stock' || product.stock === 0;
  const sizes = product.sizes || [];

  const details: [string, string | number | null | undefined][] = [
    ['Color', product.color],
    ['Fabric', product.fabricType],
    ['Fit', product.fit],
    ['Pattern', product.pattern],
    ['Occasion', product.occasion],
    ['Gender', product.gender],
    ['Season', product.season],
    ['Material', product.materialComposition],
  ];
  const shownDetails = details.filter(([, v]) => v);

  const mapsHref = store?.latitude && store?.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
    : store?.shopAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.shopAddress)}`
      : null;

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col bg-white relative">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Image gallery */}
        <div className="relative bg-slate-100">
          <TopBar
            onBack={() => navigate('customer_home')}
            floating
            right={
              <>
                <button
                  onClick={() => void shareProduct()}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-700 shadow-sm active:scale-90"
                  aria-label="Share"
                >
                  <Icons.ShareIcon size={17} />
                </button>
                <button
                  onClick={() => toggle(product)}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm active:scale-90"
                  aria-label="Save"
                >
                  <Icons.Favorite size={17} className={saved ? 'text-rose-500' : 'text-slate-700'} fill={saved ? '#f43f5e' : 'none'} />
                </button>
              </>
            }
          />
          <div className="aspect-[3/4] w-full overflow-hidden">
            <motion.img
              key={activeImg}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {off > 0 && (
            <span className="absolute bottom-3 left-4 orange-ribbon text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
              {off}% OFF
            </span>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeImg ? 'w-5 bg-[#0d7d6f]' : 'w-1.5 bg-white/80 border border-slate-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pt-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-14 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                  i === activeImg ? 'border-[#0d7d6f]' : 'border-slate-200'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Core info */}
        <div className="px-5 pt-4">
          {product.brand && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.brand}</span>
          )}
          <span className={`mt-2 inline-flex self-start rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${isDemoCatalog ? 'bg-[#eff8cf] text-[#40520b]' : 'bg-[#e4f7da] text-[#2f7e1a]'}`}>
             {isDemoCatalog ? 'Sample catalog · verify in store' : 'Live store inventory'}
          </span>
          <h1 className="text-xl font-black text-[#1A1A1A] leading-tight mt-0.5">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2">
             <span className="text-2xl font-black text-[#1A1A1A]">{formatPrice(product)}</span>
             {product.mrp && product.mrp > product.price && (
               <span className="text-sm font-bold text-slate-400 line-through">{formatPrice({ price: product.mrp, currency: product.currency })}</span>
             )}
            {off > 0 && <span className="text-xs font-black text-[#16A34A]">{off}% off</span>}
          </div>

          {/* Status + scores */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border ${
                outOfStock ? 'bg-red-50 text-red-600 border-red-100' : 'green-badge border-emerald-200'
              }`}
            >
              {outOfStock ? 'Out of Stock' : 'In Stock'}
            </span>
            {typeof product.premiumScore === 'number' && product.premiumScore > 0 && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider teal-badge">
                Premium {product.premiumScore}/10
              </span>
            )}
            {typeof product.comfortScore === 'number' && product.comfortScore > 0 && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                Comfort {product.comfortScore}/10
              </span>
            )}
          </div>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const disabled = s.stockQuantity <= 0;
                  const active = selectedSize === s.sizeLabel;
                  return (
                    <button
                      key={s.id}
                      disabled={disabled}
                      onClick={() => setSelectedSize(s.sizeLabel)}
                      className={`min-w-[3rem] px-3 h-11 rounded-xl text-xs font-black border-2 transition-all ${
                        disabled
                          ? 'border-slate-100 text-slate-300 line-through'
                          : active
                            ? 'border-[#0d7d6f] bg-teal-50 text-[#0d7d6f]'
                            : 'border-slate-200 text-[#1A1A1A]'
                      }`}
                    >
                      {s.sizeLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-5">
              <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest mb-1.5">Description</p>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* AI premium summary */}
          {product.aiPremiumSummary && (
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icons.AutoAwesome size={14} className="text-[#0d7d6f]" />
                <span className="text-[10px] font-black text-[#0d7d6f] uppercase tracking-widest">Style Notes</span>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{product.aiPremiumSummary}</p>
            </div>
          )}

          {/* Detail grid */}
          {shownDetails.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest mb-2">Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {shownDetails.map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{k}</p>
                    <p className="text-xs font-black text-[#1A1A1A] capitalize line-clamp-1">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store availability card */}
          {store && (
            <div className="mt-6">
              <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest mb-2">Available At</p>
              <button
                onClick={() => navigate('customer_store', { selectedStoreId: store.id })}
                className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0d7d6f] flex items-center justify-center font-black text-lg overflow-hidden shrink-0">
                    {store.logo ? (
                      <img src={store.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (store.shopName || 'S').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-[#1A1A1A] line-clamp-1">{store.shopName || store.name || 'Local Store'}</h3>
                      {store.locationVerified && <Icons.Verified size={13} className="text-[#0d7d6f] shrink-0" />}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 line-clamp-1 flex items-center gap-1">
                      <Icons.LocationOn size={11} className="shrink-0" />
                      {store.shopAddress || [store.city, store.state].filter(Boolean).join(', ') || 'Nearby'}
                    </p>
                  </div>
                  <div className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shrink-0 ${store.isStoreOpen ? 'green-badge' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {store.isStoreOpen ? 'Open' : 'Closed'}
                  </div>
                </div>
              </button>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A1A1A] active:scale-[0.99]"
                  >
                    <Icons.Call size={16} className="text-[#0d7d6f]" /> Call
                  </a>
                )}
                {mapsHref && (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className={`h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A1A1A] active:scale-[0.99] ${!store.phone ? 'col-span-2' : ''}`}
                  >
                    <Icons.Directions size={16} className="text-[#0d7d6f]" /> Directions
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {notice && <div role="status" className="absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#171717] px-4 py-2.5 text-xs font-bold text-white shadow-xl">{notice}</div>}

      {/* Sticky bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => toggle(product)}
          className={`w-14 h-13 rounded-xl border-2 flex items-center justify-center shrink-0 active:scale-95 transition-all ${
            saved ? 'border-rose-200 bg-rose-50' : 'border-slate-200'
          }`}
          style={{ height: '3.25rem' }}
          aria-label="Save"
        >
          <Icons.Favorite size={22} className={saved ? 'text-rose-500' : 'text-slate-500'} fill={saved ? '#f43f5e' : 'none'} />
        </button>
        {mapsHref ? (
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-13 rounded-xl bg-[#0d7d6f] text-white flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest shadow-lg shadow-teal-500/30 active:scale-[0.99]"
            style={{ height: '3.25rem' }}
          >
            <Icons.Directions size={18} /> Visit Store
          </a>
        ) : (
          <button
            onClick={() => store && navigate('customer_store', { selectedStoreId: store.id })}
            disabled={!store}
            className="flex-1 h-13 rounded-xl bg-[#0d7d6f] text-white flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest shadow-lg shadow-teal-500/30 active:scale-[0.99] disabled:opacity-60"
            style={{ height: '3.25rem' }}
          >
            <Icons.Storefront size={18} /> View Store
          </button>
        )}
      </div>
    </div>
  );
}

function TopBar({
  onBack,
  right,
  floating,
}: {
  onBack: () => void;
  right?: React.ReactNode;
  floating?: boolean;
}) {
  return (
    <div className={`${floating ? 'absolute top-0 left-0 right-0 z-20' : 'border-b border-slate-200'} px-4 h-14 flex items-center justify-between`}>
      <button
        onClick={onBack}
        className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 ${floating ? 'bg-white/90 backdrop-blur text-slate-700 shadow-sm' : 'text-[#1A1A1A]'}`}
        aria-label="Back"
      >
        <Icons.ArrowBack size={19} />
      </button>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

function DetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar onBack={onBack} />
      <div className="aspect-[3/4] w-full shimmer-skeleton" />
      <div className="px-5 pt-4 space-y-3">
        <div className="h-4 w-24 rounded shimmer-skeleton" />
        <div className="h-6 w-3/4 rounded shimmer-skeleton" />
        <div className="h-8 w-32 rounded shimmer-skeleton" />
        <div className="h-24 w-full rounded-2xl shimmer-skeleton" />
      </div>
    </div>
  );
}
