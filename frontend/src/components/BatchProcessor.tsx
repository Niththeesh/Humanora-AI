import React, { useState, useRef } from 'react'

interface BatchProcessorProps {
  isDark?: boolean
  onProcessBatch: (files: File[]) => void
  isProcessing: boolean
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({ onProcessBatch, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const textFiles = selectedFiles.filter(f => 
      f.type === 'text/plain' || 
      f.name.endsWith('.txt') ||
      f.name.endsWith('.md') ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    setFiles(prev => [...prev, ...textFiles].slice(0, 10))
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleProcess = () => {
    if (files.length > 0) {
      onProcessBatch(files)
    }
  }

  return (
    <div className="p-6 rounded-2xl border bg-charcoal-900/80 border-white/10 shadow-xl space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
          <span>📦 Batch Document Processing</span>
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/25">
          Max 10 Documents
        </span>
      </div>

      {/* File upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all border-white/10 hover:border-gold-500/40 bg-charcoal-950/50 hover:bg-charcoal-950/80 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-xl bg-charcoal-850 text-gold-400 flex items-center justify-center text-xl mx-auto mb-2 border border-white/5 group-hover:scale-110 transition-transform">
          📄
        </div>
        <p className="text-xs font-semibold text-slate-300">
          Click to upload or drag & drop files (.txt, .md, .docx)
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Each file will be processed through your currently active writing mode
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400">
            Queued Files ({files.length})
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2.5 rounded-lg text-xs bg-charcoal-950/80 text-slate-300 border border-white/5"
              >
                <span className="truncate max-w-xs font-mono">📄 {file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-slate-500 hover:text-red-400 p-1 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleProcess}
          disabled={files.length === 0 || isProcessing}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            files.length === 0 || isProcessing
              ? 'bg-charcoal-800 text-slate-600 border border-white/5 cursor-not-allowed'
              : 'bg-gold-500 text-charcoal-950 hover:bg-gold-400 shadow-lg shadow-gold-500/20'
          }`}
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
              <span>Processing Batch...</span>
            </>
          ) : (
            <span>🚀 Process {files.length} {files.length === 1 ? 'Document' : 'Documents'}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFiles([])}
          disabled={files.length === 0}
          className="px-4 py-3 rounded-xl font-semibold text-xs text-slate-400 hover:text-red-400 bg-charcoal-850 border border-white/5 transition-all"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
