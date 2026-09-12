import React, { useState, useRef } from 'react';
import { 
  X, Download, Upload, Database, FileSpreadsheet, FileJson, FileCode, 
  CheckCircle2, AlertTriangle, RefreshCw, FileText, Calendar, Filter,
  Layers, CheckSquare, Square, ShieldCheck, HelpCircle
} from 'lucide-react';
import { 
  BackupFormat, BackupTable, MergeStrategy, DateFilter, SmartRestoreResult,
  fetchTableData, jsonToCSV, csvToJSON, jsonToSQL, downloadFile, 
  smartRestoreDatabase, filterItemsByDate
} from '../../lib/dataBackup';
import { User } from '../../pages/studio/types';
import { logAudit } from '../../lib/audit';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  defaultTable?: BackupTable;
  onRestoreComplete?: () => void;
}

const TABLE_OPTIONS = [
  { id: 'all', name: 'Semua Data (Full Database)', desc: 'Artikel, Kategori, Karya, Partner, Web Settings, User', icon: Database },
  { id: 'articles', name: 'Artikel Berita (articles)', desc: 'Seluruh konten berita, cover, tag, portal', icon: FileText },
  { id: 'categories', name: 'Kategori (categories)', desc: 'Kategori portal dan slug', icon: FileSpreadsheet },
  { id: 'works', name: 'Katalog Karya (works)', desc: 'URL postingan karya Instagram', icon: FileSpreadsheet },
  { id: 'partners', name: 'Data Partner (partners)', desc: 'Nama & logo mitra partner', icon: FileSpreadsheet },
  { id: 'web_settings', name: 'Web Settings (web_settings)', desc: 'Meta title, description, & lokasi', icon: FileSpreadsheet },
  { id: 'users', name: 'Pengguna / SDM (users)', desc: 'Daftar akun tim redaksi & profil', icon: FileSpreadsheet },
];

export interface BackupRestoreViewProps {
  currentUser: User;
  defaultTable?: BackupTable;
  onRestoreComplete?: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  currentUser,
  defaultTable = 'all',
  onRestoreComplete
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  
  // Backup states
  const [backupTable, setBackupTable] = useState<BackupTable>(defaultTable);
  const [backupFormat, setBackupFormat] = useState<BackupFormat>('json');
  const [isExporting, setIsExporting] = useState(false);

  // Restore states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsedDataMap, setParsedDataMap] = useState<Record<string, any[]> | null>(null);
  const [selectedTablesToRestore, setSelectedTablesToRestore] = useState<string[]>(['articles']);
  const [singleTargetTable, setSingleTargetTable] = useState<string>('articles');
  const [isMultiTableFile, setIsMultiTableFile] = useState<boolean>(false);

  // Date Filtering state
  const [enableDateFilter, setEnableDateFilter] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Strategy
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('fill_missing');

  // Execution state
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<SmartRestoreResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Export / Backup
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      
      if (backupTable === 'all') {
        const tables = ['articles', 'categories', 'works', 'partners', 'web_settings', 'users'];
        const allData: Record<string, any[]> = {};
        for (const t of tables) {
          allData[t] = await fetchTableData(t);
        }

        if (backupFormat === 'sql') {
          let fullSql = `-- GNEXT FULL DATABASE BACKUP (${timestamp})\n\n`;
          for (const t of tables) {
            fullSql += jsonToSQL(t, allData[t]) + '\n';
          }
          downloadFile(fullSql, `gnext-full-backup-${timestamp}.sql`, 'text/sql');
        } else if (backupFormat === 'csv') {
          const jsonStr = JSON.stringify(allData, null, 2);
          downloadFile(jsonStr, `gnext-full-backup-${timestamp}.json`, 'application/json');
        } else {
          const jsonStr = JSON.stringify(allData, null, 2);
          downloadFile(jsonStr, `gnext-full-backup-${timestamp}.json`, 'application/json');
        }
      } else {
        const data = await fetchTableData(backupTable);
        
        if (backupFormat === 'json') {
          const jsonStr = JSON.stringify(data, null, 2);
          downloadFile(jsonStr, `gnext-${backupTable}-${timestamp}.json`, 'application/json');
        } else if (backupFormat === 'csv') {
          const csvStr = jsonToCSV(data);
          downloadFile(csvStr, `gnext-${backupTable}-${timestamp}.csv`, 'text/csv');
        } else if (backupFormat === 'sql') {
          const sqlStr = jsonToSQL(backupTable, data);
          downloadFile(sqlStr, `gnext-${backupTable}-${timestamp}.sql`, 'text/sql');
        }
      }

      await logAudit(currentUser.name, 'BACKUP', backupTable, `Ekspor backup format ${backupFormat.toUpperCase()}`);
    } catch (err: any) {
      alert('Gagal melakukan ekspor data: ' + (err.message || String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileError(null);
    setParsedDataMap(null);
    setRestoreResult(null);

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        if (fileName.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            setIsMultiTableFile(false);
            setParsedDataMap({ [singleTargetTable]: json });
            setSelectedTablesToRestore([singleTargetTable]);
          } else if (typeof json === 'object' && json !== null) {
            const detectedKeys = Object.keys(json).filter(k => Array.isArray(json[k]));
            if (detectedKeys.length > 0) {
              setIsMultiTableFile(true);
              setParsedDataMap(json);
              setSelectedTablesToRestore(detectedKeys);
            } else {
              setIsMultiTableFile(false);
              setParsedDataMap({ [singleTargetTable]: [json] });
              setSelectedTablesToRestore([singleTargetTable]);
            }
          }
        } else if (fileName.endsWith('.csv')) {
          const records = csvToJSON(text);
          if (records.length === 0) {
            setFileError('File CSV kosong atau tidak memiliki data.');
          } else {
            setIsMultiTableFile(false);
            setParsedDataMap({ [singleTargetTable]: records });
            setSelectedTablesToRestore([singleTargetTable]);
          }
        } else {
          setFileError('Format file tidak didukung. Harap gunakan file .JSON atau .CSV.');
        }
      } catch (err: any) {
        setFileError('Gagal membaca file: ' + (err.message || String(err)));
      }
    };

    reader.readAsText(file);
  };

  const handleSingleTableTargetChange = (tableName: string) => {
    setSingleTargetTable(tableName);
    if (!isMultiTableFile && parsedDataMap) {
      const currentData = Object.values(parsedDataMap)[0] || [];
      setParsedDataMap({ [tableName]: currentData });
      setSelectedTablesToRestore([tableName]);
    }
  };

  const toggleTableSelection = (tableName: string) => {
    setSelectedTablesToRestore(prev => 
      prev.includes(tableName) ? prev.filter(t => t !== tableName) : [...prev, tableName]
    );
  };

  const dateFilterObj: DateFilter = {
    enabled: enableDateFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  };

  let totalItemsInFile = 0;
  let totalItemsPassedDate = 0;

  if (parsedDataMap) {
    selectedTablesToRestore.forEach(tbl => {
      const list = parsedDataMap[tbl] || [];
      totalItemsInFile += list.length;
      totalItemsPassedDate += filterItemsByDate(list, dateFilterObj).length;
    });
  }

  const handleRestore = async () => {
    if (!parsedDataMap || selectedTablesToRestore.length === 0) {
      alert('Pilih minimal satu data/tabel untuk direstore.');
      return;
    }

    const modeLabels: Record<MergeStrategy, string> = {
      fill_missing: 'Saling Melengkapi (Hanya isi data yang hilang)',
      update_if_newer: 'Perbarui Jika Backup Lebih Baru',
      append_all: 'Tambah Semua sebagai Record Baru',
      overwrite_all: 'Timpa Seluruh Data'
    };

    const confirmMsg = `Mulai proses Smart Restore?\n\n` +
      `- Tabel: ${selectedTablesToRestore.join(', ')}\n` +
      `- Mode: ${modeLabels[mergeStrategy]}\n` +
      `- Filter Tanggal: ${enableDateFilter ? `${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}` : 'Semua Tanggal'}\n` +
      `- Total Baris: ${totalItemsPassedDate} baris\n\n` +
      `Data lama tidak akan terhapus. Lanjutkan?`;

    if (!window.confirm(confirmMsg)) return;

    setIsRestoring(true);
    setRestoreResult(null);

    try {
      const result = await smartRestoreDatabase(
        parsedDataMap,
        selectedTablesToRestore,
        mergeStrategy,
        dateFilterObj
      );

      setRestoreResult(result);

      if (result.success || result.totalImported > 0) {
        await logAudit(
          currentUser.name,
          'RESTORE',
          selectedTablesToRestore.join(', '),
          `Smart Restore: +${result.totalImported} data baru/update, ${result.totalSkipped} dilewati, mode: ${mergeStrategy}`
        );
        if (onRestoreComplete) onRestoreComplete();
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat restore: ' + (err.message || String(err)));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="flex border-b border-neutral-200 bg-white pt-1 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'backup'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Download size={15} />
          <span>Ekspor / Unduh Backup</span>
        </button>

        <button
          onClick={() => setActiveTab('restore')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'restore'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Upload size={15} />
          <span>Smart Restore / Impor Data</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="space-y-4 text-xs">
        {activeTab === 'backup' ? (
          <div className="space-y-4">
            {/* Select Target Table */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                1. Pilih Data yang Ingin Di-backup
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {TABLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = backupTable === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setBackupTable(opt.id as BackupTable)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-white mt-0.5' : 'text-neutral-500 mt-0.5'} />
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight">{opt.name}</p>
                        <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Select Format */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                2. Pilih Format File
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBackupFormat('json')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    backupFormat === 'json'
                      ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <FileJson size={16} className="text-amber-600" />
                    <span>JSON (.json)</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Lengkap, struktur nested utuh & aman</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBackupFormat('csv')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    backupFormat === 'csv'
                      ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <span>CSV (.csv)</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Tabel data untuk spreadsheet / Excel</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBackupFormat('sql')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    backupFormat === 'sql'
                      ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <FileCode size={16} className="text-blue-600" />
                    <span>SQL (.sql)</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Script query INSERT PostgreSQL</p>
                </button>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-98 transition-all disabled:opacity-50"
              >
                <Download size={15} className={isExporting ? 'animate-bounce' : ''} />
                <span>{isExporting ? 'Memproses Ekspor Data...' : `Unduh Backup Sekarang (.${backupFormat})`}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                1. Unggah File Backup (.JSON atau .CSV)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,.csv"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl p-5 text-center cursor-pointer bg-neutral-50 hover:bg-neutral-100/60 transition-colors space-y-1.5"
              >
                <Upload size={24} className="mx-auto text-neutral-400" />
                <p className="font-bold text-neutral-800 text-xs">
                  {selectedFile ? selectedFile.name : 'Klik untuk memilih file backup'}
                </p>
                <p className="text-[10px] text-neutral-500">
                  Mendukung backup utuh (full database) atau file per-tabel (.json / .csv)
                </p>
              </div>

              {fileError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={13} /> {fileError}
                </p>
              )}
            </div>

            {/* Parsed Data Options */}
            {parsedDataMap && (
              <div className="space-y-3">
                
                {/* Partial Table Selection */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Layers size={14} className="text-neutral-700" />
                      2. Pilih Bagian yang Ingin Dipulihkan (Partial Restore)
                    </span>
                    <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded font-mono">
                      {isMultiTableFile ? 'Full Backup Multi-Tabel' : 'Single Tabel'}
                    </span>
                  </div>

                  {isMultiTableFile ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                      {Object.keys(parsedDataMap).map((tblKey) => {
                        const count = parsedDataMap[tblKey]?.length || 0;
                        const isChecked = selectedTablesToRestore.includes(tblKey);
                        return (
                          <div
                            key={tblKey}
                            onClick={() => toggleTableSelection(tblKey)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                              isChecked
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {isChecked ? <CheckSquare size={13} /> : <Square size={13} className="text-neutral-400" />}
                              <span className="font-semibold capitalize">{tblKey}</span>
                            </div>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              isChecked ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-neutral-600 whitespace-nowrap">Pulihkan ke tabel:</span>
                      <select
                        value={singleTargetTable}
                        onChange={e => handleSingleTableTargetChange(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      >
                        <option value="articles">Artikel Berita (articles)</option>
                        <option value="categories">Kategori (categories)</option>
                        <option value="works">Katalog Karya (works)</option>
                        <option value="partners">Data Partner (partners)</option>
                        <option value="web_settings">Web Settings (web_settings)</option>
                        <option value="users">Pengguna / SDM (users)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Date Filter Selection */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-neutral-800 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableDateFilter}
                        onChange={e => setEnableDateFilter(e.target.checked)}
                        className="rounded text-neutral-900 focus:ring-0 cursor-pointer"
                      />
                      <Calendar size={14} className="text-neutral-700" />
                      3. Filter Berdasarkan Tanggal Data
                    </label>
                    <span className="text-[10px] text-neutral-500">
                      {enableDateFilter ? 'Filter Aktif' : 'Semua Tanggal (Nonaktif)'}
                    </span>
                  </div>

                  {enableDateFilter && (
                    <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                          Dari Tanggal (Mulai):
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                          Sampai Tanggal (Selesai):
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Merge Mode */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <label className="block font-bold text-neutral-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    4. Strategi Penggabungan (Smart Merge)
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      onClick={() => setMergeStrategy('fill_missing')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        mergeStrategy === 'fill_missing'
                          ? 'bg-emerald-900/10 border-emerald-700 text-emerald-950 ring-1 ring-emerald-700'
                          : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">Saling Melengkapi (Aman)</span>
                        {mergeStrategy === 'fill_missing' && <CheckCircle2 size={13} className="text-emerald-700" />}
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-0.5 leading-tight">
                        Hanya tambahkan data yang hilang/belum ada. Data lawas TIDAK akan menghapus atau menimpa data yang sudah ada di database.
                      </p>
                    </div>

                    <div
                      onClick={() => setMergeStrategy('update_if_newer')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        mergeStrategy === 'update_if_newer'
                          ? 'bg-blue-900/10 border-blue-700 text-blue-950 ring-1 ring-blue-700'
                          : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">Perbarui Jika Backup Lebih Baru</span>
                        {mergeStrategy === 'update_if_newer' && <CheckCircle2 size={13} className="text-blue-700" />}
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-0.5 leading-tight">
                        Bandingkan timestamp. Jika data file lebih baru dari database, perbarui; jika data database lebih baru, pertahankan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Preview Box */}
                <div className="p-2.5 bg-neutral-900 text-neutral-200 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Total Data Terpilih Siap Diproses:</span>
                    <span className="font-bold text-white text-sm">
                      {totalItemsPassedDate} <span className="text-xs font-normal text-neutral-400">baris</span>
                    </span>
                    {enableDateFilter && totalItemsInFile !== totalItemsPassedDate && (
                      <span className="text-[10px] text-amber-400 ml-2">
                        ({totalItemsInFile - totalItemsPassedDate} baris di luar rentang tanggal)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRestore}
                    disabled={isRestoring || totalItemsPassedDate === 0}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs active:scale-98 transition-all disabled:opacity-50 text-xs"
                  >
                    <RefreshCw size={13} className={isRestoring ? 'animate-spin' : ''} />
                    <span>{isRestoring ? 'Memproses...' : 'Mulai Smart Restore'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Restore Result Report */}
            {restoreResult && (
              <div className={`p-3 rounded-xl border text-xs ${
                restoreResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1.5">
                  {restoreResult.success ? <CheckCircle2 size={16} className="text-emerald-700" /> : <AlertTriangle size={16} className="text-amber-700" />}
                  <span>Laporan Smart Restore Selesai</span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white/60 p-2 rounded-lg mb-2 text-center text-[11px]">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Data Ditambahkan / Update</span>
                    <strong className="text-emerald-700 text-sm">{restoreResult.totalImported}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Dilewati (Sudah Ada)</span>
                    <strong className="text-neutral-700 text-sm">{restoreResult.totalSkipped}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Error</span>
                    <strong className="text-red-600 text-sm">{restoreResult.totalErrors}</strong>
                  </div>
                </div>

                {/* Per table stats */}
                <div className="space-y-1">
                  {Object.entries(restoreResult.tableStats).map(([tbl, stats]) => (
                    <div key={tbl} className="flex items-center justify-between text-[10px] border-b border-neutral-200/50 py-0.5">
                      <span className="font-bold capitalize">{tbl}:</span>
                      <span className="text-neutral-600 font-mono">
                        +{stats.inserted} baru, +{stats.updated} update, {stats.skipped} skip
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultTable = 'all',
  onRestoreComplete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-display font-bold text-neutral-900">
                Backup & Smart Restore Data
              </h3>
              <p className="text-[11px] text-neutral-500">
                Ekspor data website atau pulihkan data lama secara cerdas tanpa menghapus data baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <BackupRestoreView 
            currentUser={currentUser} 
            defaultTable={defaultTable} 
            onRestoreComplete={onRestoreComplete} 
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Gnext Non-Destructive Database Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-lg font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};