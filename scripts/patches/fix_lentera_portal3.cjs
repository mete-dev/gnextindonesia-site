const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

content = content.replace(
  `    const link = document.querySelector("link[rel~='icon']");
    if (!link) {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);
    } else {
      (link as HTMLLinkElement).href = faviconUrl;
    }`,
  `    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link') as HTMLLinkElement;
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;`
);

fs.writeFileSync('src/pages/LenteraPortal.tsx', content);
