const fs = require('fs');
let code = fs.readFileSync('src/lib/trending.ts', 'utf-8');
code = code.replace(
  "const maxArticleMs = Math.max(\n    ...articles.map((a) => parseArticleDate((a as any).date || (a as any).created_at).getTime()),\n    0\n  );",
  "const maxArticleMs = articles.length > 0 ? articles.reduce((max, a) => Math.max(max, parseArticleDate((a as any).date || (a as any).created_at).getTime()), 0) : 0;"
);
fs.writeFileSync('src/lib/trending.ts', code);
console.log('Fixed Math.max in trending.ts');
