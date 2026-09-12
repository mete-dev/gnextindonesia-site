/**
 * GNEXT Supabase Safe Database Wrapper
 * Menyediakan pengaman tingkat lanjut untuk operasi basis data Supabase
 * menggunakan ES6 Proxy guna menangani timeout, ketidakcocokan skema, 
 * dan pengecualian jaringan secara anggun tanpa crash.
 */

export function makeSafeSupabaseClient(client: any) {
  if (!client) return client;

  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      if (prop === 'from') {
        return (tableName: string) => {
          try {
            const originalQuery = target.from(tableName);
            return wrapQueryWithSafeHandler(originalQuery, tableName);
          } catch (err) {
            console.error(`Gagal menginisialisasi query builder untuk tabel '${tableName}':`, err);
            return wrapQueryWithSafeHandler(
              // Dummy thenable fallback
              Promise.resolve({ data: null, error: err }),
              tableName
            );
          }
        };
      }
      
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  };

  return new Proxy(client, handler);
}

function wrapQueryWithSafeHandler(query: any, tableName: string): any {
  const queryHandler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      // Cegah crash jika query kosong atau rusak
      if (!target) return undefined;

      // Intersepsi metode await / then (saat query dieksekusi)
      if (prop === 'then') {
        return async (onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) => {
          try {
            // Menambahkan batas waktu operasi basis data maksimal 60 detik (menghindari timeout akibat cold-start Supabase)
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Batas waktu terlampaui: Operasi basis data pada tabel '${tableName}' memakan waktu lebih dari 60 detik.`)), 60000)
            );

            // Menjalankan kueri dan batas waktu secara bersamaan
            const result: any = await Promise.race([
              Promise.resolve(target),
              timeoutPromise
            ]);
            
            // Periksa apakah Supabase mengembalikan pesan galat
            if (result && result.error) {
              logSpecificError(tableName, result.error);
              if (isSchemaMismatch(result.error) || isInvalidUuid(result.error)) {
                console.warn(`[Supabase Safe DB Warning] Terjadi ketidakcocokan skema atau format ID UUID pada tabel '${tableName}':`, result.error.message);
                const recoveryResult = { data: null, error: result.error, isSchemaMismatch: true };
                return onfulfilled ? onfulfilled(recoveryResult) : recoveryResult;
              }
            }
            
            return onfulfilled ? onfulfilled(result) : result;
          } catch (err: any) {
            console.error(`[Supabase Exception] Pengecualian tertangkap pada tabel '${tableName}':`, err);
            const formattedError = {
              code: err.code || 'EXCEPTION',
              message: err.message || String(err),
              details: err.details || '',
              hint: 'Kesalahan ini ditangani secara anggun oleh GNEXT Safe DB Wrapper untuk mencegah server crash.'
            };
            const exceptionResult = { data: null, error: formattedError, isException: true };
            return onfulfilled ? onfulfilled(exceptionResult) : exceptionResult;
          }
        };
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return (...args: any[]) => {
          try {
            const nextQuery = value.apply(target, args);
            // Kembalikan query terbungkus agar pemanggilan berantai tetap aman
            return wrapQueryWithSafeHandler(nextQuery, tableName);
          } catch (err) {
            console.error(`Gagal memproses fungsi berantai '${String(prop)}' pada tabel '${tableName}':`, err);
            return wrapQueryWithSafeHandler(target, tableName);
          }
        };
      }

      return value;
    }
  };

  return new Proxy(query, queryHandler);
}

function isSchemaMismatch(error: any): boolean {
  const msg = (error.message || '').toLowerCase();
  const code = error.code || '';
  return (
    code === '42703' || // undefined_column
    code === '42P01' || // undefined_table
    msg.includes('could not find') ||
    msg.includes('column') ||
    msg.includes('relation') ||
    msg.includes('does not exist')
  );
}

function isInvalidUuid(error: any): boolean {
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return code === '22P02' || msg.includes('invalid input syntax for type uuid');
}

function logSpecificError(tableName: string, error: any) {
  const code = error.code || 'UNKNOWN';
  const msg = error.message || '';
  const details = error.details || '';
  
  if (code === '22P02' || msg.includes('invalid input syntax for type uuid')) {
    console.warn(`[Supabase Safe DB Warning] Tabel: ${tableName} | Mengabaikan kueri untuk string ID non-UUID: "${msg}"`);
  } else if (code === 'PGRST116' || msg.includes('Cannot coerce the result to a single JSON object') || details.includes('0 rows')) {
    // PGRST116 occurs when 0 rows are returned for single/maybeSingle query (normal when record does not exist)
    console.info(`[Supabase Safe DB Info] Tabel: ${tableName} | Data tidak ditemukan (0 baris) untuk kueri tunggal.`);
  } else if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('placeholder.supabase.co')) {
    console.warn(
      `[Supabase Configuration Tip] Gagal menghubungkan ke Supabase (Tabel: ${tableName}). ` +
      `Kemungkinan Besar: Anda belum memasukkan atau salah menulis variabel lingkungan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di dasbor Vercel.\n` +
      `👉 Solusi: Buka Vercel Dashboard -> Project Settings -> Environment Variables, tambahkan variabel tersebut dengan URL & API Key proyek Supabase Anda yang valid, lalu lakukan Redeploy.`
    );
  } else {
    console.error(`[Supabase Safe DB Error] Tabel: ${tableName} | Kode: ${code} | Pesan: ${msg} | Detail: ${details}`);
  }
}
