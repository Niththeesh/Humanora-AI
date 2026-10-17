import React, { useMemo } from 'react'

interface MetricsDisplayProps {
  original: string
  humanized: string
  isDark?: boolean
}

interface Metrics {
  readabilityScore: number
  clarityScore: number
  varietyScore: number
  engagementScore: number
  averageScore: number
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ original, humanized }) => {
  const metrics = useMemo(() => calculateMetrics(original, humanized), [original, humanized])

  return (
    <div className="p-5 rounded-xl bg-charcoal-950/80 border border-white/10 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>📊</span>
          <span>Writing Flow & Readability Analysis</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">Real-Time Linguistic Parser</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Readability" score={metrics.readabilityScore} desc="Syllabic ease & cadence" />
        <MetricCard label="Syntactic Clarity" score={metrics.clarityScore} desc="Sentence length burstiness" />
        <MetricCard label="Lexical Variety" score={metrics.varietyScore} desc="Unique vocabulary ratio" />
        <MetricCard label="Engagement" score={metrics.engagementScore} desc="Dynamic transitions" />
      </div>

      {/* Overall Score Banner */}
      <div className="p-3.5 rounded-xl bg-charcoal-900 border border-gold-500/25 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-white">Composite Quality Rating</span>
            <p className="text-[11px] text-slate-400">Harmonious balance of variety, clarity, and readability</p>
          </div>
          <span className="text-2xl font-display font-extrabold bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
            {metrics.averageScore}%
          </span>
        </div>

        <div className="w-full bg-charcoal-950 rounded-full h-2 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-gold-500 via-gold-400 to-amber-300 h-2 rounded-full transition-all duration-500 shadow-sm shadow-gold-500/50"
            style={{ width: `${metrics.averageScore}%` }}
          />
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  score: number
  desc: string
}

const MetricCard: React.FC<MetricCardProps> = ({ label, score, desc }) => {
  return (
    <div className="p-3 rounded-xl bg-charcoal-900/60 border border-white/5 flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold font-display text-white">
          {score}%
        </p>
      </div>
      <p className="text-[10px] text-slate-500 mt-1">
        {desc}
      </p>
    </div>
  )
}

function calculateMetrics(_original: string, humanized: string): Metrics {
  const humanWords = humanized.trim().split(/\s+/).filter(w => w.length > 0)
  const humanSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0)

  if (humanWords.length === 0) {
    return {
      readabilityScore: 0,
      clarityScore: 0,
      varietyScore: 0,
      engagementScore: 0,
      averageScore: 0
    }
  }

  // Readability
  const humanAvgWordLen = humanWords.reduce((sum, w) => sum + w.length, 0) / humanWords.length
  const readabilityScore = Math.min(100, Math.max(40, Math.round(100 - Math.abs(humanAvgWordLen - 4.8) * 8)))

  // Clarity (Sentence length variance = burstiness)
  const lengths = humanSentences.map(s => s.trim().split(/\s+/).filter(w => w.length > 0).length)
  const avg = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 10
  const variance = lengths.length > 0 ? Math.sqrt(lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length) : 0
  const clarityScore = Math.min(98, Math.max(50, Math.round(55 + variance * 6)))

  // Variety
  const uniqueHumanWords = new Set(humanWords.map(w => w.toLowerCase())).size
  const varietyScore = Math.min(96, Math.max(45, Math.round((uniqueHumanWords / humanWords.length) * 110)))

  // Engagement (natural human connectors and punctuation variety)
  const transitions = ['however', 'in turn', 'nevertheless', 'consequently', 'similarly', 'conversely', 'notably', 'specifically', 'in contrast', 'meanwhile']
  const transitionCount = transitions.filter(t => humanized.toLowerCase().includes(t)).length
  const punctuationVariety = (humanized.match(/[!?;:—]/g) || []).length
  const engagementScore = Math.min(95, Math.max(45, Math.round(50 + (transitionCount * 6) + (punctuationVariety * 3))))

  const averageScore = Math.round((readabilityScore + clarityScore + varietyScore + engagementScore) / 4)

  return {
    readabilityScore,
    clarityScore,
    varietyScore,
    engagementScore,
    averageScore
  }
}
