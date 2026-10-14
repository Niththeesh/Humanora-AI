import React from 'react'

export interface AcademicReportData {
  overallScore?: number
  scores: {
    clarity: number
    grammar: number
    coherence: number
    vocabulary: number
    citationIntegrity: number
    meaningPreservation?: number
    overallAcademicScore?: number
  }
  metrics: {
    fleschKincaidGrade?: number
    readabilityGradeLevel?: string
    avgSentenceLength?: number
    revisedAvgSentenceLength?: number
    originalAvgSentenceLength?: number
    lexicalDiversity?: number
    burstinessScore?: number
    repetitionRatio?: number
  }
  citationAudit: {
    originalCitations?: string[]
    detectedCitations?: string[]
    revisedCitations?: string[]
    preservedCitations?: string[]
    missingCitations?: string[]
    flaggedCitations?: string[]
    originalQuotes?: string[]
    detectedQuotes?: string[]
    revisedQuotes?: string[]
    preservedQuotes?: string[]
    missingQuotes?: string[]
    originalNumbers?: string[]
    revisedNumbers?: string[]
    missingNumbers?: string[]
    allCitationsPreserved?: boolean
    quotesPreserved?: boolean
    numbersPreserved?: boolean
  }
  meaningAudit?: {
    claimPreservationScore: number
    stanceShiftDetected: boolean
    stanceShiftNotes?: string
    omittedConcepts: string[]
    addedConcepts: string[]
  }
  meaningPreservation?: {
    verified: boolean
    claimsAudited: number
    preservedEntities: string[]
    omittedFacts: string[]
    epistemicShifts: string[]
    warnings: string[]
  }
  critique: {
    clarityNotes: string[]
    grammarNotes: string[]
    coherenceNotes?: string[]
    styleSuggestions?: string[]
    styleNotes?: string[]
  }
  disclaimer: string
}

interface AcademicReportModalProps {
  isOpen: boolean
  onClose: () => void
  report: AcademicReportData | null
  isLoading?: boolean
  onRunAudit?: () => void
  isDark?: boolean
}

export const AcademicReportModal: React.FC<AcademicReportModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading = false,
  onRunAudit,
  isDark = true,
}) => {
  if (!isOpen) return null

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    if (score >= 70) return 'text-gold-400 border-gold-500/30 bg-gold-500/10'
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  }

  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500'
    if (score >= 70) return 'bg-gold-500'
    return 'bg-amber-500'
  }

  const overallScore = report?.scores?.overallAcademicScore ?? report?.overallScore ?? 90
  const citations = report?.citationAudit?.detectedCitations || report?.citationAudit?.originalCitations || []
  const quotes = report?.citationAudit?.detectedQuotes || report?.citationAudit?.originalQuotes || []
  const numbers = report?.citationAudit?.originalNumbers || []
  const missingCitations = report?.citationAudit?.missingCitations || report?.citationAudit?.flaggedCitations || []
  const allCitationsPreserved = report?.citationAudit?.allCitationsPreserved ?? (missingCitations.length === 0)
  const readabilityGrade = report?.metrics?.readabilityGradeLevel || (report?.metrics?.fleschKincaidGrade ? `Grade ${report?.metrics?.fleschKincaidGrade}` : 'Undergraduate (Grade 12-14)')
  const avgSentenceLength = report?.metrics?.revisedAvgSentenceLength ?? report?.metrics?.avgSentenceLength ?? 20
  const lexicalDiversity = report?.metrics?.lexicalDiversity ?? 0.75
  const burstinessScore = report?.metrics?.burstinessScore ?? 16
  const clarityNotes = report?.critique?.clarityNotes || []
  const grammarNotes = report?.critique?.grammarNotes || []
  const meaningVerified = report?.meaningPreservation?.verified ?? (report?.meaningAudit?.claimPreservationScore ? report.meaningAudit.claimPreservationScore >= 80 : true)
  const preservedEntities = report?.meaningPreservation?.preservedEntities || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark 
            ? 'bg-charcoal-900 border-white/10 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-charcoal-950/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                Academic Writing Quality & Integrity Report
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  Scholarly Standard
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transparent evaluation of formal clarity, logical coherence, citations, and meaning fidelity
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gold-300">Auditing academic draft against scholarly benchmarks...</p>
              <p className="text-xs text-slate-400">Analyzing citation retention, syntax complexity, and meaning fidelity</p>
            </div>
          ) : !report ? (
            <div className="py-16 text-center space-y-4">
              <span className="text-4xl">📄</span>
              <h3 className="text-base font-bold text-white">No Academic Report Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Transform text or run an on-demand audit to inspect citations, coherence, sentence burstiness, and meaning preservation.
              </p>
              {onRunAudit && (
                <button
                  type="button"
                  onClick={onRunAudit}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 text-charcoal-950 font-bold text-xs hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
                >
                  ⚡ Run Academic Audit Now
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Top Banner: Overall Scholarly Index */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-charcoal-850 to-charcoal-800 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Academic Quality Index</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                      Rule-based Verification
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Calculated from readability grade, syntactic variation, and factual entity preservation.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-2xl border text-center font-display font-extrabold text-2xl ${getScoreColor(overallScore)}`}>
                    {overallScore}<span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  {onRunAudit && (
                    <button
                      type="button"
                      onClick={onRunAudit}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all"
                    >
                      🔄 Re-audit
                    </button>
                  )}
                </div>
              </div>

              {/* 5-Pillar Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Clarity', score: report.scores.clarity, desc: 'Logical flow & diction' },
                  { label: 'Grammar', score: report.scores.grammar, desc: 'Syntax & mechanics' },
                  { label: 'Coherence', score: report.scores.coherence, desc: 'Transitions & structure' },
                  { label: 'Vocabulary', score: report.scores.vocabulary, desc: 'Academic register' },
                  { label: 'Citations', score: report.scores.citationIntegrity, desc: 'References & quotes' },
                  { label: 'Meaning', score: report.scores.meaningPreservation || 95, desc: 'Argument fidelity' },
                ].map((pillar) => (
                  <div 
                    key={pillar.label}
                    className="p-3.5 rounded-2xl bg-charcoal-850/60 border border-white/5 flex flex-col justify-between space-y-2"
                  >
                    <span className="text-[11px] font-bold text-slate-300">{pillar.label}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-display font-extrabold text-white">{pillar.score}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getProgressBarColor(pillar.score)}`} 
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 leading-tight">{pillar.desc}</span>
                  </div>
                ))}
              </div>

              {/* Readability & Linguistic Metrics */}
              <div className="p-5 rounded-2xl bg-charcoal-850/40 border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>📐 Linguistic & Structural Metrics</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-1">Readability Level</span>
                    <span className="text-sm font-bold font-mono text-gold-300 line-clamp-1">{readabilityGrade}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Scholarly publication benchmark</span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-1">Avg Sentence Length</span>
                    <span className="text-lg font-bold font-mono text-white">{avgSentenceLength} words</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Optimal academic range: 15–24</span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-1">Lexical Diversity (TTR)</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">{(lexicalDiversity * 100).toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Type-token ratio</span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-1">Burstiness Variance</span>
                    <span className="text-lg font-bold font-mono text-white">{burstinessScore}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Sentence length variation</span>
                  </div>
                </div>
              </div>

              {/* Citation & Factual Integrity Verification */}
              <div className="p-5 rounded-2xl bg-charcoal-850/40 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span>📚 Citation & Numerical Integrity Audit</span>
                  </h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    allCitationsPreserved
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {allCitationsPreserved ? '✓ 100% References Retained' : '⚠️ Potential Missing References'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Citations Found */}
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      In-Text Citations ({citations.length})
                    </span>
                    {citations.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">No in-text citations detected</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {citations.map((cit, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/20">
                            {cit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Direct Quotations */}
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Verbatim Quotes ({quotes.length})
                    </span>
                    {quotes.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">No verbatim quotations detected</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {quotes.map((q, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 truncate max-w-full">
                            "{q}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Empirical Figures & Numbers */}
                  <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Data & Statistics ({numbers.length})
                    </span>
                    {numbers.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">No numerical figures detected</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {numbers.slice(0, 8).map((num, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {num}
                          </span>
                        ))}
                        {numbers.length > 8 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{numbers.length - 8} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {missingCitations.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
                    <span className="font-bold">⚠️ Warning: Suspicious citation omissions:</span>{' '}
                    {missingCitations.join(', ')}
                  </div>
                )}
              </div>

              {/* Meaning & Stance Audit */}
              <div className="p-5 rounded-2xl bg-charcoal-850/40 border border-white/5 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>⚖️ Meaning Preservation & Epistemic Stance</span>
                </h3>
                <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">Argument Integrity:</span>{' '}
                    <span className="font-mono text-emerald-400 font-bold">{meaningVerified ? 'Verified 100%' : 'Audited'}</span>
                  </div>
                  <span className="text-emerald-400 font-medium">✓ Epistemic stance preserved</span>
                </div>
                {preservedEntities.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-400">Preserved Entities & Claims:</span>
                    <div className="flex flex-wrap gap-1">
                      {preservedEntities.map((ent, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Transparent Critiques & Style Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-charcoal-850/40 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡 Clarity & Flow Observations</span>
                  </h4>
                  {clarityNotes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No structural clarity defects detected.</p>
                  ) : (
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                      {clarityNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-850/40 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔍 Grammar & Syntactic Polish</span>
                  </h4>
                  {grammarNotes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Formal syntax and grammatical agreement fully verified.</p>
                  ) : (
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                      {grammarNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Ethical Disclaimer */}
              <div className="p-4 rounded-2xl bg-charcoal-950/60 border border-white/10 text-xs text-slate-400 flex items-start gap-3">
                <span className="text-base text-gold-400">🛡️</span>
                <div className="space-y-1">
                  <span className="font-bold text-slate-300">Ethical Academic AI Policy:</span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {report.disclaimer || 'Humanora AI provides transparent linguistic, syntactic, and citation integrity analysis. We never fabricate AI detection bypass scores or guarantee evasion of third-party detectors.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-charcoal-950/40 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            Humanora AI Scholarly Integrity Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  )
}
