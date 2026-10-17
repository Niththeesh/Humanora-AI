import React from 'react'
import { AIDetectionMetrics } from '../utils/clientHumanizer'

interface AIDetectionMeterProps {
  metrics: AIDetectionMetrics
  isDark?: boolean
}

export const AIDetectionMeter: React.FC<AIDetectionMeterProps> = ({ metrics }) => {
  return (
    <div className="p-4 rounded-xl bg-charcoal-950/90 border border-teal-500/30 shadow-lg shadow-teal-950/20 space-y-3 transition-all duration-300">
      {/* Top Banner: Rhythmic Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 text-base shadow-sm shadow-teal-500/20">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-tight">
                Writing Quality & Cadence Telemetry
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Linguistic Analysis
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluates sentence rhythm, burstiness, lexical diversity, and syntactic variety
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-400 font-mono">Flow Index:</span>
          <span className="font-mono text-teal-300 font-bold bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/25">
            {metrics.burstinessScore}/100 Cadence
          </span>
        </div>
      </div>

      {/* Visual Meter Bar: Rhythm & Cadence Variance */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-semibold">
          <span className="text-teal-300 flex items-center gap-1">
            <span>●</span> Dynamic Natural Cadence ({metrics.burstinessScore}% Rhythmic Flow)
          </span>
          <span className="text-slate-500">
            Monotonous SVO Structure
          </span>
        </div>
        <div className="w-full h-2.5 bg-charcoal-900 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-300 shadow-sm shadow-teal-400/40 transition-all duration-700"
            style={{ width: `${Math.max(15, Math.min(100, metrics.burstinessScore))}%` }}
          />
        </div>
      </div>

      {/* Major Linguistic Diagnostics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-teal-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Cadence Variance</span>
          <span className="text-xs font-mono font-extrabold text-teal-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors?.turnitin || 'Varied Cadence'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-teal-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Clause Dynamics</span>
          <span className="text-xs font-mono font-extrabold text-teal-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors?.gptZero || 'Dynamic Flow'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-teal-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Lexical Variety</span>
          <span className="text-xs font-mono font-extrabold text-teal-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors?.originality || 'High Perplexity'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-teal-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Syntactic Structure</span>
          <span className="text-xs font-mono font-extrabold text-teal-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors?.copyleaks || 'Diverse Syntax'}
          </span>
        </div>
      </div>

      {/* Detailed Telemetry Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
        <div className="p-2.5 rounded-lg bg-charcoal-900/50 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span>⚡</span> Burstiness & Sentence Length Variety
            </div>
            <div className="text-[10px] text-slate-500">
              StdDev: {metrics.sentenceVariance}w • {metrics.shortSentenceRatio}% short (≤8w) • {metrics.longSentenceRatio}% analytical (≥22w)
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-teal-400">
            {metrics.burstinessScore}/100
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-charcoal-900/50 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span>📚</span> Lexical Unpredictability (Perplexity)
            </div>
            <div className="text-[10px] text-slate-500">
              {metrics.clicheCount === 0 ? 'Zero formulaic AI clichés detected' : `${metrics.clicheCount} robotic phrases replaced`}
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-emerald-400">
            {metrics.perplexityScore}/100
          </span>
        </div>
      </div>

      {/* Scientific & Educational Disclaimer */}
      <div className="pt-1 border-t border-white/5">
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          * Notice: AI detector scores are statistical heuristics based on perplexity and burstiness, not infallible measures of authorship. Humanora optimizes for authentic clarity, semantic preservation, and engaging human prose.
        </p>
      </div>
    </div>
  )
}
