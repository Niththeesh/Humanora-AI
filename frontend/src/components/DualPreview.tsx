import React from 'react'

interface DualPreviewProps {
  original: string
  humanized: string
  isDark?: boolean
}

export const DualPreview: React.FC<DualPreviewProps> = ({ original, humanized }) => {
  const origWordSet = new Set(
    original
      .split(/\s+/)
      .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 0)
  )

  const renderHighlightedHumanized = (text: string): React.ReactNode[] => {
    return text.split(/(\s+)/).map((segment, idx) => {
      if (/^\s+$/.test(segment)) {
        return <span key={idx}>{segment}</span>
      }

      const clean = segment.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!clean) return <span key={idx}>{segment}</span>

      const isProtected = /^(?:\$|€|£)?\d+(?:\.\d+)?%?$/.test(segment) || /^\(?\d{4}\)?$/.test(segment)
      const isOriginal = origWordSet.has(clean)

      if (isProtected) {
        return (
          <span
            key={idx}
            className="bg-emerald-500/20 text-emerald-200 border-b border-emerald-400/50 rounded px-1 font-semibold"
            title="Preserved factual datum"
          >
            {segment}
          </span>
        )
      }

      if (!isOriginal && origWordSet.size > 0) {
        return (
          <span
            key={idx}
            className="bg-gold-500/25 text-gold-200 border-b border-gold-400/50 rounded px-1"
            title="Stylistic refinement"
          >
            {segment}
          </span>
        )
      }

      return <span key={idx}>{segment}</span>
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original Side */}
      <div className="p-4 rounded-xl border bg-charcoal-950/80 border-white/10 text-slate-100 flex flex-col">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>📄</span>
            <span>Original Draft</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            {original.split(/\s+/).filter(w => w.length > 0).length} words
          </span>
        </div>
        <div className="flex-1 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-slate-300">
          {original}
        </div>
      </div>

      {/* Humanized Side with Diff Highlights */}
      <div className="p-4 rounded-xl border bg-charcoal-950/80 border-gold-500/30 text-slate-100 flex flex-col shadow-sm">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
            <span>✦</span>
            <span>Refined (Stylistic Enhancements)</span>
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gold-400/80 font-mono">
              {humanized.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
          </div>
        </div>
        <div className="flex-1 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-slate-100">
          {renderHighlightedHumanized(humanized)}
        </div>
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gold-400 inline-block" />
            <span>Refined phrasing</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Preserved datum/citation</span>
          </span>
        </div>
      </div>
    </div>
  )
}
