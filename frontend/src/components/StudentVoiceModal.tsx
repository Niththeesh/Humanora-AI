import React, { useState } from 'react'
import axios from 'axios'

export interface StudentVoiceProfile {
  formality: number
  avgSentenceLength: number
  lexicalDiversity: number
  burstiness: number
  tone: string
  keyPreferences: string[]
}

interface StudentVoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveVoice: (sample: string, profile: StudentVoiceProfile | null) => void
  currentSample: string
  currentProfile: StudentVoiceProfile | null
  isDark?: boolean
}

export const StudentVoiceModal: React.FC<StudentVoiceModalProps> = ({
  isOpen,
  onClose,
  onSaveVoice,
  currentSample,
  currentProfile,
  isDark = true,
}) => {
  const [sampleText, setSampleText] = useState(currentSample || '')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedProfile, setAnalyzedProfile] = useState<StudentVoiceProfile | null>(currentProfile)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAnalyze = async () => {
    if (!sampleText.trim() || sampleText.trim().length < 40) {
      setErrorMessage('Please provide at least 40 characters of your past academic writing.')
      return
    }

    setIsAnalyzing(true)
    setErrorMessage(null)

    try {
      const res = await axios.post('/api/ai/analyze-voice', {
        sample: sampleText
      })

      if (res.data?.success && res.data?.voiceProfile) {
        setAnalyzedProfile(res.data.voiceProfile)
      } else {
        setErrorMessage('Could not analyze sample. Please ensure sufficient text is provided.')
      }
    } catch (err: any) {
      console.error('Voice analysis failed:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to analyze writing sample. Backend unreachable.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApply = () => {
    onSaveVoice(sampleText, analyzedProfile)
    onClose()
  }

  const handleClear = () => {
    setSampleText('')
    setAnalyzedProfile(null)
    onSaveVoice('', null)
    setErrorMessage(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark 
            ? 'bg-charcoal-900 border-white/10 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-charcoal-950/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✍️</span>
            <div>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                Student Voice Calibration
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  Personal Voice
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Teach Humanora your natural academic register, sentence length, and vocabulary
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Instructions */}
          <div className="p-4 rounded-2xl bg-charcoal-850/50 border border-white/5 space-y-1 text-xs text-slate-300">
            <span className="font-bold text-white block">How it works:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Paste 1 to 2 paragraphs from an essay or paper you wrote previously. Humanora will extract your syntactic cadence, average sentence length, and lexical complexity so revisions sound like <em>you</em>, not a generic algorithm.
            </p>
          </div>

          {/* Sample Text Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-300">Your Writing Sample (100–500 words recommended)</label>
              <span className="text-[11px] text-slate-500">
                {sampleText.split(/\s+/).filter(w => w.length > 0).length} words
              </span>
            </div>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Paste an excerpt from your previous papers or essays here..."
              rows={6}
              className="w-full p-3.5 rounded-2xl bg-charcoal-950/60 border border-white/10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold-500/60 resize-none font-sans"
            />
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Analysis Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !sampleText.trim()}
              className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-gold-500/10"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Profile...</span>
                </>
              ) : (
                <>
                  <span>🔍 Analyze Writing Sample</span>
                </>
              )}
            </button>

            {analyzedProfile && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold transition-all"
              >
                Reset Calibration
              </button>
            )}
          </div>

          {/* Calibrated Profile Display */}
          {analyzedProfile && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-charcoal-850 to-charcoal-900 border border-gold-500/30 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gold-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✓ Calibrated Voice Profile</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 font-bold border border-gold-500/20 capitalize">
                  {analyzedProfile.tone} Tone
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-charcoal-950/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Formality</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {Math.round(analyzedProfile.formality * 100)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-charcoal-950/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Avg Sentence</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {analyzedProfile.avgSentenceLength} words
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-charcoal-950/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Lexical Richness</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {Math.round(analyzedProfile.lexicalDiversity * 100)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-charcoal-950/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Rhythm Variance</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {analyzedProfile.burstiness}
                  </span>
                </div>
              </div>

              {analyzedProfile.keyPreferences.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-300 block">Identified Stylistic Tendencies:</span>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                    {analyzedProfile.keyPreferences.map((pref, idx) => (
                      <li key={idx}>{pref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-charcoal-950/40 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            {analyzedProfile ? 'Profile ready to apply to transformations' : 'Provide sample to calibrate'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!analyzedProfile}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs font-bold transition-all disabled:opacity-40"
            >
              Apply Voice to Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
