export interface BookVolume {
  id: string;
  book_id: string;
  title: string;
  file_url: string;
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
  is_paid: boolean;
  views: number;
  purchased: number;
  downloads: number;
  price: number;
  promo_price: number | null;
  promo_text: string;
  comment_count: number | { count: number };
  created_at: string;
  volumes?: BookVolume[];
}

export interface VisitorStats {
  count: number;
}
