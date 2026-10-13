import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from '../Icons';
import { Navigate } from '../../types';
import { customerApi, Product } from '../../lib/customerApi';
import ProductCard from './ProductCard';
import { isDemoCatalog } from '../../config';

interface Props {
  navigate: Navigate;
  initialCategory?: string;
}

const PAGE_SIZE = 20;
const CATEGORY_FALLBACK = ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Footwear', 'Accessories'];

export default function CustomerSearchScreen({ navigate, initialCategory }: Props) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState(initialCategory || 'All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    customerApi.categories().then((c) => setCategories(c)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setCategory(initialCategory || 'All');
  }, [initialCategory]);

  // Reset + fetch first page whenever filters change.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(1);
    setError('');
    customerApi
      .products({ page: 1, limit: PAGE_SIZE, search: debounced, category, sort, status: inStockOnly ? 'In Stock' : 'All' })
      .then((list) => {
        if (!active) return;
        setProducts(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setHasMore(false);
        setError('The catalog could not be loaded. Check your connection and try again.');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced, category, inStockOnly, sort, retryToken]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const list = await customerApi.products({
        page: next,
        limit: PAGE_SIZE,
        search: debounced,
        category,
        sort,
        status: inStockOnly ? 'In Stock' : 'All',
      });
      setProducts((prev) => [...prev, ...list]);
      setPage(next);
      setHasMore(list.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const chips = useMemo(() => ['All', ...(categories.length ? categories : CATEGORY_FALLBACK)], [categories]);

  return (
    <div className="min-h-full bg-[#f7f7f2] pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e4e3db] bg-[#f7f7f2]/95 px-5 pb-4 pt-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('customer_home')}
            className="p-2 -ml-2 text-[#1A1A1A] active:scale-95"
            aria-label="Back"
          >
            <Icons.ArrowBack size={22} />
          </button>
          <div className="relative flex-1 group">
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search clothes and brands"
              placeholder="Search clothes, brands…"
              className="w-full pl-10 pr-9 py-2.5 bg-slate-100 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 border border-transparent outline-none focus:border-[#0d7d6f] focus:bg-white transition-all"
            />
            <Icons.Search size={18} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-[#0d7d6f]" />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 active:scale-90"
                aria-label="Clear"
              >
                <Icons.Close size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap border transition-colors ${
                category === c ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* In-stock toggle */}
        <div className="flex items-center justify-between pt-3">
          <button
            onClick={() => setInStockOnly((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
              inStockOnly ? 'green-badge border-emerald-200' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center ${inStockOnly ? 'bg-emerald-500' : 'border-2 border-slate-300'}`}>
              {inStockOnly && <Icons.Check size={10} strokeWidth={4} className="text-white" />}
            </span>
            In stock only
          </button>
          {!loading && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {products.length}
              {hasMore ? '+' : ''} items
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-[#deded5] bg-white px-3 py-2 text-[10px] font-black normal-case tracking-normal text-[#171717]">
              <option value="newest">Newest first</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <button type="button" onClick={() => navigate('customer_stores')} className="rounded-full border border-[#deded5] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
            Browse nearby stores
          </button>
        </div>
        <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${isDemoCatalog ? 'bg-[#eff8cf] text-[#40520b]' : 'bg-[#e4f7da] text-[#2f7e1a]'}`}>
          {isDemoCatalog ? 'Curated demo catalog' : 'Live store inventory'}
        </span>
        </div>
      </header>

      {/* Results */}
      <main className="mx-auto max-w-6xl px-5 pt-5 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl shimmer-skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[1.35rem] border border-dashed border-rose-200 bg-white p-10 text-center">
            <Icons.Warning size={40} className="mx-auto mb-3 text-rose-300" />
            <p className="text-sm font-black text-[#171717]">Couldn’t load the edit</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{error}</p>
            <button type="button" onClick={() => setRetryToken((value) => value + 1)} className="mt-5 rounded-full bg-[#171717] px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white">Try again</button>
          </div>
        ) : products.length ? (
          <>
            <motion.div layout className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={(id) => navigate('customer_product', { selectedProductId: id })} />
              ))}
            </motion.div>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-5 w-full h-12 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-[#0d7d6f] flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
              >
                {loadingMore ? <Icons.Loader2 size={16} className="animate-spin" /> : <Icons.Refresh size={16} />}
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Icons.Search size={44} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-black text-[#1A1A1A]">No matches found</p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {debounced ? `Nothing for "${debounced}"` : 'Try a different category or search.'}
            </p>
            {(debounced || category !== 'All' || inStockOnly || sort !== 'newest') && (
              <button
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                  setInStockOnly(false);
                  setSort('newest');
                }}
                className="mt-4 text-xs font-black text-[#0d7d6f] uppercase tracking-widest"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
