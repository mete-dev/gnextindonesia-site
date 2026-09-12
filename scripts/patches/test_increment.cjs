const replace = `        setArticle(found);
        
        // Track view
        if (typeof window !== 'undefined' && !sessionStorage.getItem('viewed_' + found.id)) {
          sessionStorage.setItem('viewed_' + found.id, 'true');
          const newViews = (found.views || 0) + 1;
          supabase.from('articles').update({ views: newViews }).eq('id', found.id).then();
        }`;
const fs = require('fs');
let code = fs.readFileSync('src/pages/NewsDetail.tsx', 'utf-8');
code = code.replace("        setArticle(found);", replace);
fs.writeFileSync('src/pages/NewsDetail.tsx', code);
