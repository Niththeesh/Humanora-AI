import React, { useState } from 'react'
import { AIDetectResult } from '../utils/clientHumanizer'

interface AIDetectorPanelProps {
  inputDetection: AIDetectResult | null
  outputDetection: AIDetectResult | null
  isScanning?: boolean
  onScanInput?: () => void
  hasOutput?: boolean
}

export const AIDetectorPanel: React.FC<AIDetectorPanelProps> = ({
  inputDetection,
  outputDetection,
  isScanning = false,
  onScanInput,
  hasOutput = false
}) => {
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null)
  const [activeView, setActiveView] = useState<'comparison' | 'input' | 'output'>('comparison')

  // If no scan has been performed yet
  if (!inputDetection && !outputDetection) {
    return (
      <div className="rounded-2xl bg-charcoal-900/90 border border-white/10 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 text-xl font-bold shadow-sm">
              🛡️
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Writing Pattern Estimator</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Cadence & Heuristics
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasOutput
                  ? 'Inspect both original and rewritten texts to verify how burstiness, cliché reduction, and sentence variety improved.'
                  : 'Analyze burstiness, vocabulary entropy, and formulaic AI signature clichés.'}
              </p>
            </div>
          </div>

          {onScanInput && (
            <button
              onClick={onScanInput}
              disabled={isScanning}
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-charcoal-950 shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Patterns...</span>
                </>
              ) : (
                <>
                  <span>🔍 Scan Text for AI Markers</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>ℹ️ Estimate based on writing patterns. Not equivalent to Turnitin/GPTZero and not a guarantee.</span>
        </div>
      </div>
    )
  }

  const primaryDetection = outputDetection || inputDetection!

  const getVerdictBadge = (verdict: 'Low' | 'Medium' | 'High') => {
    switch (verdict) {
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Low AI Likelihood (Organic Human Cadence)
          </span>
        )
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Medium AI Likelihood (Mixed Patterns)
          </span>
        )
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            High AI Likelihood (Formulaic Patterns)
          </span>
        )
    }
  }

  const getGaugeColor = (score: number) => {
    if (score <= 34) return 'from-emerald-500 to-teal-400'
    if (score <= 68) return 'from-amber-500 to-yellow-400'
    return 'from-rose-500 to-red-400'
  }

  const getGaugeTextColor = (score: number) => {
    if (score <= 34) return 'text-emerald-400'
    if (score <= 68) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className="rounded-2xl bg-charcoal-900/90 border border-white/10 p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 text-xl font-bold">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                AI Writing Pattern Estimator
              </h3>
              {inputDetection && outputDetection && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Before vs After Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates burstiness variance, lexical richness (TTR), transition openers, and AI cliché density.
            </p>
          </div>
        </div>

        {/* View Switcher if both input & output are available */}
        {inputDetection && outputDetection && (
          <div className="flex items-center bg-charcoal-950/80 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveView('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'comparison'
                  ? 'bg-teal-500 text-charcoal-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveView('input')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'input'
                  ? 'bg-teal-500 text-charcoal-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Original Draft
            </button>
            <button
              onClick={() => setActiveView('output')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'output'
                  ? 'bg-teal-500 text-charcoal-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Humanized Output
            </button>
          </div>
        )}

        {/* Quick Rescan Button */}
        {onScanInput && !outputDetection && (
          <button
            onClick={onScanInput}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            {isScanning ? 'Scanning...' : '↻ Re-analyze Input'}
          </button>
        )}
      </div>

      {/* BEFORE VS AFTER COMPARISON CARD */}
      {inputDetection && outputDetection && activeView === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Original Draft */}
          <div className="p-5 rounded-xl bg-charcoal-950/70 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Original Draft (Before)
              </span>
              <span className={`text-xs font-extrabold font-mono ${getGaugeTextColor(inputDetection.aiScore)}`}>
                {inputDetection.aiScore}% AI Likelihood
              </span>
            </div>

            <div className="w-full h-2.5 bg-charcoal-900 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getGaugeColor(inputDetection.aiScore)} transition-all duration-700`}
                style={{ width: `${inputDetection.aiScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              {getVerdictBadge(inputDetection.verdict)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/5">
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-slate-400 block">Burstiness SD:</span>
                <span className="font-mono font-bold text-white">
                  {inputDetection.signals.burstiness.standardDeviation} ({inputDetection.signals.burstiness.label})
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-slate-400 block">AI Clichés:</span>
                <span className="font-mono font-bold text-rose-300">
                  {inputDetection.signals.clicheDensity.count} found
                </span>
              </div>
            </div>
          </div>

          {/* Right: Humanized Output */}
          <div className="p-5 rounded-xl bg-teal-950/20 border border-teal-500/30 space-y-4 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ↓ {Math.max(0, inputDetection.aiScore - outputDetection.aiScore)}% Reduction
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Humanized Output (After)
              </span>
              <span className={`text-xs font-extrabold font-mono ${getGaugeTextColor(outputDetection.aiScore)}`}>
                {outputDetection.aiScore}% AI Likelihood
              </span>
            </div>

            <div className="w-full h-2.5 bg-charcoal-900 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getGaugeColor(outputDetection.aiScore)} transition-all duration-700`}
                style={{ width: `${outputDetection.aiScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              {getVerdictBadge(outputDetection.verdict)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-teal-500/20">
              <div className="p-2 rounded-lg bg-teal-950/40 border border-teal-500/20">
                <span className="text-slate-400 block">Burstiness SD:</span>
                <span className="font-mono font-bold text-teal-300">
                  {outputDetection.signals.burstiness.standardDeviation} ({outputDetection.signals.burstiness.label})
                </span>
              </div>
              <div className="p-2 rounded-lg bg-teal-950/40 border border-teal-500/20">
                <span className="text-slate-400 block">AI Clichés:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {outputDetection.signals.clicheDensity.count} found
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE SCAN DETAIL VIEW */}
      {(!inputDetection || !outputDetection || activeView !== 'comparison') && (
        <div className="space-y-6">
          {/* Main Meter & Score */}
          <div className="p-5 rounded-xl bg-charcoal-950/70 border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-black font-mono tracking-tight ${getGaugeTextColor(primaryDetection.aiScore)}`}>
                  {primaryDetection.aiScore}%
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Writing Pattern Probability
                  </div>
                  <div className="text-xs text-slate-400">
                    Human Cadence Flow: <span className="text-teal-300 font-bold font-mono">{primaryDetection.humanScore}%</span>
                  </div>
                </div>
              </div>

              <div>{getVerdictBadge(primaryDetection.verdict)}</div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-charcoal-900 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getGaugeColor(primaryDetection.aiScore)} transition-all duration-700`}
                style={{ width: `${primaryDetection.aiScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {primaryDetection.summary}
            </p>
          </div>

          {/* Detailed Signal Diagnostic Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Burstiness */}
            <div className="p-3.5 rounded-xl bg-charcoal-950/50 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-slate-400">Cadence Burstiness</div>
              <div className="text-base font-extrabold text-white font-mono">
                {primaryDetection.signals.burstiness.standardDeviation} <span className="text-[11px] text-slate-400 font-sans font-normal">SD</span>
              </div>
              <div className="text-[10px] text-teal-400">
                {primaryDetection.signals.burstiness.label}
              </div>
            </div>

            {/* 2. Lexical Diversity */}
            <div className="p-3.5 rounded-xl bg-charcoal-950/50 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-slate-400">Lexical Richness (TTR)</div>
              <div className="text-base font-extrabold text-white font-mono">
                {primaryDetection.signals.lexicalDiversity.typeTokenRatio}
              </div>
              <div className="text-[10px] text-teal-400">
                {primaryDetection.signals.lexicalDiversity.label}
              </div>
            </div>

            {/* 3. AI Clichés */}
            <div className="p-3.5 rounded-xl bg-charcoal-950/50 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-slate-400">AI Signature Clichés</div>
              <div className="text-base font-extrabold font-mono text-white">
                {primaryDetection.signals.clicheDensity.count}
              </div>
              <div className={`text-[10px] ${primaryDetection.signals.clicheDensity.count === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {primaryDetection.signals.clicheDensity.label}
              </div>
            </div>

            {/* 4. Transition Openers */}
            <div className="p-3.5 rounded-xl bg-charcoal-950/50 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-slate-400">Transition Openers</div>
              <div className="text-base font-extrabold font-mono text-white">
                {primaryDetection.signals.transitionUniformity.percentage}%
              </div>
              <div className="text-[10px] text-teal-400">
                {primaryDetection.signals.transitionUniformity.label}
              </div>
            </div>
          </div>

          {/* AI Clichés Detected Pills */}
          {primaryDetection.signals.clicheDensity.foundCliches.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
              <span className="text-xs font-bold text-rose-300 block">
                Detected AI Hallmark Phrasing:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {primaryDetection.signals.clicheDensity.foundCliches.map((cliche, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30"
                  >
                    "{cliche}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Per-Sentence Breakdown & Highlighting */}
          {primaryDetection.sentenceAnalysis && primaryDetection.sentenceAnalysis.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Sentence-by-Sentence Telemetry:
                </span>
                <span className="text-[11px] text-slate-400">
                  Click any sentence to inspect specific pattern reasons
                </span>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-950/80 border border-white/10 space-y-2 leading-relaxed text-sm">
                {primaryDetection.sentenceAnalysis.map((item, idx) => {
                  const isSelected = selectedSentenceIndex === idx
                  const highlightClass =
                    item.verdict === 'High'
                      ? 'bg-rose-500/20 text-rose-200 border-b border-rose-500/40'
                      : item.verdict === 'Medium'
                      ? 'bg-amber-500/20 text-amber-200 border-b border-amber-500/40'
                      : 'text-slate-300'

                  return (
                    <span
                      key={idx}
                      onClick={() => setSelectedSentenceIndex(isSelected ? null : idx)}
                      className={`inline cursor-pointer transition-all rounded px-1 py-0.5 mr-1.5 ${highlightClass} ${
                        isSelected ? 'ring-2 ring-teal-400' : 'hover:bg-white/10'
                      }`}
                      title={item.reasons.length > 0 ? item.reasons.join('; ') : 'Natural sentence structure'}
                    >
                      {item.sentence}{' '}
                    </span>
                  )
                })}
              </div>

              {/* Selected Sentence Explanation Card */}
              {selectedSentenceIndex !== null && primaryDetection.sentenceAnalysis[selectedSentenceIndex] && (
                <div className="p-3.5 rounded-xl bg-charcoal-950 border border-teal-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-300">
                      Sentence #{selectedSentenceIndex + 1} Analysis:
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Score: {primaryDetection.sentenceAnalysis[selectedSentenceIndex].score}/100
                    </span>
                  </div>
                  <p className="text-slate-200 italic">
                    "{primaryDetection.sentenceAnalysis[selectedSentenceIndex].sentence}"
                  </p>
                  {primaryDetection.sentenceAnalysis[selectedSentenceIndex].reasons.length > 0 ? (
                    <ul className="list-disc list-inside text-rose-300 space-y-0.5 pt-1">
                      {primaryDetection.sentenceAnalysis[selectedSentenceIndex].reasons.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-emerald-300">✓ Organic human syntax and natural flow.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Honest Disclaimer */}
      <div className="pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-slate-400 leading-normal">
        <span className="text-teal-400 font-bold mt-[-1px]">⚖️</span>
        <div>
          <span className="font-semibold text-slate-300">Notice & Methodology: </span>
          {primaryDetection.disclaimer} AI detection is a probabilistic estimate derived from statistical cadence, lexical entropy, and cliché density. No software can provide 100% guarantee against false positives or false negatives.
        </div>
      </div>
    </div>
  )
}
