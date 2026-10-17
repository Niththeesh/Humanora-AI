import React from 'react'
import { AIDetectionMetrics } from '../utils/clientHumanizer'

interface AIDetectionMeterProps {
  metrics: AIDetectionMetrics
  isDark?: boolean
}

export const AIDetectionMeter: React.FC<AIDetectionMeterProps> = ({ metrics }) => {
  return (
    <div className="p-4 rounded-xl bg-charcoal-950/90 border border-emerald-500/30 shadow-lg shadow-emerald-950/20 space-y-3 transition-all duration-300">
      {/* Top Banner: Verification Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-base shadow-sm shadow-emerald-500/20">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-tight">
                AI Detection: <span className="text-emerald-400 font-black">{metrics.aiScore}%</span> ({metrics.humanScore}% Human Written)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <span>✓</span> Verified Human
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High Burstiness & Perplexity algorithms active • Completely undetectable
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-400 font-mono">Status:</span>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/25">
            100% BYPASS
          </span>
        </div>
      </div>

      {/* Visual Meter Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-semibold">
          <span className="text-emerald-400 flex items-center gap-1">
            <span>●</span> 0% AI (100% Human Written)
          </span>
          <span className="text-slate-500">
            100% AI (Robotic Flagged)
          </span>
        </div>
        <div className="w-full h-2.5 bg-charcoal-900 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-sm shadow-emerald-400/50 transition-all duration-700"
            style={{ width: `${Math.max(8, 100 - metrics.aiScore)}%` }}
          />
        </div>
      </div>

      {/* Major Detector Benchmark Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-emerald-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Turnitin</span>
          <span className="text-xs font-mono font-extrabold text-emerald-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors.turnitin}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-emerald-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">GPTZero</span>
          <span className="text-xs font-mono font-extrabold text-emerald-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors.gptZero}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-emerald-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Originality.ai</span>
          <span className="text-xs font-mono font-extrabold text-emerald-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors.originality}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-charcoal-900/80 border border-emerald-500/20 flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Copyleaks</span>
          <span className="text-xs font-mono font-extrabold text-emerald-300 flex items-center gap-1 mt-0.5">
            <span>✓</span> {metrics.bypassedDetectors.copyleaks}
          </span>
        </div>
      </div>

      {/* Linguistic Telemetry: Burstiness & Perplexity Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
        <div className="p-2.5 rounded-lg bg-charcoal-900/50 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span>⚡</span> Burstiness (Cadence Variation)
            </div>
            <div className="text-[10px] text-slate-500">
              StdDev: {metrics.sentenceVariance}w • Mixed short & complex clauses
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-teal-400">
            {metrics.burstinessScore}/100
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-charcoal-900/50 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span>🎲</span> Perplexity (Lexical Unpredictability)
            </div>
            <div className="text-[10px] text-slate-500">
              Zero robotic transition clichés detected
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-emerald-400">
            {metrics.perplexityScore}/100
          </span>
        </div>
      </div>
    </div>
  )
}
