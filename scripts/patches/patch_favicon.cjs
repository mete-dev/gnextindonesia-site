const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    let faviconUrl = '/favicon.svg';
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    if (hostname.startsWith('news.') || pathname.startsWith('/news')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dc2626" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">GN</text></svg>';
    } else if (hostname.startsWith('yoikijatim.') || pathname.startsWith('/yoikijatim')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23ea580c" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">YIK</text></svg>';
    } else if (hostname.startsWith('lumajangtalks.') || pathname.startsWith('/lumajangtalks')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FDE600" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="%23171717" dominant-baseline="central" text-anchor="middle">LT</text></svg>';
    }

    const setFavicon = (url) => {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
      
      // Also update shortcut icon if it exists
      let shortcutLink = document.querySelector("link[rel='shortcut icon']");
      if (shortcutLink) {
        shortcutLink.href = url;
      }
    };
    
    setFavicon(faviconUrl);
  }, [window.location.pathname]);
`;

// Insert the effect after the first useEffect in App.tsx
content = content.replace('}, []);', '}, []);\n' + effectCode);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx with favicon effect');
