import React from 'react'

interface ControlPanelProps {
  mode: string
  onModeChange: (mode: string) => void
  tone: number
  onToneChange: (tone: number) => void
  complexity: number
  onComplexityChange: (complexity: number) => void
  vocabulary: boolean
  onVocabularyToggle: () => void
  highlights: boolean
  onHighlightsToggle: () => void
  onHumanize: () => void
  onClear: () => void
  isLoading: boolean
  isDark: boolean
  inputLength: number
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  onModeChange,
  tone,
  onToneChange,
  complexity,
  onComplexityChange,
  vocabulary,
  onVocabularyToggle,
  highlights,
  onHighlightsToggle,
  onHumanize,
  onClear,
  isLoading,
  isDark,
  inputLength,
}) => {
  const modes = [
    { value: 'standard', label: 'Standard Mode' },
    { value: 'advanced', label: 'Advanced Humanizer' },
    { value: 'academic', label: 'Academic Rewrite' },
    { value: 'creative', label: 'Creative Rewrite' },
  ]

  const toneLabels = {
    0: 'Formal',
    50: 'Neutral',
    100: 'Casual'
  }

  return (
    <div className={`flex flex-col gap-6 p-6 rounded-2xl transition-dark ${
      isDark 
        ? 'bg-gray-800/60 border border-gray-700/50' 
        : 'bg-white/60 border border-gray-100/50'
    }`}
    style={{
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      {/* Mode Selection */}
      <div>
        <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Rewriting Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => onModeChange(m.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                mode === m.value
                  ? isDark
                    ? 'bg-blue-600/90 text-white'
                    : 'bg-blue-500/90 text-white'
                  : isDark
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
                    : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/70'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tone Slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tone
          </label>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {toneLabels[tone as keyof typeof toneLabels] || 'Custom'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={tone}
          onChange={(e) => onToneChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className={`flex justify-between text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <span>Formal</span>
          <span>Neutral</span>
          <span>Casual</span>
        </div>
      </div>

      {/* Complexity Slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Sentence Complexity
          </label>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {complexity}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={complexity}
          onChange={(e) => onComplexityChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className={`flex justify-between text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <span>Simple</span>
          <span>Moderate</span>
          <span>Complex</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 flex flex-col">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={vocabulary}
            onChange={onVocabularyToggle}
            className="w-5 h-5 rounded accent-green-500"
          />
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Vocabulary Enhancer
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={highlights}
            onChange={onHighlightsToggle}
            className="w-5 h-5 rounded accent-green-500"
          />
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Highlight Improvements
          </span>
        </label>
      </div>

      {/* Humanize Button */}
      <button
        onClick={onHumanize}
        disabled={isLoading || inputLength === 0}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
          isLoading || inputLength === 0
            ? isDark
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'bg-gray-300/50 text-gray-500 cursor-not-allowed'
            : isDark
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
        }`}>
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Processing...
          </span>
        ) : (
          '✨ Humanize Text'
        )}
      </button>

      {/* Clear Button */}
      <button
        onClick={onClear}
        disabled={isLoading || inputLength === 0}
        className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
          isLoading || inputLength === 0
            ? isDark
              ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200/30 text-gray-500 cursor-not-allowed'
            : isDark
              ? 'bg-red-600/60 text-white hover:bg-red-700/80'
              : 'bg-red-500/60 text-white hover:bg-red-600/80'
        }`}>
        🔄 Clear All
      </button>
    </div>
  )
}
