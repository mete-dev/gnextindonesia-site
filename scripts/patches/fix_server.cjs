const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('lentera')) {
  // Let's replace the host parsing to handle lentera properly
  // For favicon:
  const lenteraFavicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A192F" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="%23D4881A" dominant-baseline="central" text-anchor="middle">L</text></svg>';
  
  content = content.replace(
    /if \(host\.includes\('lumajangtalks'\)\) \{([\s\S]*?)\} else if \(host\.includes\('yoikijatim'\)\) \{([\s\S]*?)\} else if \(host\.includes\('gnext'\) \|\| host\.includes\('news'\)\) \{([\s\S]*?)\}/g,
    `if (host.includes('lumajangtalks')) {
$1
    } else if (host.includes('yoikijatim')) {
$2
    } else if (host.includes('lentera')) {
      favicon = '${lenteraFavicon}';
      siteName = 'Lentera.id';
    } else if (host.includes('gnext') || host.includes('news')) {
$3
    }`
  );

  content = content.replace(
    /if \(url\.startsWith\('\/lumajangtalks'\)\) \{([\s\S]*?)\} else if \(url\.startsWith\('\/yoikijatim'\)\) \{([\s\S]*?)\} else if \(url\.startsWith\('\/news'\)\) \{([\s\S]*?)\}/g,
    `if (url.startsWith('/lumajangtalks')) {
$1
    } else if (url.startsWith('/yoikijatim')) {
$2
    } else if (url.startsWith('/lentera')) {
      favicon = '${lenteraFavicon}';
      siteName = 'Lentera.id';
    } else if (url.startsWith('/news')) {
$3
    }`
  );
  
  fs.writeFileSync('server.ts', content);
}
