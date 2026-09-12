const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('URL atau ANON_KEY tidak ditemukan di .env!');
  process.exit(1);
}

const supabase = createClient(url, key);

const backupDir = path.join(__dirname, 'supabase_backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const tables = [
  'articles',
  'users',
  'categories',
  'works',
  'partners',
  'web_settings',
  'gallery_albums',
  'gallery_items',
  'audit_logs'
];

async function dumpTable(tableName) {
  console.log(`[+] Mengunduh tabel '${tableName}'...`);
  try {
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error(`[-] Gagal unduh '${tableName}':`, error.message);
        return { tableName, success: false, error: error.message };
      }

      if (data && data.length > 0) {
        allData = allData.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    const filePath = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`[✓] Berhasil dump '${tableName}': ${allData.length} baris -> ${filePath}`);
    return { tableName, success: true, count: allData.length };
  } catch (err) {
    console.error(`[-] Error eksepsi pada '${tableName}':`, err.message);
    return { tableName, success: false, error: err.message };
  }
}

async function runBackup() {
  console.log('=== MEMULAI BACKUP DATABASE SUPABASE ===');
  console.log(`Target Supabase URL: ${url}`);
  console.log(`Folder Output: ${backupDir}\n`);

  const results = [];
  for (const table of tables) {
    const res = await dumpTable(table);
    results.push(res);
  }

  console.log('\n=== RINGKASAN BACKUP ===');
  console.table(results);
}

runBackup();
