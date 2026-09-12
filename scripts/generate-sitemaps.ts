import fs from 'fs';
import path from 'path';

const SITEMAPS = [
  { host: 'www.gnextindonesia.site', filename: 'sitemap-main.xml' },
  { host: 'news.gnextindonesia.site', filename: 'sitemap-news.xml' },
  { host: 'yoikijatim.gnextindonesia.site', filename: 'sitemap-yoikijatim.xml' },
  { host: 'lumajangtalks.gnextindonesia.site', filename: 'sitemap-lumajangtalks.xml' }
];

async function generateSitemaps() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const site of SITEMAPS) {
    try {
      console.log(`Fetching sitemap for ${site.host}...`);
      const response = await fetch(`http://localhost:3000/sitemap.xml`, {
        headers: {
          'Host': site.host
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const xml = await response.text();
      const filePath = path.join(publicDir, site.filename);
      fs.writeFileSync(filePath, xml);
      console.log(`Saved ${site.filename}`);
    } catch (error) {
      console.error(`Error generating sitemap for ${site.host}:`, error);
    }
  }
  
  // Create a sitemap index file
  const todayStr = new Date().toISOString().split('T')[0];
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.gnextindonesia.site/sitemap-main.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://news.gnextindonesia.site/sitemap-news.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://yoikijatim.gnextindonesia.site/sitemap-yoikijatim.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://lumajangtalks.gnextindonesia.site/sitemap-lumajangtalks.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex);
  console.log('Saved sitemap-index.xml');
  console.log('Sitemap generation completed.');
}

generateSitemaps();
