import React from 'react'

interface TextInputAreaProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  isDark: boolean
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({ value, onChange, onClear, isDark }) => {
  const wordCount = value.trim() ? value.trim().split(/\s+/).filter(w => w.length > 0).length : 0
  const charLimit = 50000

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) onChange(value ? value + '\n\n' + text : text)
    } catch {
      // Clipboard access denied or unsupported
    }
  }

  const loadSample = (type: 'robotic' | 'academic' | 'business') => {
    const samples = {
      robotic: `In conclusion, it is important to remember that artificial intelligence is revolutionizing many aspects of society. Moreover, the implementation of these technologies demonstrates significant potential. Furthermore, it can be stated that organizations must adapt to these paradigms in order to remain competitive. As a result, seamless integration is paramount for achieving optimal outcomes.`,
      academic: `The present inquiry endeavors to delineate the epistemological ramifications of automated textual composition within contemporary pedagogic frameworks. Preliminary assessments indicate a non-trivial incidence of syntactical homogeneity, which invariably undermines the dialectical rigor conventionally anticipated in undergraduate discourse.`,
      business: `Per our prior discussion regarding Q3 deliverable milestones, we need to touch base and synergize cross-functional bandwidth. We should leverage our core competencies to optimize customer touchpoints and facilitate actionable deliverables before the end-of-quarter deadline.`
    }
    onChange(samples[type])
  }

  const handleClearWithConfirm = () => {
    if (!value) return
    if (value.length > 100) {
      if (window.confirm('Clear all input text? This action cannot be undone.')) {
        onClear()
      }
    } else {
      onClear()
    }
  }

  return (
    <div className={`flex flex-col gap-3 p-6 rounded-2xl transition-all border ${
      isDark
        ? 'bg-charcoal-900/70 border-white/10 shadow-xl'
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Top Bar: Title & Sample Presets */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <span>Source Text Draft</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
              Input
            </span>
          </label>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Try Sample:</span>
          <button
            type="button"
            onClick={() => loadSample('robotic')}
            className="px-2 py-1 rounded text-[11px] font-medium bg-charcoal-850 hover:bg-gold-500/15 hover:text-gold-300 text-slate-400 border border-white/5 transition-all"
          >
            Robotic AI
          </button>
          <button
            type="button"
            onClick={() => loadSample('academic')}
            className="px-2 py-1 rounded text-[11px] font-medium bg-charcoal-850 hover:bg-gold-500/15 hover:text-gold-300 text-slate-400 border border-white/5 transition-all"
          >
            Academic
          </button>
          <button
            type="button"
            onClick={() => loadSample('business')}
            className="px-2 py-1 rounded text-[11px] font-medium bg-charcoal-850 hover:bg-gold-500/15 hover:text-gold-300 text-slate-400 border border-white/5 transition-all"
          >
            Business
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type your draft here... Support up to 50,000 characters with full factual and quotation preservation."
          maxLength={charLimit}
          className={`w-full h-72 p-4 rounded-xl border font-mono text-sm leading-relaxed resize-none focus:outline-none transition-all ${
            isDark
              ? 'bg-charcoal-950/80 border-white/10 text-slate-100 placeholder-slate-600 focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30'
              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500'
          }`}
        />

        {/* Floating action buttons inside editor */}
        <div className="absolute right-3 bottom-4 flex items-center gap-2">
          {navigator.clipboard && (
            <button
              type="button"
              onClick={handlePaste}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-charcoal-850/90 text-slate-300 hover:text-gold-300 hover:bg-charcoal-800 border border-white/10 transition-all flex items-center gap-1"
              title="Paste from clipboard"
            >
              <span>📋 Paste</span>
            </button>
          )}

          {value && (
            <button
              type="button"
              onClick={handleClearWithConfirm}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-500/20 transition-all"
              title="Clear input"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bottom Counter Bar */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-300">
            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
          </span>
          <span className="text-slate-600">|</span>
          <span className={`${value.length > 45000 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            {value.length.toLocaleString()} / {charLimit.toLocaleString()} characters
          </span>
        </div>

        <span className="text-[11px] text-slate-500">
          Untrusted input guardrails active
        </span>
      </div>
    </div>
  )
}
