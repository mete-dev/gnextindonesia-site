const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:6d7fuF4cSZB8gzhY@db.iqdtrzcdudtakcdddxlr.supabase.co:5432/postgres';

const backupDir = path.join(__dirname, 'supabase_sql_backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function dumpDirectPostgres() {
  console.log('=== KONEKSI DIRECT POSTGRESQL ===');
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('[✓] Terhubung ke PostgreSQL Supabase!');

    // Get all public tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    const tables = res.rows.map(r => r.table_name);
    console.log('[+] Tabel ditemukan:', tables);

    const fullBackup = {};

    for (const table of tables) {
      console.log(`[+] Exporting data dari '${table}'...`);
      const tableData = await client.query(`SELECT * FROM public."${table}";`);
      fullBackup[table] = tableData.rows;
      fs.writeFileSync(path.join(backupDir, `${table}.json`), JSON.stringify(tableData.rows, null, 2));
      console.log(`[✓] '${table}' tersimpan (${tableData.rows.length} baris)`);
    }

    fs.writeFileSync(path.join(backupDir, 'full_backup.json'), JSON.stringify(fullBackup, null, 2));
    console.log('\n[🎉 SUCCESS] Seluruh data berhasil diunduh dan disimpan di folder:', backupDir);

  } catch (err) {
    console.error('[-] Gagal koneksi/export PostgreSQL:', err.message);
  } finally {
    await client.end();
  }
}

dumpDirectPostgres();
