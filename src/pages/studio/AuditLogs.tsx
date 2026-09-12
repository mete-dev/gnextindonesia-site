import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, AuditLog } from './types';

export default function AuditLogs({ currentUser, embedded }: { currentUser: User; embedded?: boolean }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!embedded && currentUser.role !== 'Administrator' && currentUser.role !== 'Manajer Pers') {
    return <div className="p-8 text-center text-neutral-500">Anda tidak memiliki akses ke halaman ini. (Khusus Administrator & Manajer Pers)</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Audit Logs</h2>
          <p className="text-neutral-500">Pantau aktivitas pengguna di Studio panel (menampilkan 100 log terakhir).</p>
        </div>
        <button onClick={loadLogs} className="px-4 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
          Refresh
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden max-w-5xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="py-4 px-6 font-medium text-neutral-600 w-48">Waktu</th>
                <th className="py-4 px-6 font-medium text-neutral-600">Pengguna</th>
                <th className="py-4 px-6 font-medium text-neutral-600">Aksi</th>
                <th className="py-4 px-6 font-medium text-neutral-600">Resource</th>
                <th className="py-4 px-6 font-medium text-neutral-600 w-1/3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">Memuat data...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">Belum ada log aktivitas.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6 text-neutral-500 text-sm whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 font-medium">{log.user_name}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                        log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                        log.action === 'REPORT' ? 'bg-purple-100 text-purple-700 font-bold' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-700">{log.resource}</td>
                    <td className="py-4 px-6 text-neutral-500 text-sm">{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
