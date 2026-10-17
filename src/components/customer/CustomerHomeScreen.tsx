import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from '../Icons';
import { Navigate } from '../../types';
import { customerApi, NearbyPlace, Product, Store } from '../../lib/customerApi';
import ProductCard from './ProductCard';
import { formatLiveTime, useLiveCatalog } from '../../lib/liveCatalog';
import { isDemoCatalog } from '../../config';
import StyleQuote from '../StyleQuote';

interface Props {
  navigate: Navigate;
}

function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#6557f5]">{eyebrow}</p>
        <h2 className="text-3xl font-black tracking-[-0.06em] sm:text-4xl">{title}</h2>
      </div>
      <button onClick={onAction} className="rounded-full border border-[#deded5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition hover:border-[#171717]">{action}</button>
    </div>
  );
}

function ProductRailSkeleton() {
  return (
    <div className="no-scrollbar -mx-1 flex gap-4 overflow-hidden px-1 pb-2">
      {[1, 2, 3, 4].map((item) => <div key={item} className="h-[24rem] w-52 shrink-0 rounded-[1.35rem] shimmer-skeleton sm:w-56" />)}
    </div>
  );
}

function StoreCard({ store, onOpen }: { key?: React.Key; store: Store; onOpen: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onOpen} className="group relative min-h-[15rem] overflow-hidden rounded-[1.4rem] border border-[#deded5] bg-[#171717] text-left text-white shadow-[0_8px_30px_rgba(20,20,20,0.05)]">
      <img src={store.banner || store.logo || ''} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/95 via-[#171717]/35 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] backdrop-blur">{store.isStoreOpen ? 'Open now' : 'Closed'}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-[#d6ff62] group-hover:text-[#171717]"><Icons.ArrowUpRight size={15} /></span>
        </div>
        <div>
          <p className="text-lg font-black tracking-[-0.04em]">{store.shopName || store.name || 'Local store'}</p>
          <p className="mt-1 line-clamp-1 text-[11px] font-medium text-white/65">{store.district || store.city || 'Nearby'} · {store.shopCategory || 'Independent fashion'}</p>
        </div>
      </div>
    </motion.button>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#d7d7ce] bg-white text-center text-slate-400">
      <Icons.ShoppingBag size={28} className="mb-2 opacity-40" />
      <p className="text-xs font-bold">{label}</p>
    </div>
  );
}

function EmptyState({ navigate }: { navigate: Navigate }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-[#d7d7ce] bg-white p-10 text-center">
      <Icons.Explore size={40} className="mx-auto mb-3 text-slate-300" />
      <p className="text-sm font-black">Your next favorite is still around the corner.</p>
      <p className="mt-1 text-xs font-medium text-slate-500">Explore independent stores and find something with a little more personality.</p>
      <button onClick={() => navigate('customer_stores')} className="mt-5 rounded-full bg-[#171717] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white">Explore stores</button>
    </div>
  );
}

const CATEGORY_FALLBACK = ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Footwear', 'Accessories'];

const CATEGORY_META: Record<string, { icon: keyof typeof Icons; tone: string; emoji: string }> = {
  Tops: { icon: 'Shirt', tone: 'bg-[#e7e4ff] text-[#5144c7]', emoji: '✳' },
  Bottoms: { icon: 'Layers', tone: 'bg-[#dff3ed] text-[#137a62]', emoji: '◒' },
  Outerwear: { icon: 'Cloud', tone: 'bg-[#ffe6bd] text-[#a65a00]', emoji: '✦' },
  Dresses: { icon: 'Sparkles', tone: 'bg-[#ffe0ed] text-[#c02a66]', emoji: '♡' },
  Footwear: { icon: 'DirectionsWalk', tone: 'bg-[#e2f0ff] text-[#2c6bb2]', emoji: '⌁' },
  Accessories: { icon: 'ShoppingBag', tone: 'bg-[#f3e8d9] text-[#8a5a2a]', emoji: '●' },
};

const HERO_IMAGE = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88';

const viteEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;
const configuredCatalogMode = viteEnv?.VITE_CATALOG_MODE?.trim().toLowerCase() || undefined;
const showSampleCatalog = configuredCatalogMode ? configuredCatalogMode === 'demo' : isDemoCatalog;

export default function CustomerHomeScreen({ navigate }: Props) {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [arrivals, setArrivals] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>(CATEGORY_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Detecting your location…');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState('');

  const applyCatalog = useCallback((snapshot: { featured: Product[]; arrivals: Product[] }) => {
    setFeatured(snapshot.featured);
    setArrivals(snapshot.arrivals);
    setLoading(false);
  }, []);

  const live = useLiveCatalog({ onUpdate: applyCatalog });

  useEffect(() => {
    if (live.status !== 'syncing') setLoading(false);
  }, [live.status]);

  useEffect(() => {
    let active = true;
    Promise.all([
      customerApi.categories().catch(() => []),
      customerApi.shops().catch(() => []),
    ]).then(([categoryList, shopList]) => {
      if (!active) return;
      if (categoryList.length) setCategories(categoryList);
      setStores(shopList);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setToast('Location is not available in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`,
          );
          const data = await response.json();
          const address = data?.address || {};
          const place = address.city || address.town || address.suburb || address.village || 'Nearby you';
          setLocation(place);
          const places = await customerApi.nearbyPlaces(position.coords.latitude, position.coords.longitude).catch(() => []);
          setNearbyPlaces(places);
        } catch {
          setLocation('Nearby you');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocation('Choose your location');
        setNearbyPlaces([]);
        setToast('Allow location access to see nearby Indian stores.');
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const liveLabel = live.status === 'offline'
    ? 'Inventory unavailable'
    : live.status === 'syncing'
      ? 'Syncing catalog'
      : live.status === 'demo'
        ? 'Curated demo catalog'
        : 'Live store inventory';
  const catalogPill = live.status === 'live' ? 'available now' : 'catalog picks';
  const featuredProducts = featured.slice(0, 6);
  const newArrivals = arrivals.slice(0, 6);
  const trendingStore = stores.find((store) => store.isStoreOpen) || stores[0];

  return (
    <div className="customer-home-surface min-h-full bg-[#f7f7f2] pb-10 text-[#151515]">
      <header className="sticky top-0 z-30 border-b border-[#e9e8e0]/90 bg-[#f7f7f2]/90 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <button onClick={() => navigate('customer_home')} className="group flex items-center gap-2.5 text-left" aria-label="InStoreLook home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#171717] text-[#d6ff62] shadow-[0_8px_20px_rgba(20,20,20,0.15)] transition-transform group-hover:-rotate-6">
              <Icons.Store size={20} strokeWidth={2.5} />
            </span>
            <span className="hidden sm:block">
              <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">the local fashion index</span>
              <span className="block text-lg font-black tracking-[-0.06em]">inStore<span className="text-[#6557f5]">/</span>look</span>
            </span>
          </button>

          {showSampleCatalog && (
            <span role="status" className="sample-catalog-label shrink-0 rounded-full border border-[#c9d98c] bg-[#eff8cf] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#40520b]">
              Sample catalog
            </span>
          )}

          <button onClick={detectLocation} className="ml-auto flex items-center gap-2 rounded-full border border-[#deded5] bg-white/70 px-3 py-2 text-left transition hover:border-[#bdbcb3] active:scale-95">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e4f7da] text-[#2f7e1a]">
              {locating ? <Icons.Loader2 size={13} className="animate-spin" /> : <Icons.LocationOn size={13} />}
            </span>
            <span className="hidden text-[11px] font-black tracking-tight sm:block">Shopping in {location}</span>
            <Icons.ChevronDown size={13} className="text-slate-400" />
          </button>

          <button onClick={() => navigate('role_select')} className="hidden rounded-full border border-[#deded5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition hover:bg-[#171717] hover:text-white sm:block">
            For brands
          </button>
          <button onClick={() => navigate('customer_saved')} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#deded5] bg-white transition hover:border-[#171717] active:scale-95" aria-label="Saved items">
            <Icons.Favorite size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <section className="grid gap-5 pb-8 pt-6 lg:grid-cols-[1.35fr_0.65fr] lg:pt-8">
          <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-[#181818] p-7 text-white shadow-[0_24px_70px_rgba(20,20,20,0.16)] sm:p-10 lg:min-h-[34rem] lg:p-12">
            <img src={HERO_IMAGE} alt="A local fashion edit" className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-screen" />
            <div className="absolute inset-0 bg-[linear-gradient(105deg,#171717_8%,rgba(23,23,23,.78)_42%,rgba(23,23,23,.18)_100%)]" />
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#d6ff62]/30" />
            <div className="absolute -right-6 -top-10 h-36 w-36 rounded-full border border-[#d6ff62]/20" />
            <div className="relative flex h-full max-w-xl flex-col">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#d6ff62]">
                <span className="live-dot" /> Drop 01 · Fall city edit
              </div>
              <StyleQuote className="mt-5 max-w-xs text-sm font-semibold leading-relaxed text-white/75" />
              <h1 className="mt-auto max-w-lg text-[3.1rem] font-black leading-[0.94] tracking-[-0.07em] sm:text-[4.7rem]">
                Your next fit is already in town.
              </h1>
              <p className="mt-5 max-w-sm text-sm font-medium leading-relaxed text-white/70 sm:text-base">
                See what independent stores actually have on the rack — before you cross the city for it.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button onClick={() => navigate('customer_search')} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#d6ff62] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#171717] shadow-[0_10px_30px_rgba(214,255,98,0.18)] transition hover:bg-white active:scale-95">
                  Explore the drop <Icons.ArrowForward size={16} strokeWidth={2.5} />
                </button>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[10px] font-bold text-white/80 backdrop-blur">
                  {featuredProducts.length || 14} {catalogPill}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex-1 rounded-[2rem] border border-[#deded5] bg-[#e7e4ff] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#5144c7]">{live.status === 'live' ? 'Live, not “available soon”' : 'Curated, clearly labeled'}</span>
                <Icons.Sparkles size={19} className="text-[#5144c7]" />
              </div>
              <h2 className="mt-12 max-w-xs text-3xl font-black leading-[0.98] tracking-[-0.06em] text-[#2c2868] sm:text-4xl">Inventory that keeps up with your plans.</h2>
              <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-[#5144c7]/80">Fresh stock checks, low-key local gems, and no more “sorry, we sold that yesterday.”</p>
              <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#5144c7]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80"><Icons.Refresh size={13} className={live.refreshing ? 'animate-spin' : ''} /></span>
                {liveLabel}
              </div>
            </div>
            <button onClick={() => navigate(trendingStore ? 'customer_store' : 'customer_stores', trendingStore ? { selectedStoreId: trendingStore.id } : undefined)} className="group relative min-h-[11rem] overflow-hidden rounded-[2rem] bg-[#171717] p-6 text-left text-white">
              {trendingStore?.banner && <img src={trendingStore.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-r from-[#171717]/95 via-[#171717]/55 to-transparent" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d6ff62]">Store of the moment</span>
                  <Icons.ArrowUpRight size={18} className="text-white/70 transition group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <div>
                  <p className="text-xl font-black tracking-[-0.04em]">{trendingStore?.shopName || 'Independent stores, main character energy.'}</p>
                  <p className="mt-1 text-xs font-medium text-white/60">{trendingStore?.district || 'Your neighborhood'} · {trendingStore?.isStoreOpen ? 'open now' : 'check back soon'}</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-[#deded5] bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${live.status === 'offline' ? 'bg-amber-100 text-amber-700' : 'bg-[#e4f7da] text-[#2f7e1a]'}`}>
              {live.status === 'offline' ? <Icons.Warning size={15} /> : <span className={`live-dot live-dot-dark ${live.status === 'demo' ? 'opacity-50' : ''}`} />}
            </span>
            <div>
              <p className="text-xs font-black">{liveLabel}</p>
              <p className="text-[10px] font-medium text-slate-500">
                {live.status === 'demo'
                  ? `Curated sample data · refreshed ${formatLiveTime(live.lastSyncedAt)}`
                  : live.status === 'offline'
                    ? 'Try again when the catalog service is available'
                    : `Availability refreshed ${formatLiveTime(live.lastSyncedAt)} · auto-updates every 20 seconds`}
              </p>
            </div>
          </div>
          <button onClick={() => void live.refresh()} disabled={live.refreshing} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#deded5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 transition hover:border-[#171717] disabled:opacity-50">
            <Icons.Refresh size={13} className={live.refreshing ? 'animate-spin' : ''} /> Refresh now
          </button>
        </div>

        <section className="mb-10">
          <SectionHeading eyebrow="Set the tone" title="Shop the mood" action="See all" onAction={() => navigate('customer_search')} />
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 pt-1">
            {(categories.length ? categories : CATEGORY_FALLBACK).map((category) => {
              const meta = CATEGORY_META[category] || { icon: 'Sparkles' as keyof typeof Icons, tone: 'bg-slate-100 text-slate-600', emoji: '✦' };
              const CategoryIcon = Icons[meta.icon] as React.ComponentType<{ size?: number; strokeWidth?: number }>;
              return (
                <button key={category} onClick={() => navigate('customer_search', { searchCategory: category })} className="group flex min-w-[7.3rem] flex-col gap-3 rounded-[1.25rem] border border-[#deded5] bg-white p-3 text-left transition hover:-translate-y-1 hover:shadow-lg">
                  <span className={`flex h-14 w-full items-center justify-between rounded-[0.9rem] px-3 ${meta.tone}`}>
                    <CategoryIcon size={24} strokeWidth={1.8} />
                    <span className="text-2xl font-black opacity-60">{meta.emoji}</span>
                  </span>
                  <span className="px-1 text-xs font-black tracking-tight">{category}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeading eyebrow="Moving fast near you" title="Popular right now" action="View all" onAction={() => navigate('customer_search')} />
          {loading ? <ProductRailSkeleton /> : featuredProducts.length ? (
            <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
              {featuredProducts.map((product) => <ProductCard key={product.id} product={product} variant="carousel" onOpen={(id) => navigate('customer_product', { selectedProductId: id })} />)}
            </div>
          ) : <EmptyRow label="Fresh local picks are loading in." />}
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#6557f5]">Just landed</p>
              <h2 className="text-3xl font-black tracking-[-0.06em] sm:text-4xl">Fresh off the rack</h2>
            </div>
            <button onClick={() => navigate('customer_search')} className="hidden rounded-full border border-[#deded5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] sm:block">Browse all</button>
          </div>
          {loading ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-80 rounded-[1.35rem] shimmer-skeleton" />)}</div> : newArrivals.length ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {newArrivals.map((product) => <ProductCard key={product.id} product={product} onOpen={(id) => navigate('customer_product', { selectedProductId: id })} />)}
            </div>
          ) : <EmptyState navigate={navigate} />}
        </section>

         {nearbyPlaces.length > 0 && <section className="mb-10">
           <SectionHeading eyebrow="Live from your location" title="Nearby on the map" action="Open map" onAction={() => navigate('customer_stores')} />
           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
             {nearbyPlaces.slice(0, 6).map((place) => (
               <div key={place.id} className="rounded-[1.25rem] border border-[#deded5] bg-white p-4 shadow-sm">
                 <div className="flex items-start gap-3">
                   <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e4f7da] text-[#2f7e1a]"><Icons.Map size={18} /></span>
                   <div className="min-w-0 flex-1">
                     <h3 className="line-clamp-1 text-sm font-black">{place.name}</h3>
                     <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{place.category} · {(place.distanceMeters / 1000).toFixed(1)} km</p>
                     <p className="mt-2 line-clamp-2 text-[11px] font-medium text-slate-500">{place.address}</p>
                     {place.landmark && <p className="mt-1 text-[10px] font-bold text-slate-500">Near {place.landmark}</p>}
                   </div>
                 </div>
                 <div className="mt-3 flex gap-2">
                   {place.phone && <a href={`tel:${place.phone}`} className="rounded-full border border-[#deded5] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">Call</a>}
                   <a href={place.directionsUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#171717] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white">Directions</a>
                 </div>
               </div>
             ))}
           </div>
           <p className="mt-3 text-[10px] font-medium text-slate-500">Map businesses provide location details. Product availability appears when the shop is also a registered InStoreLook seller.</p>
         </section>}

         {stores.length > 0 && <section className="mb-8">
          <SectionHeading eyebrow="Independent energy" title="Stores worth the detour" action="All stores" onAction={() => navigate('customer_stores')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stores.slice(0, 4).map((store) => <StoreCard key={store.id} store={store} onOpen={() => navigate('customer_store', { selectedStoreId: store.id })} />)}
          </div>
        </section>}
      </main>

      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#171717] px-4 py-3 text-xs font-bold text-white shadow-2xl">{toast}</div>}
    </div>
  );
}
