import React, { useMemo } from 'react'

interface MetricsDisplayProps {
  original: string
  humanized: string
  isDark: boolean
}

interface Metrics {
  readabilityScore: number
  clarityScore: number
  varietyScore: number
  engagementScore: number
  averageScore: number
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ original, humanized, isDark }) => {
  const metrics = useMemo(() => calculateMetrics(original, humanized), [original, humanized])

  return (
    <div className={`p-6 rounded-2xl transition-all ${
      isDark 
        ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/50'
        : 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-blue-200/50'
    }`}
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <h3 className={`font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
        📊 Writing Quality Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Readability"
          score={metrics.readabilityScore}
          isDark={isDark}
          color="blue"
        />
        <MetricCard
          label="Clarity"
          score={metrics.clarityScore}
          isDark={isDark}
          color="green"
        />
        <MetricCard
          label="Variety"
          score={metrics.varietyScore}
          isDark={isDark}
          color="purple"
        />
        <MetricCard
          label="Engagement"
          score={metrics.engagementScore}
          isDark={isDark}
          color="orange"
        />
      </div>

      {/* Overall Score */}
      <div className={`mt-4 p-3 rounded-lg ${
        isDark
          ? 'bg-gray-800/50 text-gray-200'
          : 'bg-white/50 text-gray-800'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Overall Quality Score</span>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            {metrics.averageScore}%
          </span>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${metrics.averageScore}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  score: number
  isDark: boolean
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const MetricCard: React.FC<MetricCardProps> = ({ label, score, isDark, color }) => {
  const colorClasses = {
    blue: isDark ? 'from-blue-600 to-blue-700' : 'from-blue-400 to-blue-500',
    green: isDark ? 'from-green-600 to-green-700' : 'from-green-400 to-green-500',
    purple: isDark ? 'from-purple-600 to-purple-700' : 'from-purple-400 to-purple-500',
    orange: isDark ? 'from-orange-600 to-orange-700' : 'from-orange-400 to-orange-500',
  }

  return (
    <div className={`text-center p-3 rounded-lg ${
      isDark ? 'bg-gray-800/50' : 'bg-white/50'
    }`}>
      <p className={`text-xs font-semibold uppercase mb-1 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {label}
      </p>
      <p className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {score}
      </p>
    </div>
  )
}

/**
 * Calculate writing quality metrics
 */
function calculateMetrics(original: string, humanized: string): Metrics {
  const origWords = original.trim().split(/\s+/)
  const humanWords = humanized.trim().split(/\s+/)
  
  const origSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const humanSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0)

  // Readability: Based on average word length and sentence length
  const origAvgWordLen = origWords.reduce((sum, w) => sum + w.length, 0) / origWords.length
  const humanAvgWordLen = humanWords.reduce((sum, w) => sum + w.length, 0) / humanWords.length
  const readabilityScore = Math.max(0, 100 - Math.abs(humanAvgWordLen - 5) * 5)

  // Clarity: Based on sentence variation (ideal: sentences of different lengths)
  const getVariance = (sentences: string[]) => {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length)
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length
    return Math.sqrt(variance)
  }
  const origVariance = getVariance(origSentences)
  const humanVariance = getVariance(humanSentences)
  const clarityScore = Math.min(100, 50 + humanVariance * 10)

  // Variety: Measure of unique words ratio
  const uniqueOrigWords = new Set(origWords.map(w => w.toLowerCase())).size
  const uniqueHumanWords = new Set(humanWords.map(w => w.toLowerCase())).size
  const varietyScore = (uniqueHumanWords / humanWords.length) * 100

  // Engagement: Based on adjectives, transitions, and punctuation variety
  const transitions = ['however', 'furthermore', 'moreover', 'additionally', 'nevertheless', 'consequently']
  const transitionCount = transitions.filter(t => 
    humanized.toLowerCase().includes(t)
  ).length
  const punctuationVariety = (humanized.match(/[!?;:—]/g) || []).length
  const engagementScore = Math.min(100, 50 + (transitionCount * 5) + (punctuationVariety * 3))

  const averageScore = Math.round(
    (readabilityScore + clarityScore + varietyScore + engagementScore) / 4
  )

  return {
    readabilityScore: Math.round(readabilityScore),
    clarityScore: Math.round(clarityScore),
    varietyScore: Math.round(varietyScore),
    engagementScore: Math.round(engagementScore),
    averageScore,
  }
}
