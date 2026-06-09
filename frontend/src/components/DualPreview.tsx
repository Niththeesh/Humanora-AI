import React from 'react'

interface DualPreviewProps {
  original: string
  humanized: string
  isDark: boolean
}

export const DualPreview: React.FC<DualPreviewProps> = ({ original, humanized, isDark }) => {
  const highlightChanges = (text: string, reference: string): React.ReactNode[] => {
    const origWords = reference.split(/\s+/)
    const newWords = text.split(/\s+/)
    
    return text.split(/(\s+)/).map((word, idx) => {
      const cleanWord = word.trim()
      if (!cleanWord) return word
      
      // Check if this word was changed
      const isSame = origWords.some(w => w === cleanWord)
      
      return (
        <span
          key={idx}
          className={!isSame && reference.length > 0 ? 'bg-yellow-300/30 rounded px-1' : ''}
        >
          {word}
        </span>
      )
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original */}
      <div className={`p-4 rounded-xl border-2 transition-all ${
        isDark
          ? 'bg-gray-900/50 border-gray-700/50 text-gray-100'
          : 'bg-red-50/50 border-red-200/50 text-gray-900'
      }`}>
        <h4 className={`text-xs font-bold mb-2 ${
          isDark ? 'text-gray-400' : 'text-red-600'
        }`}>
          📄 ORIGINAL
        </h4>
        <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-opacity-75">
          {original}
        </p>
      </div>

      {/* Humanized with Highlights */}
      <div className={`p-4 rounded-xl border-2 transition-all ${
        isDark
          ? 'bg-gray-900/50 border-green-700/50 text-gray-100'
          : 'bg-green-50/50 border-green-200/50 text-gray-900'
      }`}>
        <h4 className={`text-xs font-bold mb-2 ${
          isDark ? 'text-green-400' : 'text-green-600'
        }`}>
          ✨ ENHANCED (Changes highlighted)
        </h4>
        <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
          {highlightChanges(humanized, original)}
        </p>
      </div>
    </div>
  )
}
