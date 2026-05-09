export interface Book {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  file_url: string;
  category: string;
  is_paid: boolean;
  views: number;
  purchased: number;
  downloads: number;
  price: number;
  promo_price: number | null;
  promo_text: string;
  comment_count: number | { count: number };
  created_at: string;
}

export interface VisitorStats {
  count: number;
}
