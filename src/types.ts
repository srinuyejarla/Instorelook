import { Language } from './i18n';

export type Screen =
  // Shared / entry
  | 'splash'
  | 'onboarding'
  | 'role_select'
  // Seller auth + flow
  | 'login'
  | 'otp'
  | 'location_permission'
  | 'profile_setup'
  | 'welcome'
  | 'seller_home'
  | 'analytics'
  | 'inventory'
  | 'add_product'
  | 'store_profile'
  | 'settings'
  | 'notifications'
  // Customer (shopper) flow
  | 'customer_home'
  | 'customer_search'
  | 'customer_product'
  | 'customer_stores'
  | 'customer_store'
  | 'customer_saved';

export interface AppState {
  screen: Screen;
  language: Language;
  phoneNumber: string;
  /** Product currently being viewed on the customer product-detail screen. */
  selectedProductId?: string;
  /** Store currently being viewed on the customer store screen. */
  selectedStoreId?: string;
  /** Category pre-applied when navigating into the customer search screen. */
  searchCategory?: string;
}

/** Navigation helper passed to customer screens. */
export type Navigate = (screen: Screen, params?: Partial<AppState>) => void;

export type Action =
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_PHONE'; payload: string };
