const fs = require('fs');

let code = fs.readFileSync('src/pages/NewsDetail.tsx', 'utf-8');

const injection = `
  // Lightweight Tracking Pixel
  useEffect(() => {
    if (article && typeof window !== 'undefined') {
      const viewedKey = 'viewed_' + article.id;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        
        // Fire and forget pixel
        const img = new Image();
        img.src = \`/api/track.gif?id=\${article.id}&_t=\${new Date().getTime()}\`;
      }
    }
  }, [article]);
`;

if (!code.includes('/api/track.gif')) {
  // Inject just before return (
  code = code.replace("  return (", injection + "\n  return (");
  fs.writeFileSync('src/pages/NewsDetail.tsx', code);
  console.log('Client tracking added');
} else {
  console.log('Client tracking already exists');
}
