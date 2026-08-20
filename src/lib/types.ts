export interface BookVolume {
  id: string;
  book_id: string;
  title: string;
  file_url: string;
  page_count?: number;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  file_url: string;
  category: string;
  author: string;
  translator: string;
  is_paid: boolean;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  views: number;
  purchased: number;
  downloads: number;
  donations?: number;
  price: number;
  promo_price: number | null;
  promo_text: string;
  is_featured?: boolean;
  page_count?: number;
  comment_count: number | { count: number };
  created_at: string;
  volumes?: BookVolume[];
}

export interface VisitorStats {
  count: number;
}
