import type { Category } from "./category";
import type { Subcategory } from "./category";

export interface Offer {
  id: number;
  name: string;
  description: string | null;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  category_id: number | null;
  subcategory_id: number | null;
  banner_image: string | null;
  banner_url?: string | null;
  category?: Category | null;
  subcategory?: Subcategory | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedOffers {
  data: Offer[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

/** Body for POST /dashboard/offers. Use FormData when including banner file. */
export interface CreateOfferBody {
  name: string;
  description?: string | null;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  category_id?: number | null;
  subcategory_id?: number | null;
}
