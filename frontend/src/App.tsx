import { useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { useDarkMode } from './hooks/useDarkMode'
import { Header } from './components/Header'
import { TextInputArea } from './components/TextInputArea'
import { ControlPanel } from './components/ControlPanel'
import { OutputSection } from './components/OutputSection'
import { Disclaimer } from './components/Disclaimer'
import { BatchProcessor } from './components/BatchProcessor'
import './App.css'

function App() {
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  
  // Feature Toggle States
  const [showDualPreview, setShowDualPreview] = useState(true)
  const [showMetrics, setShowMetrics] = useState(true)
  const [showBatchProcessor, setShowBatchProcessor] = useState(false)
  const [batchResults, setBatchResults] = useState<any[]>([])

  // Control Panel States
  const [mode, setMode] = useState('standard')
  const [tone, setTone] = useState(50)
  const [complexity, setComplexity] = useState(50)
  const [vocabulary, setVocabulary] = useState(false)
  const [highlights, setHighlights] = useState(false)

  // Memoize features to prevent unnecessary re-renders
  const features = useMemo(() => [
    { icon: '🎯', title: 'Smart Modes', desc: '4 specialized rewriting modes' },
    { icon: '🎨', title: 'Tone Control', desc: 'Formal to casual adjustments' },
    { icon: '📚', title: 'Vocabulary', desc: 'Enhanced word selection' },
    { icon: '⚡', title: 'Lightning Fast', desc: 'Instant processing' },
  ], [])

  // Optimize humanize function with useCallback
  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      // Cache buster to avoid stale requests
      const response = await axios.post('/api/humanize', {
        text: inputText,
        mode,
        tone: tone / 100,
        complexity: complexity / 100,
        vocabulary,
        highlights,
      }, {
        timeout: 10000, // 10 second timeout
      })
      setOutputText(response.data.humanizedText)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error humanizing text:', error)
      setOutputText('Error processing text. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [inputText, mode, tone, complexity, vocabulary, highlights])

  const clearAll = useCallback(() => {
    setInputText('')
    setOutputText('')
    setStats(null)
  }, [])

  // Batch processing handler
  const handleBatchProcess = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsLoading(true)
    try {
      const documents = await Promise.all(
        files.map(async (file) => {
          const text = await file.text()
          return {
            id: file.name,
            text,
            mode,
            tone: tone / 100,
            complexity: complexity / 100,
            vocabulary,
          }
        })
      )

      const response = await axios.post('/api/batch', {
        documents,
      }, {
        timeout: 30000, // 30 second timeout for batch
      })

      setBatchResults(response.data.results)
    } catch (error) {
      console.error('Error processing batch:', error)
      setBatchResults([{ id: 'error', success: false, error: 'Failed to process batch' }])
    } finally {
      setIsLoading(false)
    }
  }, [mode, tone, complexity, vocabulary])

  return (
    <div className={`min-h-screen transition-dark ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
    }`}>
      <Header isDark={isDark} onToggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TextInputArea 
              value={inputText} 
              onChange={setInputText} 
              isDark={isDark}
            />

            <OutputSection 
              text={outputText}
              original={inputText}
              isLoading={isLoading} 
              isDark={isDark}
              showHighlights={highlights}
              stats={stats}
              showDualPreview={showDualPreview && outputText}
              showMetrics={showMetrics && outputText}
            />

            <Disclaimer isDark={isDark} />

            {/* Feature Toggles */}
            <div className={`flex flex-wrap gap-2 p-4 rounded-2xl ${
              isDark
                ? 'bg-gray-800/60 border border-gray-700/50'
                : 'bg-white/60 border border-gray-100/50'
            }`}
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              <button
                onClick={() => setShowDualPreview(!showDualPreview)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  showDualPreview
                    ? isDark
                      ? 'bg-green-600/80 text-white'
                      : 'bg-green-500/80 text-white'
                    : isDark
                      ? 'bg-gray-700/50 text-gray-400'
                      : 'bg-gray-200/50 text-gray-600'
                }`}>
                {showDualPreview ? '✓' : '○'} Dual Preview
              </button>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  showMetrics
                    ? isDark
                      ? 'bg-purple-600/80 text-white'
                      : 'bg-purple-500/80 text-white'
                    : isDark
                      ? 'bg-gray-700/50 text-gray-400'
                      : 'bg-gray-200/50 text-gray-600'
                }`}>
                {showMetrics ? '✓' : '○'} Metrics
              </button>
              <button
                onClick={() => setShowBatchProcessor(!showBatchProcessor)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  showBatchProcessor
                    ? isDark
                      ? 'bg-blue-600/80 text-white'
                      : 'bg-blue-500/80 text-white'
                    : isDark
                      ? 'bg-gray-700/50 text-gray-400'
                      : 'bg-gray-200/50 text-gray-600'
                }`}>
                {showBatchProcessor ? '✓' : '○'} Batch Process
              </button>
            </div>

            {/* Batch Processor */}
            {showBatchProcessor && (
              <BatchProcessor
                isDark={isDark}
                onProcessBatch={handleBatchProcess}
                isProcessing={isLoading}
              />
            )}

            {/* Batch Results Display */}
            {batchResults.length > 0 && (
              <div className={`p-6 rounded-2xl ${
                isDark
                  ? 'bg-gray-800/60 border border-gray-700/50'
                  : 'bg-white/60 border border-gray-100/50'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  📊 Batch Processing Results
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        result.success
                          ? isDark
                            ? 'bg-green-900/30 text-green-300'
                            : 'bg-green-100/50 text-green-800'
                          : isDark
                            ? 'bg-red-900/30 text-red-300'
                            : 'bg-red-100/50 text-red-800'
                      }`}>
                      <span className="text-sm font-medium">
                        {result.success ? '✓' : '✗'} {result.id}
                      </span>
                      {result.stats && (
                        <span className="text-xs opacity-75">
                          {result.stats.originalWords}→{result.stats.humanizedWords} words
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Control Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <ControlPanel
                mode={mode}
                onModeChange={setMode}
                tone={tone}
                onToneChange={setTone}
                complexity={complexity}
                onComplexityChange={setComplexity}
                vocabulary={vocabulary}
                onVocabularyToggle={() => setVocabulary(!vocabulary)}
                highlights={highlights}
                onHighlightsToggle={() => setHighlights(!highlights)}
                onHumanize={handleHumanize}
                onClear={clearAll}
                isLoading={isLoading}
                isDark={isDark}
                inputLength={inputText.length}
              />
            </div>
          </div>
        </div>

        {/* Features Grid - Lazy loaded */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl transition-all ${
                isDark
                  ? 'bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60'
                  : 'bg-white/40 border border-gray-200/50 hover:bg-white/60'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
              <p className="text-2xl mb-2">{feature.icon}</p>
              <h3 className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {feature.title}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            ✨ Professional Quality Content Enhancement
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
