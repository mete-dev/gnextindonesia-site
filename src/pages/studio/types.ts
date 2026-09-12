export type Role = 'Administrator' | 'Manajer Pers' | 'Penulis Pers';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  portal?: string;
  password?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  domisili_negara?: string;
  domisili_provinsi?: string;
  domisili_kota?: string;
  domisili_kecamatan?: string;
  domisili_desa?: string;
  domisili_detail?: string;
  domisili?: string;
  email?: string;
  whatsapp?: string;
  instagram_link?: string;
  instagram_followers?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  parent_name?: string;
  subcategories?: string[];
}

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  categoryId: string;
  category_id?: string;
  authorId: string;
  author_id?: string;
  date: string;
  content: string;
  tags: string[]; // keywords/hashtags
  status: ArticleStatus;
  portal?: string;
  views?: number;
  cover_image?: string;
  image_caption?: string;
  image_credit?: string;
  images?: Array<{ url: string; caption?: string; credit?: string }>;
  news_location?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  sub_category?: string;
  ummah_tier2?: string;
  ummah_tier3?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PageSetting {
  id: string;
  path: string;
  title: string;
  description: string;
  content?: string;
  portal_id?: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  resource: string;
  details: string | null;
  created_at: string;
}

export interface Work {
  id: string;
  instagram_url: string;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}
