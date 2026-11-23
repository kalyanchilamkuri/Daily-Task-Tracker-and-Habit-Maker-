import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Task } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../utils/sound';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onImportTasks: (newTasks: Task[], mode: 'merge' | 'replace') => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onImportTasks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<Task[] | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    sound.playClick();
    StorageService.exportTasksJSON(tasks);
  };

  const handleExportCSV = () => {
    sound.playClick();
    StorageService.exportTasksCSV(tasks);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const parsed = await StorageService.importTasksFromJSON(file);
      setPendingImport(parsed);
      setImportStatus(`Loaded ${parsed.length} valid tasks. Choose how to import:`);
    } catch (err) {
      setImportError('Failed to read JSON file. Please ensure valid format.');
      setPendingImport(null);
    }
  };

  const handleConfirmImport = (mode: 'merge' | 'replace') => {
    if (!pendingImport) return;
    sound.playCreate();
    onImportTasks(pendingImport, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 text-slate-100 z-10 border border-slate-700/60 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import & Export Data</h2>
              <p className="text-xs text-slate-400">Backup and restore your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          {/* Export section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Export Backup ({tasks.length} tasks)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center space-y-1.5 transition-all text-slate-300 hover:text-white group"
              >
                <FileJson className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">JSON Format</span>
                <span className="text-[10px] text-slate-500">Full structured backup</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center space-y-1.5 transition-all text-slate-300 hover:text-white group"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">CSV Spreadsheet</span>
                <span className="text-[10px] text-slate-500">Excel & Sheets friendly</span>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Import from File
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900/80 border border-dashed border-slate-700 hover:border-cyan-400 flex items-center justify-center space-x-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Choose JSON Backup File</span>
            </button>

            {importError && (
              <div className="mt-2 text-xs text-rose-400 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{importError}</span>
              </div>
            )}

            {pendingImport && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{importStatus}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleConfirmImport('merge')}
                    className="py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-200"
                  >
                    Merge Tasks
                  </button>
                  <button
                    onClick={() => handleConfirmImport('replace')}
                    className="py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-xs font-semibold text-rose-200"
                  >
                    Replace All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
