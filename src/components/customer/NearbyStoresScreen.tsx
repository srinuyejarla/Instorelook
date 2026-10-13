import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';
import * as Icons from '../Icons';
import { Navigate } from '../../types';
import { customerApi, Store } from '../../lib/customerApi';
import { isDemoCatalog } from '../../config';

interface Props {
  navigate: Navigate;
}

// Teal pin marker built as an inline SVG divIcon (avoids Leaflet's broken
// default marker-image paths under a bundler).
const storeIcon = L.divIcon({
  className: '',
  html: `<div style="transform:translate(-50%,-100%);filter:drop-shadow(0 3px 4px rgba(0,0,0,.25))">
    <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 25 17 25s17-13 17-25C34 7.6 26.4 0 17 0z" fill="#0d7d6f"/>
      <circle cx="17" cy="17" r="7" fill="#ffffff"/>
    </svg></div>`,
  iconSize: [34, 42],
  iconAnchor: [0, 0],
});

// India is the safe map fallback before the shopper grants location access.
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center[0], center[1], zoom]);
  return null;
}

export default function NearbyStoresScreen({ navigate }: Props) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const loadStores = async (position?: [number, number]) => {
    setLoading(true);
    setError(false);
    try {
      const nextStores = position
        ? await customerApi.nearbyShops(position[0], position[1]).then((nearby) => nearby.length ? nearby : customerApi.shops()).catch(() => customerApi.shops())
        : await customerApi.shops();
      setStores(nextStores);
    } catch {
      setStores([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    loadStores().catch(() => undefined);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!active) return;
          const nextPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPos(nextPosition);
          loadStores(nextPosition).catch(() => undefined);
        },
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
      );
    }
    return () => {
      active = false;
    };
  }, [retryToken]);

  const locate = () => {
    setLocating(true);
    if (!('geolocation' in navigator)) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(nextPosition);
        loadStores(nextPosition).catch(() => undefined);
        setLocating(false);
      },
      () => setLocating(false),
    );
  };

  const mappable = useMemo(
    () => stores.filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number'),
    [stores],
  );

  const center: [number, number] = userPos || DEFAULT_CENTER;
  const zoom = userPos ? 12 : 4;

  return (
    <div className="min-h-full bg-[#f7f7f2] pb-10">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e4e3db] bg-[#f7f7f2]/95 px-5 pb-4 pt-5 backdrop-blur-xl sm:px-8">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.05em] text-[#171717]">{userPos ? 'Stores Near You' : 'Stores Across the US'}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {loading ? 'Finding stores…' : `${stores.length} store${stores.length === 1 ? '' : 's'} listed`}
          </p>
        </div>
        <div className="flex items-center gap-2">
        <span className={`hidden rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] sm:inline-flex ${isDemoCatalog ? 'bg-[#eff8cf] text-[#40520b]' : 'bg-[#e4f7da] text-[#2f7e1a]'}`}>
          {isDemoCatalog ? 'Curated demo catalog' : 'Live store inventory'}
        </span>
        <button
          onClick={locate}
          className="w-10 h-10 rounded-xl bg-teal-50 text-[#0d7d6f] flex items-center justify-center active:scale-95"
          aria-label="Locate me"
        >
          {locating ? <Icons.Loader2 size={18} className="animate-spin" /> : <Icons.MyLocation size={18} />}
        </button>
        </div>
      </header>

      {/* Map */}
      <div className="mx-auto max-w-6xl px-5 pt-4 sm:px-8">
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm h-64 relative bg-slate-100 z-0">
          <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} attributionControl>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Recenter center={center} zoom={zoom} />
            {userPos && (
              <Marker
                position={userPos}
                icon={L.divIcon({
                  className: '',
                  html: `<div style="transform:translate(-50%,-50%)"><div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.25)"></div></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [0, 0],
                })}
              >
                <Popup>You are here</Popup>
              </Marker>
            )}
            {mappable.map((s) => (
              <Marker key={s.id} position={[s.latitude as number, s.longitude as number]} icon={storeIcon}>
                <Popup>
                  <div className="text-center">
                    <p style={{ fontWeight: 800, margin: 0 }}>{s.shopName || 'Store'}</p>
                    {s.shopAddress && <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 6px' }}>{s.shopAddress}</p>}
                    <button
                      onClick={() => navigate('customer_store', { selectedStoreId: s.id })}
                      style={{ background: '#0d7d6f', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 12px', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
                    >
                      View Store
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Store list */}
      <div className="mx-auto max-w-6xl px-5 pt-5 sm:px-8">
        <h2 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider mb-3">All Stores</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl shimmer-skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[1.35rem] border border-dashed border-rose-200 bg-white p-10 text-center">
            <Icons.Warning size={40} className="mx-auto mb-3 text-rose-300" />
            <p className="text-sm font-black text-[#171717]">Couldn’t load stores</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Try again when the catalog service is available.</p>
            <button type="button" onClick={() => { setError(false); setLoading(true); setRetryToken((value) => value + 1); }} className="mt-5 rounded-full bg-[#171717] px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white">Try again</button>
          </div>
        ) : stores.length ? (
          <div className="space-y-3">
            {stores.map((s) => (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('customer_store', { selectedStoreId: s.id })}
                className="w-full text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center gap-3 active:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-teal-50 text-[#0d7d6f] flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
                  {s.logo ? <img src={s.logo} alt="" className="w-full h-full object-cover" /> : (s.shopName || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-[#1A1A1A] line-clamp-1">{s.shopName || s.name || 'Local Store'}</h3>
                    {s.locationVerified && <Icons.Verified size={13} className="text-[#0d7d6f] shrink-0" />}
                  </div>
                  {s.shopCategory && (
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.shopCategory}</span>
                  )}
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                    <Icons.LocationOn size={11} className="shrink-0" />
                    {s.shopAddress || [s.city, s.state].filter(Boolean).join(', ') || 'Location not set'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${s.isStoreOpen ? 'green-badge' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {s.isStoreOpen ? 'Open' : 'Closed'}
                  </span>
                  <Icons.ChevronRight size={18} className="text-slate-300" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Icons.Storefront size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-black text-[#1A1A1A]">No stores listed yet</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Check back soon as local sellers join InStoreLook.</p>
          </div>
        )}
      </div>
    </div>
  );
}
