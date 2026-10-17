// Customer-facing API client for InStoreLook.
// Wraps the existing /api/customer/* routes and normalises the raw DB rows
// (several columns are stored as JSON strings) into friendly shapes.

export interface Product {
  id: string;
  sellerId?: string | null;
  name: string;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  isLocalBrand?: boolean | null;
  color?: string | null;
  secondaryColor?: string | null;
  pattern?: string | null;
  gender?: string | null;
  occasion?: string | null;
  style?: string | null;
  price: number;
  mrp?: number | null;
  /** The customer experience is India-first and displays prices in INR. */
  currency?: 'USD' | 'INR' | null;
  stock?: number | null;
  status?: 'In Stock' | 'Out of Stock' | null;
  imageUrl?: string | null;
  images?: string[]; // parsed
  description?: string | null;
  fabricType?: string | null;
  materialComposition?: string | null;
  fit?: string | null;
  season?: string | null;
  ageGroup?: string | null;
  sku?: string | null;
  discount?: number | null;
  premiumScore?: number | null;
  comfortScore?: number | null;
  aiPremiumSummary?: string | null;
  badges?: string[]; // parsed
  tags?: string[]; // parsed
  createdAt?: number | null;
  lastUpdatedAt?: string | null;
  liveViewers?: number | null;
}

export interface Store {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  shopName?: string | null;
  shopCategory?: string | null;
  shopAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  postalCode?: string | null;
  logo?: string | null;
  banner?: string | null;
  ownerName?: string | null;
  whatsappNumber?: string | null;
  workingHours?: string | null;
  isStoreOpen?: boolean | null;
  locationVerified?: boolean | null;
  distanceMiles?: number | null;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  source: string;
  directionsUrl: string;
}

export interface ProductSize {
  id: string;
  productId: string;
  sizeLabel: string;
  stockQuantity: number;
}

export interface ProductDetail extends Product {
  seller?: Store | null;
  sizes?: ProductSize[];
}

// A curated set of tasteful fashion imagery used when a product/store has no
// image of its own, so empty or partially-seeded databases still look polished.
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
];

const STORE_FALLBACK =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop';

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic fallback image so a given product always shows the same picture. */
export function fallbackImage(seed: string): string {
  return FALLBACK_IMAGES[hashString(seed) % FALLBACK_IMAGES.length];
}

export function storeBanner(store: Pick<Store, 'id' | 'banner'>): string {
  return store.banner || STORE_FALLBACK;
}

/** Best available image for a product, falling back to tasteful stock imagery. */
export function productImage(p: Product): string {
  return p.imageUrl || p.images?.[0] || fallbackImage(p.id || p.name || 'x');
}

/** Discount percentage derived from mrp vs price (or explicit discount field). */
export function discountPct(p: Product): number {
  if (p.discount && p.discount > 0) return Math.round(p.discount);
  if (p.mrp && p.mrp > p.price) return Math.round(((p.mrp - p.price) / p.mrp) * 100);
  return 0;
}

/**
 * Keep money formatting in one place so the customer experience can render
 * the US catalog cleanly while still displaying legacy local SQLite rows in
 * their original INR currency.
 */
export function formatPrice(product: Pick<Product, 'price' | 'currency'> | number): string {
  const amount = typeof product === 'number' ? product : product.price;
  const currency = 'INR';
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseJsonArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Comma-separated fallback
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return undefined;
}

function normaliseProduct(raw: any): Product {
  const inferredCurrency = 'INR';
  return {
    ...raw,
    currency: inferredCurrency,
    images: parseJsonArray(raw?.images),
    badges: parseJsonArray(raw?.badges),
    tags: parseJsonArray(raw?.tags),
  } as Product;
}

async function getJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`);
  return res.json();
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  storeId?: string;
}

export const customerApi = {
  async products(q: ProductsQuery = {}): Promise<Product[]> {
    const params = new URLSearchParams();
    if (q.page) params.set('page', String(q.page));
    if (q.limit) params.set('limit', String(q.limit));
    if (q.search) params.set('search', q.search);
    if (q.category && q.category !== 'All') params.set('category', q.category);
    if (q.status && q.status !== 'All') params.set('status', q.status);
    if (q.sort) params.set('sort', q.sort);
    if (q.storeId) params.set('storeId', q.storeId);
    const json = await getJson(`/api/customer/products?${params.toString()}`);
    return (json.data || []).map(normaliseProduct);
  },

  async featured(): Promise<Product[]> {
    const json = await getJson('/api/customer/featured-products');
    return (json.data || []).map(normaliseProduct);
  },

  async newArrivals(): Promise<Product[]> {
    const json = await getJson('/api/customer/new-arrivals');
    return (json.data || []).map(normaliseProduct);
  },

  async categories(): Promise<string[]> {
    const json = await getJson('/api/customer/categories');
    return (json.data || []).filter(Boolean);
  },

  async product(id: string): Promise<ProductDetail> {
    const json = await getJson(`/api/customer/products/${id}`);
    const data = json.data || {};
    return { ...normaliseProduct(data), seller: data.seller, sizes: data.sizes } as ProductDetail;
  },

  async shops(): Promise<Store[]> {
    const json = await getJson('/api/customer/shops');
    return (json.data || []) as Store[];
  },

  async nearbyShops(latitude: number, longitude: number, radiusMeters = 25_000): Promise<Store[]> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      radius: String(radiusMeters),
    });
    const json = await getJson(`/api/customer/shops/nearby?${params.toString()}`);
    return (json.data || []) as Store[];
  },

  async nearbyPlaces(latitude: number, longitude: number, radiusMeters = 5_000): Promise<NearbyPlace[]> {
    const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), radius: String(radiusMeters) });
    const json = await getJson(`/api/customer/places/nearby?${params.toString()}`);
    return (json.data || []) as NearbyPlace[];
  },

  async shop(id: string): Promise<{ shop: Store; products: Product[] }> {
    const json = await getJson(`/api/customer/shops/${id}`);
    return { shop: json.shop, products: (json.products || []).map(normaliseProduct) };
  },
};
