const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const trackingRoute = `
  // Tracking Pixel Route
  app.get('/api/track.gif', async (req, res) => {
    try {
      const { id } = req.query;
      if (id) {
        // Increment views directly in Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          // First get current views
          const { data } = await supabase.from('articles').select('views').eq('id', id).single();
          const currentViews = data ? (data.views || 0) : 0;
          
          // Update
          await supabase.from('articles').update({ views: currentViews + 1 }).eq('id', id);
        }
      }
    } catch (e) {
      console.error('Tracking error:', e);
    }
    
    // Return a 1x1 transparent GIF
    const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': buf.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    res.end(buf);
  });
`;

if (!code.includes('/api/track.gif')) {
  code = code.replace("if (process.env.NODE_ENV !== \"production\") {", trackingRoute + "\n  if (process.env.NODE_ENV !== \"production\") {");
  fs.writeFileSync('server.ts', code);
  console.log('Tracking route added');
} else {
  console.log('Tracking route already exists');
}
