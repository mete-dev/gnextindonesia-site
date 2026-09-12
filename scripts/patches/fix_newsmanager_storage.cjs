const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/NewsManager.tsx', 'utf-8');
code = code.replace(
  "const draft = localStorage.getItem('article_draft');",
  `let draft = null;
    try {
      draft = localStorage.getItem('article_draft');
    } catch (e) {
      console.warn('localStorage not available for drafts');
    }`
);
code = code.replace(
  "localStorage.setItem('article_draft', JSON.stringify(currentArticle));",
  `try { localStorage.setItem('article_draft', JSON.stringify(currentArticle)); } catch (e) {}`
);
fs.writeFileSync('src/pages/studio/NewsManager.tsx', code);
console.log('Fixed localStorage in NewsManager');
