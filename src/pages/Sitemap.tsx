import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';

export default function Sitemap() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateSitemap() {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          supabase.from('articles').select('*').eq('status', 'published').order('date', { ascending: false }).limit(1000),
          supabase.from('categories').select('*')
        ]);

        const dbArticles = filterValidArticles(articlesRes.data || []);
        const dbCategories = categoriesRes.data || [];

        const getCategorySlug = (categoryId: string) => {
          const found = dbCategories.find((c: any) => c.id === categoryId);
          if (found) return found.slug || slugify(found.name);
          if (categoryId === 'cat-ekonomi') return 'ekonomi-bisnis';
          if (categoryId === 'cat-kreatif') return 'kreatif-media';
          if (categoryId === 'cat-teknologi') return 'teknologi';
          if (categoryId === 'cat-budaya') return 'gaya-hidup-budaya';
          return 'berita';
        };

        const hostname = window.location.hostname.toLowerCase();
        let domainBase = 'https://news.gnextindonesia.site';
        let filterPortal: string | null = null;

        if (hostname.startsWith('yoikijatim.')) {
          domainBase = 'https://yoikijatim.gnextindonesia.site';
          filterPortal = 'yoikijatim';
        } else if (hostname.startsWith('finance.')) {
          domainBase = 'https://finance.gnextindonesia.site';
          filterPortal = 'finance';
        } else if (hostname.startsWith('lumajangtalks.')) {
          domainBase = 'https://lumajangtalks.gnextindonesia.site';
          filterPortal = 'lumajangtalks';
        } else if (hostname.startsWith('gummah.') || hostname.startsWith('g-ummah.') || hostname.startsWith('ummah.')) {
          domainBase = 'https://g-ummah.gnextindonesia.site';
          filterPortal = 'gummah';
        } else if (hostname.startsWith('lentera')) {
          // Detect which lentera portal
          const sub = hostname.split('.')[0]; // e.g. lenterajakarta, lenterajateng, etc.
          domainBase = `https://${sub}.gnextindonesia.site`;
          filterPortal = sub;
        } else if (hostname.startsWith('news.')) {
          domainBase = 'https://news.gnextindonesia.site';
          filterPortal = 'gnext';
        } else {
          domainBase = 'https://www.gnextindonesia.site';
        }

        const filteredArticles = filterPortal 
          ? dbArticles.filter((a: any) => {
              const p = (a.portal || '').toLowerCase();
              if (filterPortal === 'gnext') {
                return p === 'gnext' || !p;
              }
              return p === filterPortal;
            })
          : dbArticles;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
        xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n`;
        xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

        // Add home page
        xml += `  <url>\n`;
        xml += `    <loc>${domainBase}/</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;

        // Add category pages
        const uniqueCats = Array.from(new Set(filteredArticles.map((a: any) => a.category_id)));
        uniqueCats.forEach((catId: any) => {
          if (!catId) return;
          const catSlug = getCategorySlug(catId);
          xml += `  <url>\n`;
          xml += `    <loc>${domainBase}/${catSlug}</loc>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        });

        // Add articles
        filteredArticles.forEach((art: any) => {
          const catSlug = getCategorySlug(art.category_id);
          const artSlug = art.slug || slugify(art.title);
          const artDate = art.date ? new Date(art.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          xml += `  <url>\n`;
          xml += `    <loc>${domainBase}/${catSlug}/${artSlug}</loc>\n`;
          xml += `    <lastmod>${artDate}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          
          // Google News Extension
          xml += `    <news:news>\n`;
          xml += `      <news:publication>\n`;
          xml += `        <news:name>${art.portal === 'yoikijatim' ? 'Yo Iki Jatim' : art.portal === 'lumajangtalks' ? 'Lumajang Talks' : art.portal === 'gummah' ? 'Gnext Ummah' : art.portal === 'finance' ? 'Gnext Finance' : art.portal?.startsWith('lentera') ? 'Lentera' : 'Gnext News'}</news:name>\n`;
          xml += `        <news:language>id</news:language>\n`;
          xml += `      </news:publication>\n`;
          xml += `      <news:publication_date>${artDate}</news:publication_date>\n`;
          xml += `      <news:title>${art.title?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>\n`;
          xml += `    </news:news>\n`;

          // Google Image Extension if cover_image exists
          if (art.cover_image) {
            xml += `    <image:image>\n`;
            xml += `      <image:loc>${art.cover_image?.replace(/&/g, '&amp;')}</image:loc>\n`;
            if (art.title) {
              xml += `      <image:title>${art.title?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>\n`;
            }
            xml += `    </image:image>\n`;
          }

          xml += `  </url>\n`;
        });

        xml += `</urlset>`;
        setXmlContent(xml);
      } catch (err) {
        console.error('Failed to generate dynamic sitemap:', err);
      } finally {
        setLoading(false);
      }
    }

    generateSitemap();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-neutral-400 font-medium text-sm">Generating Dynamic Sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <pre style={{ 
      whiteSpace: 'pre-wrap', 
      wordBreak: 'break-all', 
      fontFamily: 'monospace', 
      padding: '24px', 
      backgroundColor: '#09090b', 
      color: '#4ade80',
      margin: 0,
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontSize: '13px',
      lineHeight: '1.6'
    }}>
      {xmlContent}
    </pre>
  );
}
