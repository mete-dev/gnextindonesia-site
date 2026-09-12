import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres:6d7fuF4cSZB8gzhY@db.wdaqfxmgonkbstqxhcns.supabase.co:5432/postgres';

const client = new pg.Client({
  connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');
    
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
  } finally {
    await client.end();
  }
}

run();
