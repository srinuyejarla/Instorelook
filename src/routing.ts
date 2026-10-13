import { AppState, Screen } from './types';

export interface RouteLocation {
  pathname: string;
  search?: string;
  hash?: string;
}

export interface AppRoute {
  screen: Screen;
  params: Partial<AppState>;
}

const EMPTY_ROUTE_PARAMS: Partial<AppState> = {
  selectedProductId: undefined,
  selectedStoreId: undefined,
  searchCategory: undefined,
};

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

function parsePath(pathname: string, rawSearch = ''): AppRoute {
  const path = (pathname || '/').replace(/^\/+|\/+$/g, '');
  const segments = path ? path.split('/').map(decodeSegment) : [];
  const query = new URLSearchParams(rawSearch.replace(/^\?/, ''));
  const params = { ...EMPTY_ROUTE_PARAMS };

  if (!segments.length) return { screen: 'customer_home', params };

  switch (segments[0]) {
    case 'search':
      return {
        screen: 'customer_search',
        params: { ...params, searchCategory: query.get('category')?.trim() || undefined },
      };
    case 'product':
      return segments[1]
        ? { screen: 'customer_product', params: { ...params, selectedProductId: segments[1] } }
        : { screen: 'customer_home', params };
    case 'store':
      return segments[1]
        ? { screen: 'customer_store', params: { ...params, selectedStoreId: segments[1] } }
        : { screen: 'customer_home', params };
    case 'stores':
      return { screen: 'customer_stores', params };
    case 'saved':
      return { screen: 'customer_saved', params };
    case 'brands':
      return { screen: 'role_select', params };
    default:
      // Vercel rewrites unknown SPA paths to the app shell. Do not allow an
      // arbitrary path to create an unhandled React state.
      return { screen: 'customer_home', params };
  }
}

/** Resolve a real clean URL. Legacy #/ URLs are accepted and canonicalized. */
export function parseLocationRoute(location: RouteLocation): AppRoute {
  const hash = location.hash || '';
  if (hash.startsWith('#/')) return parsePath(hash.slice(1), '');
  return parsePath(location.pathname || '/', location.search || '');
}

export function initialBrowserRoute(location: RouteLocation): AppRoute {
  return parseLocationRoute(location);
}

export function parseHashRoute(hash: string): AppRoute {
  if (!hash) return { screen: 'customer_home', params: { ...EMPTY_ROUTE_PARAMS } };
  return parseLocationRoute({ pathname: '/', hash });
}

function encodeSegment(value: string): string {
  return encodeURIComponent(value.trim());
}

/** Build clean, shareable shopper paths. Seller/auth state never enters URLs. */
export function pathForScreen(screen: Screen, params: Partial<AppState> = {}): string | null {
  switch (screen) {
    case 'customer_home':
      return '/';
    case 'customer_search': {
      const category = params.searchCategory?.trim();
      return category ? `/search?category=${encodeSegment(category)}` : '/search';
    }
    case 'customer_product':
      return params.selectedProductId ? `/product/${encodeSegment(params.selectedProductId)}` : null;
    case 'customer_store':
      return params.selectedStoreId ? `/store/${encodeSegment(params.selectedStoreId)}` : null;
    case 'customer_stores':
      return '/stores';
    case 'customer_saved':
      return '/saved';
    case 'role_select':
      return '/brands';
    default:
      return null;
  }
}

// Kept as an alias so existing callers from the earlier hash-routing slice
// continue to compile while the actual URL is now clean path-based routing.
export const hashForScreen = pathForScreen;
