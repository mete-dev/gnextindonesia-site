const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

const effect = `
  useEffect(() => {
    // Dynamically update favicon based on portal
    let faviconUrl = '/favicon.svg'; // default Lentera favicon
    // Alternatively, we can draw the favicon on a canvas based on the name
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background L
      ctx.fillStyle = '#0A192F';
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(24, 8);
      ctx.lineTo(24, 48);
      ctx.quadraticCurveTo(24, 56, 36, 56);
      ctx.lineTo(56, 56);
      ctx.lineTo(56, 64);
      ctx.lineTo(36, 64);
      ctx.quadraticCurveTo(8, 64, 8, 48);
      ctx.fill();
      
      // Draw orange accent
      ctx.fillStyle = '#D4881A';
      ctx.beginPath();
      ctx.moveTo(8, 52);
      ctx.lineTo(24, 64);
      ctx.lineTo(8, 64);
      ctx.fill();
      
      faviconUrl = canvas.toDataURL();
    }

    const link = document.querySelector("link[rel~='icon']");
    if (!link) {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);
    } else {
      link.href = faviconUrl;
    }
  }, [portalId]);
`;

// Insert the effect after the initial variables
if (!content.includes('faviconUrl')) {
  content = content.replace(
    /  const portalId = portal \? portal\.id \: 'lentera';/,
    `  const portalId = portal ? portal.id : 'lentera';\n${effect}`
  );
}

fs.writeFileSync('src/pages/LenteraPortal.tsx', content);
