import React from 'react'

export interface ControlPanelProps {
  mode: string
  onModeChange: (mode: string) => void
  tone: number
  onToneChange: (tone: number) => void
  intensity: 'subtle' | 'balanced' | 'deep'
  onIntensityChange: (intensity: 'subtle' | 'balanced' | 'deep') => void
  targetLength: 'shorter' | 'same' | 'longer'
  onTargetLengthChange: (length: 'shorter' | 'same' | 'longer') => void
  vocabulary: boolean
  onVocabularyToggle: () => void
  highlights: boolean
  onHighlightsToggle: () => void
  authorVoice: string
  onAuthorVoiceChange: (voice: string) => void
  onHumanize: () => void
  onClear: () => void
  isLoading: boolean
  isDark: boolean
  inputLength: number
  // Academic & Student capabilities
  onOpenStudentVoice?: () => void
  isVoiceCalibrated?: boolean
  isEphemeral?: boolean
  onToggleEphemeral?: () => void
  onAuditDraft?: () => void
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  onModeChange,
  tone,
  onToneChange,
  intensity,
  onIntensityChange,
  targetLength,
  onTargetLengthChange,
  vocabulary,
  onVocabularyToggle,
  highlights,
  onHighlightsToggle,
  authorVoice,
  onAuthorVoiceChange,
  onHumanize,
  isLoading,
  isDark,
  inputLength,
  onOpenStudentVoice,
  isVoiceCalibrated = false,
  isEphemeral = false,
  onToggleEphemeral,
  onAuditDraft,
}) => {
  const modes = [
    { value: 'academic', label: 'Academic Clarity', desc: 'Scholarly precision & citations', badge: 'Recommended' },
    { value: 'natural', label: 'Natural Rewrite', desc: 'Organic scholarly cadence', badge: 'Popular' },
    { value: 'professional', label: 'Professional', desc: 'Crisp executive prose', badge: 'Business' },
    { value: 'casual', label: 'Casual Writing', desc: 'Warm conversational flow', badge: 'Authentic' },
    { value: 'concise', label: 'Concise (Trim)', desc: 'Cut bloat, keep facts', badge: 'High Signal' },
    { value: 'expand', label: 'Expand for Clarity', desc: 'Illustrative nuance', badge: 'Detailed' },
    { value: 'grammar', label: 'Grammar Polish', desc: 'Mechanics & syntax', badge: 'Precision' },
    { value: 'tone', label: 'Tone Adjustment', desc: 'Formal to casual dial', badge: 'Fine-tune' },
    { value: 'paraphrase', label: 'Paraphrase', desc: 'Fresh vocabulary architecture', badge: 'Creative' },
    { value: 'summary', label: 'Summarize', desc: 'Factual core brief', badge: 'Distill' },
  ]

  const voices = [
    { id: 'scholarly', label: 'Scholarly & Objective', hint: 'Analytical & reasoned' },
    { id: 'balanced', label: 'Balanced & Natural', hint: 'Adaptable human cadence' },
    { id: 'direct', label: 'Direct & Impactful', hint: 'Active voice, zero fluff' },
    { id: 'conversational', label: 'Friendly & Engaging', hint: 'Warm & relatable' }
  ]

  const toneLabel = tone < 35 ? 'Formal' : tone > 65 ? 'Conversational' : 'Neutral / Balanced'

  return (
    <div className={`flex flex-col gap-5 p-6 rounded-2xl border transition-all ${
      isDark
        ? 'bg-charcoal-900/80 border-white/10 shadow-xl'
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
          <span>Academic Engine Settings</span>
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/25">
          Scholarly Edition
        </span>
      </div>

      {/* Mode Selection */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Writing Mode
          </label>
          <span className="text-[10px] text-slate-400">Select transformation style</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onModeChange(m.value)}
              className={`p-2.5 rounded-xl text-left text-xs transition-all flex flex-col justify-between border ${
                mode === m.value
                  ? 'bg-gold-500 text-charcoal-950 border-gold-400 font-bold shadow-md shadow-gold-500/20'
                  : 'bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 border-white/5'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-bold truncate">{m.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                  mode === m.value ? 'bg-charcoal-950/20 text-charcoal-950' : 'bg-white/5 text-slate-400'
                }`}>
                  {m.badge}
                </span>
              </div>
              <span className={`text-[10px] mt-1 line-clamp-1 ${
                mode === m.value ? 'text-charcoal-900/90 font-medium' : 'text-slate-400'
              }`}>
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Student Voice Calibration Trigger */}
      {onOpenStudentVoice && (
        <div className="p-3 rounded-xl bg-charcoal-950/70 border border-gold-500/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🎓 Personal Student Voice</span>
              {isVoiceCalibrated && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Calibrated
                </span>
              )}
            </span>
            <p className="text-[10px] text-slate-400">
              {isVoiceCalibrated ? 'Custom syntax & formality active' : 'Analyze your past writing sample'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenStudentVoice}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 transition-all"
          >
            {isVoiceCalibrated ? '⚙️ Edit Voice' : '✍️ Calibrate'}
          </button>
        </div>
      )}

      {/* Author Voice Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Academic Voice Register
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {voices.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onAuthorVoiceChange(v.id)}
              className={`p-2 rounded-xl text-left text-xs transition-all border ${
                authorVoice === v.id
                  ? 'bg-gold-500/20 text-gold-300 border-gold-500/40 font-bold'
                  : 'bg-charcoal-850 hover:bg-charcoal-800 text-slate-400 border-white/5'
              }`}
            >
              <div className="font-semibold text-slate-200">{v.label}</div>
              <div className="text-[10px] text-slate-400">{v.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone Slider & Register Presets */}
      <div className="p-3.5 rounded-xl bg-charcoal-950/70 border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-300">
            Tone Tuning
          </label>
          <span className="text-xs font-mono font-bold text-gold-400">
            {toneLabel} ({tone}%)
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={tone}
          onChange={(e) => onToneChange(Number(e.target.value))}
          className="w-full h-1.5 bg-charcoal-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
          <button 
            type="button" 
            onClick={() => onToneChange(15)}
            className={`hover:text-gold-400 transition-colors ${tone <= 30 ? 'text-gold-400 font-bold' : ''}`}
          >
            Formal (15%)
          </button>
          <button 
            type="button" 
            onClick={() => onToneChange(50)}
            className={`hover:text-gold-400 transition-colors ${tone > 30 && tone < 70 ? 'text-gold-400 font-bold' : ''}`}
          >
            Neutral (50%)
          </button>
          <button 
            type="button" 
            onClick={() => onToneChange(85)}
            className={`hover:text-gold-400 transition-colors ${tone >= 70 ? 'text-gold-400 font-bold' : ''}`}
          >
            Conversational (85%)
          </button>
        </div>
      </div>

      {/* Target Length (Concise vs Detailed) */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Output Length Control
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { id: 'shorter', label: 'Concise (Trim)' },
            { id: 'same', label: 'Balanced (Same)' },
            { id: 'longer', label: 'Detailed (Expand)' }
          ] as const).map((len) => (
            <button
              key={len.id}
              type="button"
              onClick={() => onTargetLengthChange(len.id)}
              className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all border ${
                targetLength === len.id
                  ? 'bg-gold-500/20 text-gold-300 border-gold-500/40 shadow-sm'
                  : 'bg-charcoal-850 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              {len.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Transformation Depth
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { id: 'subtle', label: 'Subtle Polish' },
            { id: 'balanced', label: 'Balanced' },
            { id: 'deep', label: 'Deep Restructure' }
          ] as const).map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => onIntensityChange(level.id)}
              className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all border ${
                intensity === level.id
                  ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                  : 'bg-charcoal-850 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Checkbox Toggles & Privacy Toggle */}
      <div className="space-y-2 pt-1">
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-950/60 border border-white/5 cursor-pointer hover:border-white/10 transition-all">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={vocabulary}
              onChange={onVocabularyToggle}
              className="w-4 h-4 rounded accent-gold-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200">
              Vocabulary Enrichment
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Sophisticated diction</span>
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-950/60 border border-white/5 cursor-pointer hover:border-white/10 transition-all">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={highlights}
              onChange={onHighlightsToggle}
              className="w-4 h-4 rounded accent-gold-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200">
              Highlight Word Changes
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Diff markers</span>
        </label>

        {/* Ephemeral Privacy Mode */}
        {onToggleEphemeral && (
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-950/80 border border-gold-500/20 cursor-pointer hover:border-gold-500/40 transition-all">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={isEphemeral}
                onChange={onToggleEphemeral}
                className="w-4 h-4 rounded accent-gold-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-gold-300 flex items-center gap-1">
                <span>🛡️ Ephemeral Mode</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Zero DB storage</span>
          </label>
        )}
      </div>

      {/* Quick Action: Audit Draft Quality (Without modifying text) */}
      {onAuditDraft && (
        <button
          type="button"
          onClick={onAuditDraft}
          disabled={isLoading || inputLength === 0}
          className="w-full py-2.5 px-3 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 border border-white/10 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <span>📊 Audit Draft Quality (Report Only)</span>
        </button>
      )}

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onHumanize}
        disabled={isLoading || inputLength === 0}
        className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
          isLoading || inputLength === 0
            ? 'bg-charcoal-800 text-slate-600 border border-white/5 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-charcoal-950 hover:brightness-110 shadow-gold-500/20 active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
            <span>Refining with Academic Precision...</span>
          </>
        ) : (
          <>
            <span>Improve Academic Writing</span>
          </>
        )}
      </button>

      {/* Integrity Notice */}
      <p className="text-[10px] text-center text-slate-500 font-medium">
        Preserves citations, empirical figures, quotes, and author voice. Never fabricates AI detection scores.
      </p>
    </div>
  )
}
