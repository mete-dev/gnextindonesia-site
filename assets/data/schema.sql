-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrator', 'Manajer Pers', 'Penulis Pers')),
  portal TEXT DEFAULT 'gnext',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  portal TEXT DEFAULT 'gnext',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Web Settings Table
CREATE TABLE IF NOT EXISTS web_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure existing tables have the portal column
ALTER TABLE users ADD COLUMN IF NOT EXISTS portal TEXT DEFAULT 'gnext';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS portal TEXT DEFAULT 'gnext';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS news_location TEXT DEFAULT 'Nasional';

-- Insert Default Data if empty
INSERT INTO users (username, password, name, role, portal) 
SELECT 'admin', 'password', 'Admin Utama', 'Administrator', 'gnext'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, name, role, portal) 
SELECT 'manager', 'password', 'Manajer Konten Gnext', 'Manajer Pers', 'gnext'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager');

INSERT INTO users (username, password, name, role, portal) 
SELECT 'penulis', 'password', 'Penulis Lepas Gnext', 'Penulis Pers', 'gnext'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'penulis');

-- Seed Yoiki Jatim accounts
INSERT INTO users (username, password, name, role, portal) 
SELECT 'manager_yoiki', 'password', 'Manajer Yoiki Jatim', 'Manajer Pers', 'yoikijatim'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager_yoiki');

INSERT INTO users (username, password, name, role, portal) 
SELECT 'penulis_yoiki', 'password', 'Penulis Yoiki Jatim', 'Penulis Pers', 'yoikijatim'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'penulis_yoiki');

-- Seed Lumajang Talks accounts
INSERT INTO users (username, password, name, role, portal) 
SELECT 'manager_lumajang', 'password', 'Manajer Lumajang Talks', 'Manajer Pers', 'lumajangtalks'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager_lumajang');

INSERT INTO users (username, password, name, role, portal) 
SELECT 'penulis_lumajang', 'password', 'Penulis Lumajang Talks', 'Penulis Pers', 'lumajangtalks'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'penulis_lumajang');

INSERT INTO categories (name, slug) 
SELECT 'Teknologi', 'teknologi'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'teknologi');

INSERT INTO categories (name, slug) 
SELECT 'Kreatif', 'kreatif'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'kreatif');

INSERT INTO categories (name, slug) 
SELECT 'Bisnis', 'bisnis'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'bisnis');

INSERT INTO web_settings (path, title, description)
SELECT '/', 'Home | Gnext Creative Studio', 'Ruang tumbuh bagi kreator muda.'
WHERE NOT EXISTS (SELECT 1 FROM web_settings WHERE path = '/');

INSERT INTO web_settings (path, title, description)
SELECT '/about', 'About Us | Gnext', 'Tentang Gnext Indonesia.'
WHERE NOT EXISTS (SELECT 1 FROM web_settings WHERE path = '/about');

INSERT INTO web_settings (path, title, description)
SELECT '/work', 'Our Work | Gnext', 'Layanan dan portofolio kami.'
WHERE NOT EXISTS (SELECT 1 FROM web_settings WHERE path = '/work');

INSERT INTO web_settings (path, title, description)
SELECT '/platform', 'Platform | Gnext', 'Platform digital Gnext.'
WHERE NOT EXISTS (SELECT 1 FROM web_settings WHERE path = '/platform');

-- Seeding Location Categories
INSERT INTO web_settings (path, title, description, content)
SELECT 'yoikijatim-locations', 'Kategori Lokasi Yoiki Jatim', 'Daftar wilayah Jawa Timur', 'Surabaya, Malang, Banyuwangi, Jember, Kediri, Sidoarjo, Gresik, Probolinggo, Pasuruan, Tuban, Madiun, Blitar'
WHERE NOT EXISTS (SELECT 1 FROM web_settings WHERE path = 'yoikijatim-locations');

INSERT INTO web_settings (path, title, description, content)
SELECT 'lumajangtalks-locations', 'Kategori Lokasi Lumajang Talks', 'Daftar wilayah Kabupaten Lumajang', 'Senduro, Pasrujambe, Klakah, Pronojiwo, Yosowilangun, Tempeh, Pasirian, Candipuro, Ranuyoso, Rowokangkung, Kunir, Tekung'
WHERE NOT EXISTS (SELECT 1 FROM web_settings WHERE path = 'lumajangtalks-locations');

-- Works Table (Katalog Karya)
CREATE TABLE IF NOT EXISTS works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Partners Table (Data Partner)
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
