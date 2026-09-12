const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: arts, error: e1 } = await supabase.from('articles').select('*').limit(1);
  if (!arts || arts.length === 0) { console.log('No articles'); return; }
  const art = arts[0];
  const { data, error } = await supabase.from('articles').update({ views: (art.views || 0) + 1 }).eq('id', art.id).select();
  console.log('Update error:', error);
  console.log('Update result:', data);
}
check();
