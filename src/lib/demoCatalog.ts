/**
 * A small, deterministic catalog for deployments that do not have the local
 * SQLite database available (for example, a Vercel preview). The data is
 * intentionally shaped like the rows returned by the customer API so the
 * existing customer screens can consume it without a second adapter.
 */

export type ProductStatus = 'In Stock' | 'Out of Stock';

export interface DemoProductSize {
  id: string;
  productId: string;
  sizeLabel: string;
  stockQuantity: number;
}

export interface DemoProduct {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  isLocalBrand: boolean;
  color: string;
  secondaryColor?: string;
  pattern: string;
  gender: string;
  occasion: string;
  style: string;
  price: number;
  mrp: number;
  stock: number;
  status: ProductStatus;
  imageUrl: string;
  images: string[];
  description: string;
  fabricType: string;
  materialComposition: string;
  fit: string;
  season: string;
  ageGroup: string;
  sku: string;
  discount: number;
  premiumScore: number;
  comfortScore: number;
  aiPremiumSummary: string;
  badges: string[];
  tags: string[];
  createdAt: number;
  featured?: boolean;
  newArrival?: boolean;
  sizes?: DemoProductSize[];
}

export interface DemoStore {
  id: string;
  name: string;
  phone: string;
  email: string;
  shopName: string;
  shopCategory: string;
  shopAddress: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  logo: string;
  banner: string;
  ownerName: string;
  whatsappNumber: string;
  workingHours: string;
  isStoreOpen: boolean;
  locationVerified: boolean;
}

export interface DemoProductDetail extends DemoProduct {
  seller: DemoStore;
  sizes: DemoProductSize[];
}

export interface ProductQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  status?: string;
}

export interface ProductPage {
  data: DemoProduct[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ShopDetails {
  shop: DemoStore;
  products: DemoProduct[];
}

const DAY = 24 * 60 * 60 * 1000;
const CATALOG_START = Date.UTC(2026, 8, 15);

const image = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const productImages = (primary: string, secondary: string) => [image(primary), image(secondary)];

export const DEMO_STORES: readonly DemoStore[] = [
  {
    id: 'store-stoop-club',
    name: 'The Stoop Club',
    phone: '+1 (347) 555-0148',
    email: 'hello@thestoopclub.co',
    shopName: 'The Stoop Club',
    shopCategory: 'Streetwear & Vintage',
    shopAddress: '184 Bedford Avenue, Brooklyn, NY 11249',
    latitude: 40.7178,
    longitude: -73.9578,
    formattedAddress: '184 Bedford Avenue, Brooklyn, New York 11249',
    city: 'Brooklyn',
    district: 'Williamsburg',
    state: 'New York',
    postalCode: '11249',
    logo: image('photo-1529139574466-a303027c1d8b', 240),
    banner: image('photo-1525507119028-ed4c629a60a3', 1400),
    ownerName: 'Maya Bennett',
    whatsappNumber: '+13475550148',
    workingHours: 'Mon–Sat · 11:00 AM–8:00 PM',
    isStoreOpen: true,
    locationVerified: true,
  },
  {
    id: 'store-common-ground',
    name: 'Common Ground LA',
    phone: '+1 (323) 555-0196',
    email: 'hey@commongroundla.com',
    shopName: 'Common Ground LA',
    shopCategory: 'Contemporary Basics',
    shopAddress: '7420 Melrose Avenue, Los Angeles, CA 90046',
    latitude: 34.0837,
    longitude: -118.3476,
    formattedAddress: '7420 Melrose Avenue, Los Angeles, California 90046',
    city: 'Los Angeles',
    district: 'Melrose',
    state: 'California',
    postalCode: '90046',
    logo: image('photo-1551488831-00ddcb6c6bd3', 240),
    banner: image('photo-1483985988355-763728e1935b', 1400),
    ownerName: 'Jordan Kim',
    whatsappNumber: '+13235550196',
    workingHours: 'Daily · 10:00 AM–7:00 PM',
    isStoreOpen: true,
    locationVerified: true,
  },
  {
    id: 'store-sunday-service',
    name: 'Sunday Service ATX',
    phone: '+1 (512) 555-0122',
    email: 'hi@sundayserviceatx.com',
    shopName: 'Sunday Service ATX',
    shopCategory: 'Western & Reworked',
    shopAddress: '1601 East 6th Street, Austin, TX 78702',
    latitude: 30.2637,
    longitude: -97.7289,
    formattedAddress: '1601 East 6th Street, Austin, Texas 78702',
    city: 'Austin',
    district: 'East Austin',
    state: 'Texas',
    postalCode: '78702',
    logo: image('photo-1490481651871-ab68de25d43d', 240),
    banner: image('photo-1529139574466-a303027c1d8b', 1400),
    ownerName: 'Riley Torres',
    whatsappNumber: '+15125550122',
    workingHours: 'Tue–Sun · 12:00 PM–8:00 PM',
    isStoreOpen: false,
    locationVerified: true,
  },
  {
    id: 'store-rose-gold',
    name: 'Rose Gold Collective',
    phone: '+1 (773) 555-0163',
    email: 'shop@rosegoldcollective.com',
    shopName: 'Rose Gold Collective',
    shopCategory: 'Independent Designers',
    shopAddress: '1834 North Milwaukee Avenue, Chicago, IL 60647',
    latitude: 41.9254,
    longitude: -87.7006,
    formattedAddress: '1834 North Milwaukee Avenue, Chicago, Illinois 60647',
    city: 'Chicago',
    district: 'Wicker Park',
    state: 'Illinois',
    postalCode: '60647',
    logo: image('photo-1558618666-fcd25c85cd64', 240),
    banner: image('photo-1496747611176-843222e1e57c', 1400),
    ownerName: 'Avery Brooks',
    whatsappNumber: '+17735550163',
    workingHours: 'Wed–Sun · 11:00 AM–7:00 PM',
    isStoreOpen: true,
    locationVerified: true,
  },
];

export const DEMO_PRODUCTS: readonly DemoProduct[] = [
  {
    id: 'product-baby-tee-big-energy',
    sellerId: 'store-stoop-club',
    name: 'Baby Tee, Big Energy',
    category: 'Tops',
    subcategory: 'Graphic Tees',
    brand: 'Rivet House',
    isLocalBrand: true,
    color: 'Cherry red',
    secondaryColor: 'Cream',
    pattern: 'Graphic print',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Y2K streetwear',
    price: 42,
    mrp: 58,
    stock: 17,
    status: 'In Stock',
    imageUrl: image('photo-1521572163474-6864f9cf17ab'),
    images: productImages('photo-1521572163474-6864f9cf17ab', 'photo-1503341504253-dff4815485f1'),
    description: 'A slightly cropped cotton tee with a tiny front hit and a hand-drawn back graphic made for sunny sidewalk hangs.',
    fabricType: 'Jersey knit',
    materialComposition: '100% combed cotton',
    fit: 'Relaxed cropped',
    season: 'All season',
    ageGroup: 'Teen & young adult',
    sku: 'RH-BTE-RED-01',
    discount: 28,
    premiumScore: 8.8,
    comfortScore: 9.2,
    aiPremiumSummary: 'The easy hero layer: pair it with big denim, silver jewelry, and your favorite beat-up sneakers.',
    badges: ['Local favorite', 'Bestseller'],
    tags: ['graphic tee', 'cropped', 'y2k', 'streetwear', 'rivet house'],
    createdAt: CATALOG_START + DAY * 8,
    featured: true,
    newArrival: true,
    sizes: [
      { id: 'size-bte-xs', productId: 'product-baby-tee-big-energy', sizeLabel: 'XS', stockQuantity: 3 },
      { id: 'size-bte-s', productId: 'product-baby-tee-big-energy', sizeLabel: 'S', stockQuantity: 6 },
      { id: 'size-bte-m', productId: 'product-baby-tee-big-energy', sizeLabel: 'M', stockQuantity: 5 },
      { id: 'size-bte-l', productId: 'product-baby-tee-big-energy', sizeLabel: 'L', stockQuantity: 3 },
    ],
  },
  {
    id: 'product-wide-leg-carpenter',
    sellerId: 'store-stoop-club',
    name: 'Wide-Leg Carpenter Jean',
    category: 'Bottoms',
    subcategory: 'Denim',
    brand: 'Rivet House',
    isLocalBrand: true,
    color: 'Washed indigo',
    pattern: 'Solid',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Utility denim',
    price: 98,
    mrp: 128,
    stock: 9,
    status: 'In Stock',
    imageUrl: image('photo-1541099649105-f69ad21f3246'),
    images: productImages('photo-1541099649105-f69ad21f3246', 'photo-1542272604-787c3835535d'),
    description: 'Heavyweight denim with a relaxed leg, carpenter loops, and enough room to skate, bike, or just take up the whole booth.',
    fabricType: 'Rigid denim',
    materialComposition: '100% organic cotton',
    fit: 'Wide leg',
    season: 'All season',
    ageGroup: 'Teen & young adult',
    sku: 'RH-WLC-IND-02',
    discount: 23,
    premiumScore: 9.1,
    comfortScore: 8.7,
    aiPremiumSummary: 'A true outfit anchor with a long, clean line. Stack it over chunky shoes for instant downtown energy.',
    badges: ['Local favorite'],
    tags: ['wide leg', 'carpenter', 'denim', 'utility', 'unisex'],
    createdAt: CATALOG_START + DAY * 6,
    featured: true,
    newArrival: true,
    sizes: [
      { id: 'size-wlc-28', productId: 'product-wide-leg-carpenter', sizeLabel: '28', stockQuantity: 1 },
      { id: 'size-wlc-30', productId: 'product-wide-leg-carpenter', sizeLabel: '30', stockQuantity: 3 },
      { id: 'size-wlc-32', productId: 'product-wide-leg-carpenter', sizeLabel: '32', stockQuantity: 3 },
      { id: 'size-wlc-34', productId: 'product-wide-leg-carpenter', sizeLabel: '34', stockQuantity: 2 },
    ],
  },
  {
    id: 'product-cherry-cola-mesh',
    sellerId: 'store-stoop-club',
    name: 'Cherry Cola Mesh Layer',
    category: 'Tops',
    subcategory: 'Layering',
    brand: 'Afterparty Studio',
    isLocalBrand: true,
    color: 'Cherry cola',
    secondaryColor: 'Black',
    pattern: 'Abstract print',
    gender: 'Women',
    occasion: 'Going out',
    style: 'Night-out layering',
    price: 64,
    mrp: 82,
    stock: 4,
    status: 'In Stock',
    imageUrl: image('photo-1551488831-00ddcb6c6bd3'),
    images: productImages('photo-1551488831-00ddcb6c6bd3', 'photo-1566206091558-7f218b696731'),
    description: 'Sheer stretch mesh with a swirled cherry print. Wear it under a tank, over a bralette, or wherever the night goes.',
    fabricType: 'Stretch mesh',
    materialComposition: '92% recycled polyester, 8% elastane',
    fit: 'Second-skin',
    season: 'Fall / winter',
    ageGroup: 'Teen & young adult',
    sku: 'APS-CCM-CHR-03',
    discount: 22,
    premiumScore: 8.4,
    comfortScore: 7.9,
    aiPremiumSummary: 'A low-effort statement piece that gives any basic tank a little main-character plot twist.',
    badges: ['Small-batch'],
    tags: ['mesh', 'layering', 'going out', 'sheer', 'cherry cola'],
    createdAt: CATALOG_START + DAY * 5,
    featured: true,
    newArrival: true,
    sizes: [
      { id: 'size-ccm-xs', productId: 'product-cherry-cola-mesh', sizeLabel: 'XS', stockQuantity: 0 },
      { id: 'size-ccm-s', productId: 'product-cherry-cola-mesh', sizeLabel: 'S', stockQuantity: 1 },
      { id: 'size-ccm-m', productId: 'product-cherry-cola-mesh', sizeLabel: 'M', stockQuantity: 2 },
      { id: 'size-ccm-l', productId: 'product-cherry-cola-mesh', sizeLabel: 'L', stockQuantity: 1 },
    ],
  },
  {
    id: 'product-cloud-wash-hoodie',
    sellerId: 'store-common-ground',
    name: 'Cloud Wash Hoodie',
    category: 'Outerwear',
    subcategory: 'Hoodies',
    brand: 'Common Ground',
    isLocalBrand: true,
    color: 'Cloud blue',
    secondaryColor: 'Oatmeal',
    pattern: 'Color block',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Soft streetwear',
    price: 86,
    mrp: 110,
    stock: 13,
    status: 'In Stock',
    imageUrl: image('photo-1551488831-00ddcb6c6bd3'),
    images: productImages('photo-1551488831-00ddcb6c6bd3', 'photo-1556821840-3a63f95609a7'),
    description: 'Brushed fleece, cloud-soft color blocking, and an oversized hood for the days that start with one coffee and end with three.',
    fabricType: 'Brushed fleece',
    materialComposition: '80% cotton, 20% recycled polyester',
    fit: 'Oversized',
    season: 'Fall / winter',
    ageGroup: 'Teen & young adult',
    sku: 'CG-CWH-BLU-04',
    discount: 22,
    premiumScore: 8.9,
    comfortScore: 9.8,
    aiPremiumSummary: 'The no-brainer layer for campus, airports, and anywhere you need to be cozy without looking checked out.',
    badges: ['Comfort pick', 'Local favorite'],
    tags: ['hoodie', 'fleece', 'oversized', 'color block', 'cozy'],
    createdAt: CATALOG_START + DAY * 4,
    featured: true,
    newArrival: true,
    sizes: [
      { id: 'size-cwh-s', productId: 'product-cloud-wash-hoodie', sizeLabel: 'S', stockQuantity: 2 },
      { id: 'size-cwh-m', productId: 'product-cloud-wash-hoodie', sizeLabel: 'M', stockQuantity: 5 },
      { id: 'size-cwh-l', productId: 'product-cloud-wash-hoodie', sizeLabel: 'L', stockQuantity: 4 },
      { id: 'size-cwh-xl', productId: 'product-cloud-wash-hoodie', sizeLabel: 'XL', stockQuantity: 2 },
    ],
  },
  {
    id: 'product-sunday-ringer',
    sellerId: 'store-sunday-service',
    name: 'Sunday Ringer Tee',
    category: 'Tops',
    subcategory: 'Graphic Tees',
    brand: 'Sunday Service',
    isLocalBrand: true,
    color: 'Vintage cream',
    secondaryColor: 'Cactus green',
    pattern: 'Graphic print',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Retro western',
    price: 48,
    mrp: 62,
    stock: 21,
    status: 'In Stock',
    imageUrl: image('photo-1503342217505-b0a15ec3261c'),
    images: productImages('photo-1503342217505-b0a15ec3261c', 'photo-1521572163474-6864f9cf17ab'),
    description: 'A lived-in ringer tee with a hand-inked desert graphic pulled from a 1970s roadside postcard.',
    fabricType: 'Slub jersey',
    materialComposition: '100% cotton',
    fit: 'Boxy relaxed',
    season: 'Spring / summer',
    ageGroup: 'Teen & young adult',
    sku: 'SSA-SRT-CRM-05',
    discount: 23,
    premiumScore: 8.2,
    comfortScore: 9.1,
    aiPremiumSummary: 'A vintage-feeling layer for cutoffs, cargos, and road trips with no itinerary.',
    badges: ['Local favorite'],
    tags: ['ringer tee', 'western', 'vintage', 'graphic tee', 'austin'],
    createdAt: CATALOG_START + DAY * 2,
    featured: true,
    newArrival: true,
    sizes: [
      { id: 'size-srt-s', productId: 'product-sunday-ringer', sizeLabel: 'S', stockQuantity: 6 },
      { id: 'size-srt-m', productId: 'product-sunday-ringer', sizeLabel: 'M', stockQuantity: 8 },
      { id: 'size-srt-l', productId: 'product-sunday-ringer', sizeLabel: 'L', stockQuantity: 5 },
      { id: 'size-srt-xl', productId: 'product-sunday-ringer', sizeLabel: 'XL', stockQuantity: 2 },
    ],
  },
  {
    id: 'product-bias-cut-slip',
    sellerId: 'store-rose-gold',
    name: 'Bias-Cut Slip Dress',
    category: 'Dresses',
    subcategory: 'Occasion',
    brand: 'Rose Gold Studio',
    isLocalBrand: true,
    color: 'Espresso',
    secondaryColor: 'Rose pink',
    pattern: 'Solid',
    gender: 'Women',
    occasion: 'Going out',
    style: 'Minimal romantic',
    price: 118,
    mrp: 148,
    stock: 7,
    status: 'In Stock',
    imageUrl: image('photo-1496747611176-843222e1e57c'),
    images: productImages('photo-1496747611176-843222e1e57c', 'photo-1515886657613-9f3515b0c78f'),
    description: 'Liquid satin cut on the bias with an adjustable tie back. Feels like a night out, photographs like a memory.',
    fabricType: 'Satin',
    materialComposition: '100% recycled polyester satin',
    fit: 'Bias cut',
    season: 'All season',
    ageGroup: 'Young adult',
    sku: 'RGS-BCD-ESP-06',
    discount: 20,
    premiumScore: 9.3,
    comfortScore: 8.3,
    aiPremiumSummary: 'The dress that does the styling for you. Add a tiny bag and let the silhouette carry the evening.',
    badges: ['Independent designer', 'Limited run'],
    tags: ['slip dress', 'satin', 'date night', 'minimal', 'chicago designer'],
    createdAt: CATALOG_START + DAY * 7,
    featured: true,
    newArrival: true,
    sizes: [
      { id: 'size-bcd-0', productId: 'product-bias-cut-slip', sizeLabel: '0', stockQuantity: 1 },
      { id: 'size-bcd-2', productId: 'product-bias-cut-slip', sizeLabel: '2', stockQuantity: 2 },
      { id: 'size-bcd-4', productId: 'product-bias-cut-slip', sizeLabel: '4', stockQuantity: 2 },
      { id: 'size-bcd-6', productId: 'product-bias-cut-slip', sizeLabel: '6', stockQuantity: 2 },
    ],
  },
  {
    id: 'product-silverline-track-pant',
    sellerId: 'store-common-ground',
    name: 'Silverline Track Pant',
    category: 'Bottoms',
    subcategory: 'Lounge & Track',
    brand: 'Common Ground',
    isLocalBrand: true,
    color: 'Graphite',
    secondaryColor: 'Silver',
    pattern: 'Contrast stripe',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Sporty streetwear',
    price: 74,
    mrp: 92,
    stock: 0,
    status: 'Out of Stock',
    imageUrl: image('photo-1552902865-b72c031ac5ea'),
    images: productImages('photo-1552902865-b72c031ac5ea', 'photo-1515886657613-9f3515b0c78f'),
    description: 'A straight-leg track pant with a clean silver side stripe and a drawcord waist that actually stays put.',
    fabricType: 'Ponte knit',
    materialComposition: '68% viscose, 27% nylon, 5% elastane',
    fit: 'Straight leg',
    season: 'All season',
    ageGroup: 'Teen & young adult',
    sku: 'CG-STP-GRA-07',
    discount: 20,
    premiumScore: 8.5,
    comfortScore: 9.4,
    aiPremiumSummary: 'The polished sweatpant alternative: pair with a baby tee and a structured jacket for an easy contrast.',
    badges: ['Sold out soon'],
    tags: ['track pants', 'sporty', 'graphite', 'silver stripe', 'lounge'],
    createdAt: CATALOG_START + DAY * 1,
    featured: true,
    newArrival: true,
    sizes: [
      { id: 'size-stp-s', productId: 'product-silverline-track-pant', sizeLabel: 'S', stockQuantity: 0 },
      { id: 'size-stp-m', productId: 'product-silverline-track-pant', sizeLabel: 'M', stockQuantity: 0 },
      { id: 'size-stp-l', productId: 'product-silverline-track-pant', sizeLabel: 'L', stockQuantity: 0 },
    ],
  },
  {
    id: 'product-motel-keychain-bag',
    sellerId: 'store-sunday-service',
    name: 'Motel Keychain Bag',
    category: 'Accessories',
    subcategory: 'Crossbody Bags',
    brand: 'Sunday Service',
    isLocalBrand: true,
    color: 'Tobacco brown',
    secondaryColor: 'Butter yellow',
    pattern: 'Color block',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Playful western',
    price: 68,
    mrp: 84,
    stock: 8,
    status: 'In Stock',
    imageUrl: image('photo-1553062407-98eeb64c6a62'),
    images: productImages('photo-1553062407-98eeb64c6a62', 'photo-1584917865442-de89df76afd3'),
    description: 'A compact crossbody with a contrast strap, motel-tag zipper pull, and enough room for phone, gloss, and tiny treasures.',
    fabricType: 'Vegan leather',
    materialComposition: 'Recycled polyurethane exterior, cotton lining',
    fit: 'Compact crossbody',
    season: 'All season',
    ageGroup: 'Teen & young adult',
    sku: 'SSA-MKB-BRN-08',
    discount: 19,
    premiumScore: 8.6,
    comfortScore: 8.8,
    aiPremiumSummary: 'A tiny pop of color that makes a neutral outfit feel intentional in under five seconds.',
    badges: ['Small-batch', 'Giftable'],
    tags: ['crossbody', 'bag', 'motel', 'western', 'vegan leather'],
    createdAt: CATALOG_START - DAY * 2,
    featured: false,
    newArrival: false,
  },
  {
    id: 'product-westside-suede-clog',
    sellerId: 'store-sunday-service',
    name: 'Westside Suede Clog',
    category: 'Footwear',
    subcategory: 'Clogs',
    brand: 'Desert Radio',
    isLocalBrand: true,
    color: 'Desert tan',
    secondaryColor: 'Cobalt blue',
    pattern: 'Solid',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Elevated western',
    price: 110,
    mrp: 138,
    stock: 12,
    status: 'In Stock',
    imageUrl: image('photo-1542291026-7eec264c27ff'),
    images: productImages('photo-1542291026-7eec264c27ff', 'photo-1543163521-1bf539c55dd2'),
    description: 'Suede slip-ons with a sculpted wood-look sole and a cobalt heel tab for the walkable statement.',
    fabricType: 'Suede',
    materialComposition: 'Leather upper, rubber sole',
    fit: 'True to size',
    season: 'Spring / summer',
    ageGroup: 'Young adult',
    sku: 'DR-WSG-TAN-09',
    discount: 20,
    premiumScore: 9,
    comfortScore: 8.6,
    aiPremiumSummary: 'The shortcut to looking styled: wear with baggy denim, socks, and a little confidence.',
    badges: ['Local favorite'],
    tags: ['clogs', 'suede', 'shoes', 'western', 'walkable'],
    createdAt: CATALOG_START - DAY * 4,
    featured: true,
    newArrival: false,
    sizes: [
      { id: 'size-wsg-7', productId: 'product-westside-suede-clog', sizeLabel: '7', stockQuantity: 2 },
      { id: 'size-wsg-8', productId: 'product-westside-suede-clog', sizeLabel: '8', stockQuantity: 4 },
      { id: 'size-wsg-9', productId: 'product-westside-suede-clog', sizeLabel: '9', stockQuantity: 3 },
      { id: 'size-wsg-10', productId: 'product-westside-suede-clog', sizeLabel: '10', stockQuantity: 3 },
    ],
  },
  {
    id: 'product-after-hours-bomber',
    sellerId: 'store-rose-gold',
    name: 'After Hours Bomber',
    category: 'Outerwear',
    subcategory: 'Jackets',
    brand: 'Rose Gold Studio',
    isLocalBrand: true,
    color: 'Ink black',
    secondaryColor: 'Electric blue',
    pattern: 'Color block',
    gender: 'Unisex',
    occasion: 'Going out',
    style: 'Club minimalism',
    price: 146,
    mrp: 184,
    stock: 5,
    status: 'In Stock',
    imageUrl: image('photo-1544022613-e87ca75a784a'),
    images: productImages('photo-1544022613-e87ca75a784a', 'photo-1551028719-00167b16eac5'),
    description: 'A compact satin bomber with a bright inner lining, dropped shoulders, and the perfect amount of late-night sheen.',
    fabricType: 'Satin twill',
    materialComposition: '100% recycled polyester',
    fit: 'Relaxed',
    season: 'Fall / winter',
    ageGroup: 'Young adult',
    sku: 'RGS-AHB-BLK-10',
    discount: 21,
    premiumScore: 9.4,
    comfortScore: 8.5,
    aiPremiumSummary: 'A sleek topper for turning a basic look into an actual look. The blue flash makes it yours.',
    badges: ['Independent designer', 'Limited run'],
    tags: ['bomber', 'jacket', 'satin', 'night out', 'unisex'],
    createdAt: CATALOG_START - DAY * 5,
    featured: true,
    newArrival: false,
    sizes: [
      { id: 'size-ahb-xs', productId: 'product-after-hours-bomber', sizeLabel: 'XS', stockQuantity: 1 },
      { id: 'size-ahb-s', productId: 'product-after-hours-bomber', sizeLabel: 'S', stockQuantity: 1 },
      { id: 'size-ahb-m', productId: 'product-after-hours-bomber', sizeLabel: 'M', stockQuantity: 2 },
      { id: 'size-ahb-l', productId: 'product-after-hours-bomber', sizeLabel: 'L', stockQuantity: 1 },
    ],
  },
  {
    id: 'product-rally-mini-skirt',
    sellerId: 'store-common-ground',
    name: 'Rally Mini Skirt',
    category: 'Bottoms',
    subcategory: 'Skirts',
    brand: 'Common Ground',
    isLocalBrand: true,
    color: 'Butter yellow',
    secondaryColor: 'Navy',
    pattern: 'Pinstripe',
    gender: 'Women',
    occasion: 'Everyday',
    style: 'Sporty preppy',
    price: 58,
    mrp: 74,
    stock: 11,
    status: 'In Stock',
    imageUrl: image('photo-1583496661160-fb5886a13d27'),
    images: productImages('photo-1583496661160-fb5886a13d27', 'photo-1594633312681-425c7b97ccd1'),
    description: 'A pleated mini with a subtle pinstripe and built-in shorts for sprinting to your next plan.',
    fabricType: 'Stretch twill',
    materialComposition: '64% polyester, 32% rayon, 4% elastane',
    fit: 'High rise mini',
    season: 'Spring / summer',
    ageGroup: 'Teen & young adult',
    sku: 'CG-RMS-YEL-11',
    discount: 22,
    premiumScore: 8.7,
    comfortScore: 8.9,
    aiPremiumSummary: 'Pleats keep the silhouette playful while the built-in short keeps the day moving.',
    badges: ['Local favorite'],
    tags: ['mini skirt', 'pleated', 'preppy', 'sporty', 'butter yellow'],
    createdAt: CATALOG_START - DAY * 8,
    featured: false,
    newArrival: false,
    sizes: [
      { id: 'size-rms-0', productId: 'product-rally-mini-skirt', sizeLabel: '0', stockQuantity: 2 },
      { id: 'size-rms-2', productId: 'product-rally-mini-skirt', sizeLabel: '2', stockQuantity: 3 },
      { id: 'size-rms-4', productId: 'product-rally-mini-skirt', sizeLabel: '4', stockQuantity: 4 },
      { id: 'size-rms-6', productId: 'product-rally-mini-skirt', sizeLabel: '6', stockQuantity: 2 },
    ],
  },
  {
    id: 'product-lemon-drop-knit',
    sellerId: 'store-rose-gold',
    name: 'Lemon Drop Knit',
    category: 'Tops',
    subcategory: 'Knitwear',
    brand: 'Northside Soft Goods',
    isLocalBrand: true,
    color: 'Lemon yellow',
    secondaryColor: 'Cloud white',
    pattern: 'Open knit',
    gender: 'Women',
    occasion: 'Everyday',
    style: 'Soft statement',
    price: 72,
    mrp: 96,
    stock: 6,
    status: 'In Stock',
    imageUrl: image('photo-1506629905607-d9cf6c15d5d6'),
    images: productImages('photo-1506629905607-d9cf6c15d5d6', 'photo-1539109136881-3be0616acf4b'),
    description: 'A breezy open-knit polo in a sunny lemon shade, designed for layering over everything from tanks to swimwear.',
    fabricType: 'Open knit',
    materialComposition: '55% cotton, 45% acrylic',
    fit: 'Relaxed cropped',
    season: 'Spring / summer',
    ageGroup: 'Teen & young adult',
    sku: 'NSG-LDK-YEL-12',
    discount: 25,
    premiumScore: 8.8,
    comfortScore: 9,
    aiPremiumSummary: 'A little color therapy in sweater form. Let it be the only loud thing in the outfit.',
    badges: ['Independent designer'],
    tags: ['knit', 'polo', 'yellow', 'layering', 'chicago'],
    createdAt: CATALOG_START - DAY * 10,
    featured: false,
    newArrival: false,
    sizes: [
      { id: 'size-ldk-xs', productId: 'product-lemon-drop-knit', sizeLabel: 'XS', stockQuantity: 1 },
      { id: 'size-ldk-s', productId: 'product-lemon-drop-knit', sizeLabel: 'S', stockQuantity: 2 },
      { id: 'size-ldk-m', productId: 'product-lemon-drop-knit', sizeLabel: 'M', stockQuantity: 2 },
      { id: 'size-ldk-l', productId: 'product-lemon-drop-knit', sizeLabel: 'L', stockQuantity: 1 },
    ],
  },
  {
    id: 'product-big-city-trucker',
    sellerId: 'store-stoop-club',
    name: 'Big City Trucker',
    category: 'Accessories',
    subcategory: 'Hats',
    brand: 'Rivet House',
    isLocalBrand: true,
    color: 'Washed black',
    secondaryColor: 'Safety orange',
    pattern: 'Embroidered logo',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Downtown classic',
    price: 34,
    mrp: 44,
    stock: 25,
    status: 'In Stock',
    imageUrl: image('photo-1521369909029-2afed882baee'),
    images: productImages('photo-1521369909029-2afed882baee', 'photo-1514327605112-b887c0e61c0a'),
    description: 'A broken-in trucker cap with a tiny city map embroidered at the front and a bright underbrim for flash-photo moments.',
    fabricType: 'Cotton twill',
    materialComposition: '100% cotton front, recycled mesh back',
    fit: 'Adjustable',
    season: 'All season',
    ageGroup: 'Teen & young adult',
    sku: 'RH-BCT-BLK-13',
    discount: 23,
    premiumScore: 8,
    comfortScore: 9,
    aiPremiumSummary: 'The finishing touch for bad-hair days, good playlists, and every outfit that needs a little attitude.',
    badges: ['Local favorite', 'Giftable'],
    tags: ['trucker hat', 'cap', 'streetwear', 'embroidered', 'brooklyn'],
    createdAt: CATALOG_START - DAY * 12,
    featured: false,
    newArrival: false,
  },
  {
    id: 'product-canvas-court-sneaker',
    sellerId: 'store-common-ground',
    name: 'Canvas Court Sneaker',
    category: 'Footwear',
    subcategory: 'Sneakers',
    brand: 'Common Ground',
    isLocalBrand: true,
    color: 'Ecru',
    secondaryColor: 'Cobalt blue',
    pattern: 'Color block',
    gender: 'Unisex',
    occasion: 'Everyday',
    style: 'Clean retro',
    price: 78,
    mrp: 98,
    stock: 14,
    status: 'In Stock',
    imageUrl: image('photo-1525966222134-fcfa99b8ae77'),
    images: productImages('photo-1525966222134-fcfa99b8ae77', 'photo-1549298916-b41d501d3772'),
    description: 'A low-profile canvas sneaker with a cobalt heel tab and a cushioned footbed for all-day city miles.',
    fabricType: 'Canvas',
    materialComposition: 'Organic cotton canvas, recycled rubber sole',
    fit: 'True to size',
    season: 'All season',
    ageGroup: 'Teen & young adult',
    sku: 'CG-CCS-ECR-14',
    discount: 20,
    premiumScore: 8.9,
    comfortScore: 9.3,
    aiPremiumSummary: 'A crisp base for wide denim, sporty skirts, and basically everything else in your closet.',
    badges: ['Comfort pick', 'Local favorite'],
    tags: ['sneakers', 'canvas', 'retro', 'everyday', 'cobalt'],
    createdAt: CATALOG_START - DAY * 14,
    featured: true,
    newArrival: false,
    sizes: [
      { id: 'size-ccs-7', productId: 'product-canvas-court-sneaker', sizeLabel: '7', stockQuantity: 3 },
      { id: 'size-ccs-8', productId: 'product-canvas-court-sneaker', sizeLabel: '8', stockQuantity: 4 },
      { id: 'size-ccs-9', productId: 'product-canvas-court-sneaker', sizeLabel: '9', stockQuantity: 4 },
      { id: 'size-ccs-10', productId: 'product-canvas-court-sneaker', sizeLabel: '10', stockQuantity: 3 },
    ],
  },
];

type NumericValue = number | string | undefined;

function positiveInteger(value: NumericValue, fallback: number, max = Number.MAX_SAFE_INTEGER): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function normalise(value: string | undefined | null): string {
  return (value || '').trim().toLocaleLowerCase('en-US');
}

function isAll(value: string | undefined | null): boolean {
  const normalised = normalise(value);
  return !normalised || normalised === 'all';
}

function cloneProduct(product: DemoProduct): DemoProduct {
  return {
    ...product,
    images: [...product.images],
    badges: [...product.badges],
    tags: [...product.tags],
    sizes: product.sizes?.map((size) => ({ ...size })),
  };
}

function cloneStore(store: DemoStore): DemoStore {
  return { ...store };
}

/** Filter products without mutating the catalog. Search covers shopper-facing discovery fields. */
export function filterProducts(
  products: readonly DemoProduct[] = DEMO_PRODUCTS,
  query: Pick<ProductQuery, 'search' | 'category' | 'status'> = {},
): DemoProduct[] {
  const search = normalise(query.search);
  const category = normalise(query.category);
  const status = normalise(query.status);

  return products
    .filter((product) => {
      if (category && category !== 'all' && normalise(product.category) !== category) return false;
      if (status && status !== 'all' && normalise(product.status) !== status) return false;
      if (!search) return true;

      const haystack = [
        product.name,
        product.brand,
        product.category,
        product.subcategory,
        product.color,
        product.style,
        product.description,
        ...product.tags,
      ]
        .join(' ')
        .toLocaleLowerCase('en-US');

      return haystack.includes(search);
    })
    .map(cloneProduct);
}

/** Paginate a product list with safe defaults and a bounded page size. */
export function paginateProducts(
  products: readonly DemoProduct[],
  page: NumericValue = 1,
  limit: NumericValue = 20,
): ProductPage {
  const safePage = positiveInteger(page, 1);
  const safeLimit = positiveInteger(limit, 20, 100);
  const start = (safePage - 1) * safeLimit;

  return {
    data: products.slice(start, start + safeLimit).map(cloneProduct),
    page: safePage,
    limit: safeLimit,
    total: products.length,
    totalPages: products.length ? Math.ceil(products.length / safeLimit) : 0,
  };
}

/** Filter and paginate the demo catalog in the same shape as the customer API. */
export function listProducts(query: ProductQuery = {}): ProductPage {
  return paginateProducts(filterProducts(DEMO_PRODUCTS, query), query.page, query.limit);
}

export function getFeaturedProducts(limit: NumericValue = 10): DemoProduct[] {
  const safeLimit = positiveInteger(limit, 10, 100);
  return DEMO_PRODUCTS
    .filter((product) => product.featured)
    .sort((a, b) => b.premiumScore - a.premiumScore || b.stock - a.stock)
    .slice(0, safeLimit)
    .map(cloneProduct);
}

export function getNewArrivals(limit: NumericValue = 15): DemoProduct[] {
  const safeLimit = positiveInteger(limit, 15, 100);
  return [...DEMO_PRODUCTS]
    .filter((product) => product.newArrival)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, safeLimit)
    .map(cloneProduct);
}

export function getCategories(): string[] {
  return Array.from(new Set(DEMO_PRODUCTS.map((product) => product.category)));
}

export function getProduct(id: string): DemoProductDetail | undefined {
  const product = DEMO_PRODUCTS.find((candidate) => candidate.id === id);
  if (!product) return undefined;

  const seller = DEMO_STORES.find((store) => store.id === product.sellerId);
  if (!seller) return undefined;

  const clonedProduct = cloneProduct(product);
  return {
    ...clonedProduct,
    seller: cloneStore(seller),
    sizes: clonedProduct.sizes?.map((size) => ({ ...size })) || [],
  };
}

export function getShops(): DemoStore[] {
  return DEMO_STORES.map(cloneStore);
}

export function getShop(id: string): ShopDetails | undefined {
  const shop = DEMO_STORES.find((store) => store.id === id);
  if (!shop) return undefined;

  return {
    shop: cloneStore(shop),
    products: DEMO_PRODUCTS
      .filter((product) => product.sellerId === id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(cloneProduct),
  };
}

export const getShopDetails = getShop;
