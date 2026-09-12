const fs = require('fs');
let code = fs.readFileSync('src/pages/YoikiJatim.tsx', 'utf-8');

const injection = `
  // Lightweight Tracking Pixel for Portal Home
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewedKey = 'viewed_portal_yoikijatim';
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        const img = new Image();
        img.src = \`/api/track.gif?portal=yoikijatim&_t=\${new Date().getTime()}\`;
      }
    }
  }, []);
`;

if (!code.includes('/api/track.gif')) {
  const match = code.match(/  return \(/);
  if (match) {
    code = code.replace("  return (", injection + "\n  return (");
    fs.writeFileSync('src/pages/YoikiJatim.tsx', code);
    console.log('Client tracking added to YoikiJatim');
  }
}
