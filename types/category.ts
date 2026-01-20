export interface Category {
  id: number;
  category_name: string;
  alias: string;
  serial_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCategories {
  data: Category[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}
