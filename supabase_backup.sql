-- ===================================================
-- SKEMA DATABASE SUPABASE (Gnext Indonesia & Networks)
-- ===================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrator', 'Manajer Pers', 'Penulis Pers')),
  portal TEXT DEFAULT 'gnext',
  jenis_kelamin TEXT,
  tanggal_lahir DATE,
  domisili_negara TEXT,
  domisili_provinsi TEXT,
  domisili_kota TEXT,
  domisili_kecamatan TEXT,
  domisili_desa TEXT,
  domisili_detail TEXT,
  domisili TEXT,
  email TEXT,
  whatsapp TEXT,
  instagram_link TEXT,
  instagram_followers INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category_id UUID,
  author_id UUID,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  portal TEXT DEFAULT 'gnext',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  views INT DEFAULT 0,
  cover_image TEXT,
  image_caption TEXT,
  image_credit TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  news_location TEXT DEFAULT 'Nasional',
  sub_category TEXT,
  ummah_tier2 TEXT,
  ummah_tier3 TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Lepaskan Foreign Key constraint agar import data tidak gagal jika data pengguna/kategori belum ada
ALTER TABLE IF EXISTS public.articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
ALTER TABLE IF EXISTS public.articles DROP CONSTRAINT IF EXISTS articles_category_id_fkey;

-- 4. Web Settings Table
CREATE TABLE IF NOT EXISTS public.web_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  portal_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Works Table (Katalog Karya)
CREATE TABLE IF NOT EXISTS public.works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Partners Table (Data Partner)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================
-- SEED / INITIAL DATA
-- ===================================================

-- Default Users
INSERT INTO public.users (username, password, name, role, portal) 
SELECT 'admin', 'password', 'Admin Utama', 'Administrator', 'gnext'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin');

INSERT INTO public.users (username, password, name, role, portal) 
SELECT 'manager', 'password', 'Manajer Konten Gnext', 'Manajer Pers', 'gnext'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'manager');

INSERT INTO public.users (username, password, name, role, portal) 
SELECT 'penulis', 'password', 'Penulis Lepas Gnext', 'Penulis Pers', 'gnext'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'penulis');

INSERT INTO public.users (username, password, name, role, portal) 
SELECT 'manager_yoiki', 'password', 'Manajer Yoiki Jatim', 'Manajer Pers', 'yoikijatim'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'manager_yoiki');

INSERT INTO public.users (username, password, name, role, portal) 
SELECT 'penulis_yoiki', 'password', 'Penulis Yoiki Jatim', 'Penulis Pers', 'yoikijatim'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'penulis_yoiki');

INSERT INTO public.users (username, password, name, role, portal) 
SELECT 'manager_lumajang', 'password', 'Manajer Lumajang Talks', 'Manajer Pers', 'lumajangtalks'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'manager_lumajang');

INSERT INTO public.users (username, password, name, role, portal) 
SELECT 'penulis_lumajang', 'password', 'Penulis Lumajang Talks', 'Penulis Pers', 'lumajangtalks'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'penulis_lumajang');

-- Default Categories
INSERT INTO public.categories (name, slug) 
SELECT 'Teknologi', 'teknologi'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'teknologi');

INSERT INTO public.categories (name, slug) 
SELECT 'Kreatif', 'kreatif'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'kreatif');

INSERT INTO public.categories (name, slug) 
SELECT 'Bisnis', 'bisnis'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'bisnis');

-- Default Web Settings
INSERT INTO public.web_settings (path, title, description)
SELECT '/', 'Home | Gnext Creative Studio', 'Ruang tumbuh bagi kreator muda.'
WHERE NOT EXISTS (SELECT 1 FROM public.web_settings WHERE path = '/');

INSERT INTO public.web_settings (path, title, description)
SELECT '/about', 'About Us | Gnext', 'Tentang Gnext Indonesia.'
WHERE NOT EXISTS (SELECT 1 FROM public.web_settings WHERE path = '/about');

INSERT INTO public.web_settings (path, title, description)
SELECT '/work', 'Our Work | Gnext', 'Layanan dan portofolio kami.'
WHERE NOT EXISTS (SELECT 1 FROM public.web_settings WHERE path = '/work');

INSERT INTO public.web_settings (path, title, description)
SELECT '/platform', 'Platform | Gnext', 'Platform digital Gnext.'
WHERE NOT EXISTS (SELECT 1 FROM public.web_settings WHERE path = '/platform');

INSERT INTO public.web_settings (path, title, description, content)
SELECT 'yoikijatim-locations', 'Kategori Lokasi Yoiki Jatim', 'Daftar wilayah Jawa Timur', 'Surabaya, Malang, Banyuwangi, Jember, Kediri, Sidoarjo, Gresik, Probolinggo, Pasuruan, Tuban, Madiun, Blitar'
WHERE NOT EXISTS (SELECT 1 FROM public.web_settings WHERE path = 'yoikijatim-locations');

INSERT INTO public.web_settings (path, title, description, content)
SELECT 'lumajangtalks-locations', 'Kategori Lokasi Lumajang Talks', 'Daftar wilayah Kabupaten Lumajang', 'Senduro, Pasrujambe, Klakah, Pronojiwo, Yosowilangun, Tempeh, Pasirian, Candipuro, Ranuyoso, Rowokangkung, Kunir, Tekung'
WHERE NOT EXISTS (SELECT 1 FROM public.web_settings WHERE path = 'lumajangtalks-locations');
