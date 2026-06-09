import React, { useState } from 'react'
import { DualPreview } from './DualPreview'
import { MetricsDisplay } from './MetricsDisplay'

interface OutputSectionProps {
  text: string
  original?: string
  isLoading: boolean
  isDark: boolean
  showHighlights: boolean
  stats?: any
  showMetrics?: boolean
  showDualPreview?: boolean
}

export const OutputSection: React.FC<OutputSectionProps> = ({ 
  text, 
  original = '',
  isLoading, 
  isDark, 
  showHighlights,
  stats,
  showMetrics = false,
  showDualPreview = false
}) => {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'original' | 'dual' | 'metrics'>('original')

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsText = () => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
    element.setAttribute('download', 'humanized-text.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadAsDocx = () => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${btoa(text)}`)
    element.setAttribute('download', 'humanized-text.docx')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className={`flex flex-col gap-3 p-6 rounded-2xl transition-dark ${
      isDark 
        ? 'bg-gray-800/60 border border-gray-700/50' 
        : 'bg-white/60 border border-gray-100/50'
    }`}
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <div className="flex justify-between items-center">
        <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Humanized Output
        </label>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Processing...
            </span>
          </div>
        )}
      </div>

      {/* View Mode Tabs */}
      {text && (showDualPreview || showMetrics) && (
        <div className="flex gap-2 border-b border-gray-600/30">
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${
              viewMode === 'original'
                ? isDark
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : isDark
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-600'
            }`}>
            Enhanced Text
          </button>
          {showDualPreview && (
            <button
              onClick={() => setViewMode('dual')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                viewMode === 'dual'
                  ? isDark
                    ? 'border-green-500 text-green-400'
                    : 'border-green-500 text-green-600'
                  : isDark
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-600'
              }`}>
              Side-by-Side Compare
            </button>
          )}
          {showMetrics && (
            <button
              onClick={() => setViewMode('metrics')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                viewMode === 'metrics'
                  ? isDark
                    ? 'border-purple-500 text-purple-400'
                    : 'border-purple-500 text-purple-600'
                  : isDark
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-600'
              }`}>
              Quality Metrics
            </button>
          )}
        </div>
      )}

      {text ? (
        <>
          {viewMode === 'original' && (
            <div className={`relative min-h-64 p-4 rounded-xl border-2 transition-all ${
              isDark
                ? 'bg-gray-900/50 border-gray-700/50 text-gray-100'
                : 'bg-white/50 border-gray-200/50 text-gray-900'
            }`}>
              <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {text}
              </p>
            </div>
          )}

          {viewMode === 'dual' && showDualPreview && original && (
            <DualPreview
              original={original}
              humanized={text}
              isDark={isDark}
            />
          )}

          {viewMode === 'metrics' && showMetrics && original && (
            <MetricsDisplay
              original={original}
              humanized={text}
              isDark={isDark}
            />
          )}

          {stats && (
            <div className={`grid grid-cols-2 gap-2 text-xs p-3 rounded-lg ${
              isDark
                ? 'bg-gray-700/30 text-gray-300'
                : 'bg-gray-200/30 text-gray-700'
            }`}>
              <div>📊 Original: {stats.originalLength} chars</div>
              <div>📈 Enhanced: {stats.humanizedLength} chars</div>
              <div>📝 Words: {stats.originalWords} → {stats.humanizedWords}</div>
              <div>✨ Quality: Premium</div>
            </div>
          )}
        </>
      ) : (
        <div className={`h-64 flex items-center justify-center rounded-xl border-2 border-dashed transition-all ${
          isDark
            ? 'bg-gray-900/30 border-gray-700/30 text-gray-500'
            : 'bg-gray-50/30 border-gray-300/30 text-gray-400'
        }`}>
          <p className="text-center">
            Your humanized text will appear here...
          </p>
        </div>
      )}

      {text && (
        <div className="flex flex-wrap gap-2 pt-3">
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              copied
                ? isDark
                  ? 'bg-green-600/80 text-white'
                  : 'bg-green-500/80 text-white'
                : isDark
                  ? 'bg-blue-600/80 text-white hover:bg-blue-700/90'
                  : 'bg-blue-500/80 text-white hover:bg-blue-600/90'
            }`}>
            {copied ? '✓ Copied' : 'Copy Text'}
          </button>
          <button
            onClick={downloadAsText}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isDark
                ? 'bg-purple-600/80 text-white hover:bg-purple-700/90'
                : 'bg-purple-500/80 text-white hover:bg-purple-600/90'
            }`}>
            Download .txt
          </button>
          <button
            onClick={downloadAsDocx}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isDark
                ? 'bg-orange-600/80 text-white hover:bg-orange-700/90'
                : 'bg-orange-500/80 text-white hover:bg-orange-600/90'
            }`}>
            Download .docx
          </button>
        </div>
      )}
    </div>
  )
}
