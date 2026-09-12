import { supabase } from './supabase';

export type BackupFormat = 'json' | 'csv' | 'sql';
export type BackupTable = 'all' | 'articles' | 'categories' | 'works' | 'partners' | 'web_settings' | 'users';
export type MergeStrategy = 'fill_missing' | 'update_if_newer' | 'append_all' | 'overwrite_all';

export interface DateFilter {
  enabled: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface RestoreTableStats {
  table: string;
  totalInFile: number;
  passedDateFilter: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface SmartRestoreResult {
  success: boolean;
  tableStats: Record<string, RestoreTableStats>;
  totalImported: number;
  totalSkipped: number;
  totalErrors: number;
}

/**
 * Extract date from any record based on common timestamp fields
 */
export function extractItemDate(item: any): Date | null {
  if (!item) return null;
  const dateStr = item.date || item.created_at || item.updated_at || item.published_at || item.timestamp;
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Filter items by date range if enabled
 */
export function filterItemsByDate(items: any[], filter: DateFilter): any[] {
  if (!filter.enabled) return items;
  return items.filter(item => {
    const itemDate = extractItemDate(item);
    if (!itemDate) return true; // If no date found, keep it by default
    
    if (filter.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }
    
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) return false;
    }
    
    return true;
  });
}

export function jsonToCSV(items: any[]): string {
  if (!items || !items.length) return '';
  const headers = Array.from(new Set(items.flatMap(item => Object.keys(item || {}))));

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      const str = JSON.stringify(val);
      return '"' + str.replace(/"/g, '""') + '"';
    }
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const csvRows = [
    headers.join(','),
    ...items.map(row => headers.map(header => formatValue(row[header])).join(','))
  ];

  return csvRows.join('\r\n');
}

export function csvToJSON(csvText: string): any[] {
  const cleanText = csvText.trim();
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(field => field.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
  const results: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: any = {};
    headers.forEach((header, index) => {
      let val: any = row[index] !== undefined ? row[index] : '';
      if (typeof val === 'string' && ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']')))) {
        try {
          val = JSON.parse(val);
        } catch (e) {}
      } else if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      } else if (val === 'null' || val === '') {
        val = val === '' ? null : null;
      }
      obj[header] = val;
    });
    results.push(obj);
  }

  return results;
}

export function jsonToSQL(tableName: string, items: any[]): string {
  if (!items || !items.length) return `-- No data for ${tableName}\n`;
  const headers = Array.from(new Set(items.flatMap(item => Object.keys(item || {}))));
  const columns = headers.join(', ');

  const sqlStatements = items.map(item => {
    const values = headers.map(header => {
      const val = item[header];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number' || typeof val === 'boolean') return val;
      if (typeof val === 'object') {
        return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
      }
      return `'${String(val).replace(/'/g, "''")}'`;
    }).join(', ');

    return `INSERT INTO public.${tableName} (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;`;
  });

  return `-- Backup for table: ${tableName} (${items.length} rows)\n` + sqlStatements.join('\n') + '\n';
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function fetchTableData(table: string): Promise<any[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`Error fetching data from ${table}:`, error);
    throw error;
  }
  return data || [];
}

/**
 * Smart Non-Destructive Restore for a single table with date-awareness
 */
export async function smartRestoreSingleTable(
  tableName: string,
  records: any[],
  strategy: MergeStrategy = 'fill_missing',
  dateFilter: DateFilter = { enabled: false }
): Promise<RestoreTableStats> {
  const stats: RestoreTableStats = {
    table: tableName,
    totalInFile: records.length,
    passedDateFilter: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  const filtered = filterItemsByDate(records, dateFilter);
  stats.passedDateFilter = filtered.length;

  if (filtered.length === 0) {
    return stats;
  }

  // Fetch current database state for comparison
  let existingRecords: any[] = [];
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      stats.errors.push(`Gagal membaca data existing: ${error.message}`);
    } else {
      existingRecords = data || [];
    }
  } catch (err: any) {
    stats.errors.push(`Pengecualian pembacaan existing: ${err.message || String(err)}`);
  }

  // Create mapping by id and secondary unique key (e.g. title, slug, username, path)
  const existingById = new Map<string | number, any>();
  const existingByUniqueKey = new Map<string, any>();

  existingRecords.forEach(rec => {
    if (rec.id !== undefined && rec.id !== null) {
      existingById.set(rec.id, rec);
    }
    // Secondary uniqueness check
    if (tableName === 'articles' && rec.title) {
      existingByUniqueKey.set(String(rec.title).toLowerCase().trim(), rec);
    } else if (tableName === 'categories' && rec.slug) {
      existingByUniqueKey.set(String(rec.slug).toLowerCase().trim(), rec);
    } else if (tableName === 'web_settings' && rec.page_path) {
      existingByUniqueKey.set(String(rec.page_path).toLowerCase().trim(), rec);
    } else if (tableName === 'users' && rec.username) {
      existingByUniqueKey.set(String(rec.username).toLowerCase().trim(), rec);
    }
  });

  const toInsert: any[] = [];
  const toUpdate: any[] = [];

  for (const item of filtered) {
    const itemCopy = { ...item };
    const existing = (itemCopy.id && existingById.get(itemCopy.id)) || 
      (tableName === 'articles' && itemCopy.title && existingByUniqueKey.get(String(itemCopy.title).toLowerCase().trim())) ||
      (tableName === 'categories' && itemCopy.slug && existingByUniqueKey.get(String(itemCopy.slug).toLowerCase().trim())) ||
      (tableName === 'web_settings' && itemCopy.page_path && existingByUniqueKey.get(String(itemCopy.page_path).toLowerCase().trim())) ||
      (tableName === 'users' && itemCopy.username && existingByUniqueKey.get(String(itemCopy.username).toLowerCase().trim()));

    if (!existing) {
      // Record does not exist in DB: Safe to insert
      toInsert.push(itemCopy);
    } else {
      // Record exists in DB
      if (strategy === 'fill_missing') {
        // Concept: Saling melengkapi, do not touch existing data
        stats.skipped++;
      } else if (strategy === 'update_if_newer') {
        // Only update if backup item date is newer than DB item date
        const backupDate = extractItemDate(itemCopy);
        const existingDate = extractItemDate(existing);

        if (backupDate && existingDate && backupDate.getTime() > existingDate.getTime()) {
          toUpdate.push(itemCopy);
        } else {
          stats.skipped++;
        }
      } else if (strategy === 'append_all') {
        // Create duplicate with new ID
        delete itemCopy.id;
        toInsert.push(itemCopy);
      } else if (strategy === 'overwrite_all') {
        toUpdate.push(itemCopy);
      }
    }
  }

  // Execute Inserts
  if (toInsert.length > 0) {
    const CHUNK_SIZE = 50;
    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);
      try {
        const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: 'id', ignoreDuplicates: false });
        if (error) {
          stats.errors.push(`Gagal tambah data batch (${chunk.length} baris): ${error.message}`);
        } else {
          stats.inserted += chunk.length;
        }
      } catch (err: any) {
        stats.errors.push(`Error tambah data: ${err.message || String(err)}`);
      }
    }
  }

  // Execute Updates
  if (toUpdate.length > 0) {
    const CHUNK_SIZE = 50;
    for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
      const chunk = toUpdate.slice(i, i + CHUNK_SIZE);
      try {
        const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: 'id', ignoreDuplicates: false });
        if (error) {
          stats.errors.push(`Gagal perbarui data batch (${chunk.length} baris): ${error.message}`);
        } else {
          stats.updated += chunk.length;
        }
      } catch (err: any) {
        stats.errors.push(`Error perbarui data: ${err.message || String(err)}`);
      }
    }
  }

  return stats;
}

/**
 * Multi-table smart restore runner
 */
export async function smartRestoreDatabase(
  tablesData: Record<string, any[]>,
  selectedTables: string[],
  strategy: MergeStrategy = 'fill_missing',
  dateFilter: DateFilter = { enabled: false }
): Promise<SmartRestoreResult> {
  const result: SmartRestoreResult = {
    success: true,
    tableStats: {},
    totalImported: 0,
    totalSkipped: 0,
    totalErrors: 0
  };

  for (const table of selectedTables) {
    const records = tablesData[table];
    if (records && Array.isArray(records) && records.length > 0) {
      const stats = await smartRestoreSingleTable(table, records, strategy, dateFilter);
      result.tableStats[table] = stats;
      result.totalImported += (stats.inserted + stats.updated);
      result.totalSkipped += stats.skipped;
      result.totalErrors += stats.errors.length;
    }
  }

  if (result.totalImported === 0 && result.totalErrors > 0) {
    result.success = false;
  }

  return result;
}