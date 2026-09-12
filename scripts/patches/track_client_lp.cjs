const fs = require('fs');
let code = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

const injection = `
  // Lightweight Tracking Pixel for Portal Home
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewedKey = 'viewed_portal_' + activePortal;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        const img = new Image();
        img.src = \`/api/track.gif?portal=\${activePortal}&_t=\${new Date().getTime()}\`;
      }
    }
  }, [activePortal]);
`;

if (!code.includes('/api/track.gif')) {
  const match = code.match(/  return \(/);
  if (match) {
    code = code.replace("  return (", injection + "\n  return (");
    fs.writeFileSync('src/pages/LenteraPortal.tsx', code);
    console.log('Client tracking added to LenteraPortal');
  }
}
