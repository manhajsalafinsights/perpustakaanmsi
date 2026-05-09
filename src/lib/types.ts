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
  created_at: string;
}

export interface VisitorStats {
  count: number;
}
