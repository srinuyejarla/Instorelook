import React from 'react';
import * as Icons from '../Icons';
import { Screen, Navigate } from '../../types';
import { useWishlist } from '../../context/WishlistContext';

interface CustomerLayoutProps {
  current: Screen;
  navigate: Navigate;
  children: React.ReactNode;
  themeToggle?: React.ReactNode;
}

const TABS: { id: Screen; label: string; icon: keyof typeof Icons }[] = [
  { id: 'customer_home', label: 'Home', icon: 'Home' },
  { id: 'customer_search', label: 'Search', icon: 'Explore' },
  { id: 'customer_stores', label: 'Stores', icon: 'Map' },
];

export default function CustomerLayout({ current, navigate, children, themeToggle }: CustomerLayoutProps) {
  const { count } = useWishlist();

  // "Saved" is a distinct tab handled separately so we can show the count badge.
  const isSaved = current === 'customer_saved';

  return (
    <div className="customer-layout flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f7f2]">
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

      <nav aria-label="Shopper navigation" className="sticky bottom-0 z-40 shrink-0 border-t border-[#e4e3db] bg-[#f7f7f2]/95 px-3 py-2 backdrop-blur-xl">
        {themeToggle && <div className="mx-auto flex max-w-xl justify-end px-1 pb-2">{themeToggle}</div>}
        <div className="mx-auto flex h-14 max-w-xl items-center justify-around gap-1 rounded-[1.35rem] border border-[#deded5] bg-white px-2 shadow-[0_8px_30px_rgba(20,20,20,0.06)] sm:h-16 sm:max-w-2xl">
          {TABS.map((tab) => {
            const isActive = current === tab.id;
            const IconComp = Icons[tab.icon] as React.ComponentType<any>;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all ${
                  isActive ? 'bg-[#171717] text-[#d6ff62]' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <IconComp size={19} className={isActive ? 'text-[#d6ff62]' : 'text-slate-500'} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => navigate('customer_saved')}
            aria-current={isSaved ? 'page' : undefined}
            className={`relative flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all ${
              isSaved ? 'bg-[#171717] text-[#d6ff62]' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="relative">
              <Icons.Favorite size={19} className={isSaved ? 'text-[#d6ff62]' : 'text-slate-500'} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-[#ff4d8d] px-1 text-[8px] font-black text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Saved</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
