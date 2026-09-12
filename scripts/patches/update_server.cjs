const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('import { ALL_PORTALS, detectPortal } from "./src/lib/portals";')) {
  content = content.replace(
    `import dotenv from "dotenv";`,
    `import dotenv from "dotenv";\nimport { ALL_PORTALS, detectPortal, lenteraNetworks } from "./src/lib/portals";`
  );
}

// Update the injectMetaTags function
content = content.replace(
  /const injectMetaTags = async \(reqUrl: string, html: string, host = ''\) => \{([\s\S]*?)let siteName = 'Gnext Indonesia';/g,
  `const injectMetaTags = async (reqUrl: string, html: string, host = '') => {
  let title = '';
  let description = '';
  let image = '';
  let favicon = '';
  const lowerHost = host.toLowerCase();
  const urlPath = reqUrl.split('?')[0].split('#')[0];
  const activePortal = detectPortal(lowerHost, urlPath);

  if (urlPath === '/' || urlPath === '') {
    if (activePortal?.id === 'lumajangtalks') {
      title = 'LUMAJANG TALKS - Portal Berita & Suara Kota Pisang | Gnext Creative Studio';
      description = 'Suara warga, kabar terbaru, dan informasi seputar Lumajang.';
      favicon = '/favicon-lt.svg';
    } else if (activePortal?.id === 'yoikijatim') {
      title = 'YO IKI JATIM - Portal Berita & Informasi Terdepan Jawa Timur | Gnext Creative Studio';
      description = 'Portal berita dan kabar terkini dari seluruh pelosok Jawa Timur.';
      favicon = '/favicon-yj.svg';
    } else if (activePortal?.id === 'gnext') {
      title = 'GNEXT NEWS - Portal Berita Kreatif & Ekonomi Nusantara | Gnext Creative Studio';
      description = 'Kabar industri kreatif, ekonomi, dan berita terkini dari Gnext Indonesia.';
      favicon = '/favicon-news.svg';
    } else if (activePortal?.id.startsWith('lentera')) {
      title = \`\${activePortal.name} - Jaringan Berita Daerah | Gnext Creative Studio\`;
      description = \`Portal berita dan kabar terkini dari \${activePortal.name}.\`;
      favicon = '/favicon-lentera.svg';
    }
  } else if (urlPath.endsWith('/privacy')) {
    if (activePortal) {
      title = \`Kebijakan Privasi - \${activePortal.name}\`;
      description = \`Kebijakan privasi dan perlindungan data pembaca \${activePortal.name}.\`;
      favicon = activePortal.id === 'lumajangtalks' ? '/favicon-lt.svg' : activePortal.id === 'yoikijatim' ? '/favicon-yj.svg' : activePortal.id === 'gnext' ? '/favicon-news.svg' : '/favicon-lentera.svg';
    } else {
      title = 'Kebijakan Privasi - Gnext Creative Studio';
      description = 'Kebijakan privasi dan perlindungan data Gnext Creative Studio.';
    }
  } else if (urlPath.endsWith('/terms')) {
    if (activePortal) {
      title = \`Syarat & Ketentuan & Pedoman Siber - \${activePortal.name}\`;
      description = \`Syarat, ketentuan layanan, dan pedoman pemberitaan media siber \${activePortal.name}.\`;
      favicon = activePortal.id === 'lumajangtalks' ? '/favicon-lt.svg' : activePortal.id === 'yoikijatim' ? '/favicon-yj.svg' : activePortal.id === 'gnext' ? '/favicon-news.svg' : '/favicon-lentera.svg';
    } else {
      title = 'Syarat & Ketentuan - Gnext Creative Studio';
      description = 'Syarat dan ketentuan penggunaan platform Gnext Creative Studio.';
    }
  }

  if (urlPath === '/studio') {
    title = 'Studio Dashboard | Gnext Creative Studio';
    description = 'Manajemen web dan konten Gnext Creative Studio.';
  } else if (!title) {
    const matchNews = urlPath.match(/^\\/(?:news|yoikijatim|lumajangtalks|lentera[a-z0-9-]*)\\/[^\\/]+\\/([^\\/]+)$/);
    let slug = null;
    if (matchNews) {
      slug = matchNews[1];
    } else {
      const matchTwo = urlPath.match(/^\\/[^\\/]+\\/([^\\/]+)$/);
      if (matchTwo && !urlPath.startsWith('/api') && !urlPath.startsWith('/src') && !urlPath.startsWith('/node_modules') && !urlPath.startsWith('/@vite')) {
        slug = matchTwo[1];
      }
    }
    
    if (slug) {
      try {
        const { data: articles } = await supabase.from('articles').select('*').eq('status', 'published');
        if (articles) {
          const found = articles.find((a: any) => slugify(a.title) === slug);
          if (found) {
            const portalSuffix = activePortal ? \` - \${activePortal.name}\` : ' | Gnext Creative Studio';
            title = \`\${found.title}\${portalSuffix}\`; 
            description = found.content ? found.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : '';
            image = found.cover_image || found.image;
            
            if (activePortal?.id === 'lumajangtalks') favicon = '/favicon-lt.svg';
            else if (activePortal?.id === 'yoikijatim') favicon = '/favicon-yj.svg';
            else if (activePortal?.id === 'gnext') favicon = '/favicon-news.svg';
            else if (activePortal?.id.startsWith('lentera')) favicon = '/favicon-lentera.svg';

            if (image && image.startsWith('data:image')) {
              image = \`https://www.gnextindonesia.site/api/article-image/\${slug}\`;
            }
          }
        }
      } catch (e) {}
    }
  }

  if (!title) {
    try {
      const { data: dbSetting } = await supabase.from('web_settings').select('*').eq('path', urlPath).single();
      if (dbSetting) {
        if (dbSetting.title) title = dbSetting.title;
        if (dbSetting.description) description = dbSetting.description;
      }
    } catch (e) {}
  }

  if (!title && !description && !image && !favicon) {
    return html;
  }

  let newHtml = html;
  
  if (title) {
    newHtml = newHtml.replace(/<title>.*?<\\/title>/i, \`<title>\${title}</title>\`);
    newHtml = newHtml.replace(/<meta\\s+property="og:title"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta property="og:title" content="\${title}" />\`);
    newHtml = newHtml.replace(/<meta\\s+name="twitter:title"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta name="twitter:title" content="\${title}" />\`);
  }
  
  if (description) {
    const cleanDesc = description.replace(/"/g, '&quot;');
    newHtml = newHtml.replace(/<meta\\s+name="description"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta name="description" content="\${cleanDesc}" />\`);
    newHtml = newHtml.replace(/<meta\\s+property="og:description"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta property="og:description" content="\${cleanDesc}" />\`);
    newHtml = newHtml.replace(/<meta\\s+name="twitter:description"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta name="twitter:description" content="\${cleanDesc}" />\`);
  }
  
  if (image) {
    const absoluteImageUrl = image.startsWith('http') ? image : \`https://www.gnextindonesia.site\${image.startsWith('/') ? '' : '/'}\${image}\`;
    newHtml = newHtml.replace(/<meta\\s+property="og:image"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta property="og:image" content="\${absoluteImageUrl}" />\`);
    newHtml = newHtml.replace(/<meta\\s+property="og:image:secure_url"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta property="og:image:secure_url" content="\${absoluteImageUrl}" />\`);
    newHtml = newHtml.replace(/<meta\\s+name="twitter:image"\\s+content="[^"]*"\\s*\\/?>/i, \`<meta name="twitter:image" content="\${absoluteImageUrl}" />\`);
  }
  
  if (favicon) {
    newHtml = newHtml.replace(/<link\\s+rel="icon"\\s+type="image\\/svg\\+xml"\\s+href="[^"]*"\\s*\\/?>/i, \`<link rel="icon" type="image/svg+xml" href="\${favicon}" />\`);
    newHtml = newHtml.replace(/<link\\s+rel="icon"\\s+type="image\\/png"\\s+sizes="32x32"\\s+href="[^"]*"\\s*\\/?>/i, '');
    newHtml = newHtml.replace(/<link\\s+rel="shortcut icon"\\s+href="[^"]*"\\s*\\/?>/i, '');
  }
  
  let siteName = 'Gnext Indonesia';`
);

content = content.replace(
  /if \(lowerHost\.startsWith\('lumajangtalks\.'\).*?\s*\} else if \(lowerHost\.startsWith\('yoikijatim\.'\).*?\s*\} else if \(lowerHost\.startsWith\('news\.'\).*?\s*\}/s,
  `if (activePortal) {
    siteName = activePortal.name;
    siteAlternateName = activePortal.id === 'lumajangtalks' ? 'Portal Berita & Suara Kota Pisang Lumajang' : activePortal.id === 'yoikijatim' ? 'Portal Berita & Informasi Terdepan Jawa Timur' : activePortal.id === 'gnext' ? 'Portal Berita Kreatif & Ekonomi Nusantara' : 'Jaringan Berita Daerah Lentera';
    siteUrl = \`https://\${activePortal.id}.gnextindonesia.site\`;
    siteLogo = \`https://www.gnextindonesia.site\${favicon || '/favicon.svg'}\`;
  }`
);

// We need to change the redirect middleware in startServer
content = content.replace(
  `    const isMainDomain = host.includes('gnextindonesia.site') && !host.startsWith('news.') && !host.startsWith('yoikijatim.') && !host.startsWith('lumajangtalks.');
    
    if (isMainDomain) {
      if (url.startsWith('/news')) {
        const newUrl = url.replace(/^\\/news/, '');
        return res.redirect(301, \`https://news.gnextindonesia.site\${newUrl || '/'}\`);
      }
      if (url.startsWith('/yoikijatim')) {
        const newUrl = url.replace(/^\\/yoikijatim/, '');
        return res.redirect(301, \`https://yoikijatim.gnextindonesia.site\${newUrl || '/'}\`);
      }
      if (url.startsWith('/lumajangtalks')) {
        const newUrl = url.replace(/^\\/lumajangtalks/, '');
        return res.redirect(301, \`https://lumajangtalks.gnextindonesia.site\${newUrl || '/'}\`);
      }`,
  `    const activePortal = detectPortal('', url);
    const isMainDomain = host.includes('gnextindonesia.site') && !ALL_PORTALS.some(p => host.startsWith(\`\${p.id}.\`));

    if (isMainDomain && activePortal) {
      const regex = new RegExp(\`^/\\${activePortal.id}\`);
      const newUrl = url.replace(regex, '');
      return res.redirect(301, \`https://\${activePortal.id}.gnextindonesia.site\${newUrl || '/'}\`);`
);

fs.writeFileSync('server.ts', content);
