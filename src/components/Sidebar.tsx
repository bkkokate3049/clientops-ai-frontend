import type { ChangeEvent } from 'react';
import { Upload, FileText, Trash2, Sparkles, Loader2, AlertCircle, X } from 'lucide-react';
import type { DocItem } from '../types/chat';

interface SidebarProps {
  docs: DocItem[];
  uploading: boolean;
  error: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onDelete: (sourceName: string) => Promise<void>;
}

export function Sidebar({
  docs,
  uploading,
  error,
  isOpen,
  onClose,
  onUpload,
  onDelete,
}: SidebarProps) {
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    await onUpload(file);
    e.target.value = '';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 max-w-[85vw] border-r border-slate-800 bg-slate-900 p-5 flex flex-col shrink-0 transition-transform duration-200 md:static md:translate-x-0 md:bg-slate-900/60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">ClientOps AI</h1>
              <span className="text-[11px] text-slate-400">Enterprise RAG Copilot</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg md:hidden"
            aria-label="Close knowledge base sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer transition bg-slate-950/60">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-1" />
          ) : (
            <Upload className="w-6 h-6 text-indigo-400 mb-1" />
          )}
          <span className="text-sm font-medium">
            {uploading ? 'Indexing vectors...' : 'Upload Policy PDF / TXT'}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 text-center">
            Max 10MB • Auto-chunks to pgvector
          </span>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-xs text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex-1 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Indexed Knowledge ({docs.length})
          </h2>
          {docs.length === 0 ? (
            <p className="text-xs text-slate-500">Upload a PDF or TXT file to begin.</p>
          ) : (
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li
                  key={doc.sourceName}
                  className="flex items-center justify-between bg-slate-800/70 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <p className="truncate font-medium text-slate-200">{doc.sourceName}</p>
                      <p className="text-xs text-slate-400">{doc.chunkCount} vector chunks</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(doc.sourceName)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 transition"
                    title="Remove from knowledge base"
                    aria-label={`Delete ${doc.sourceName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
