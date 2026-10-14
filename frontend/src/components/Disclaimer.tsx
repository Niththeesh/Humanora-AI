import React from 'react'

interface DisclaimerProps {
  isDark?: boolean
}

export const Disclaimer: React.FC<DisclaimerProps> = () => {
  return (
    <div className="p-4 rounded-xl border-l-4 border-gold-500 bg-charcoal-900/60 border border-white/5 transition-all text-xs text-slate-400 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-gold-400 font-bold text-sm">🛡️</span>
        <span className="font-bold text-slate-200">
          Authenticity & Ethical Writing Standards
        </span>
      </div>
      <p className="leading-relaxed">
        Humanora AI is designed to elevate clarity, cadence, and human phrasing while strictly preserving factual claims, numbers, quotations, and research integrity. We believe in genuine writing improvement—not fabricating detection evasion metrics or promoting academic dishonesty.
      </p>
    </div>
  )
}
