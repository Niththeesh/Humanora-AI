import React, { useState, useRef } from 'react'

interface BatchProcessorProps {
  isDark: boolean
  onProcessBatch: (files: File[]) => void
  isProcessing: boolean
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({ isDark, onProcessBatch, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const textFiles = selectedFiles.filter(f => 
      f.type === 'text/plain' || 
      f.name.endsWith('.txt') ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    setFiles(prev => [...prev, ...textFiles])
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
    <div className={`p-6 rounded-2xl transition-all ${
      isDark 
        ? 'bg-gray-800/60 border border-gray-700/50' 
        : 'bg-white/60 border border-gray-100/50'
    }`}
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        📦 Batch Processing
      </h3>

      {/* File upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDark
            ? 'border-gray-600/50 hover:bg-gray-700/50'
            : 'border-gray-300/50 hover:bg-gray-100/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          📄 Click to upload or drag files (.txt, .docx)
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Selected Files ({files.length})
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {files.map((file, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center p-2 rounded text-sm ${
                  isDark
                    ? 'bg-gray-700/50 text-gray-300'
                    : 'bg-gray-200/50 text-gray-700'
                }`}
              >
                <span className="truncate">📄 {file.name}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-red-500 hover:text-red-600 ml-2 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleProcess}
          disabled={files.length === 0 || isProcessing}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
            files.length === 0 || isProcessing
              ? isDark
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300/50 text-gray-500 cursor-not-allowed'
              : isDark
                ? 'bg-green-600/80 text-white hover:bg-green-700/90'
                : 'bg-green-500/80 text-white hover:bg-green-600/90'
          }`}
        >
          {isProcessing ? '⏳ Processing...' : `🚀 Process ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>
        <button
          onClick={() => setFiles([])}
          disabled={files.length === 0}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            files.length === 0
              ? isDark
                ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200/30 text-gray-500 cursor-not-allowed'
              : isDark
                ? 'bg-red-600/60 text-white hover:bg-red-700/80'
                : 'bg-red-500/60 text-white hover:bg-red-600/80'
          }`}
        >
          Clear
        </button>
      </div>

      <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        💡 Tip: Upload multiple documents to humanize them all at once
      </p>
    </div>
  )
}
