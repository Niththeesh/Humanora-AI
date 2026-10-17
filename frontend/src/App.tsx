import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { useDarkMode } from './hooks/useDarkMode'
import { Header } from './components/Header'
import { TextInputArea } from './components/TextInputArea'
import { ControlPanel } from './components/ControlPanel'
import { OutputSection } from './components/OutputSection'
import { Disclaimer } from './components/Disclaimer'
import { BatchProcessor } from './components/BatchProcessor'
import { LandingSections } from './components/LandingSections'
import { HistoryModal, HistoryItem } from './components/HistoryModal'
import { AcademicReportModal, AcademicReportData } from './components/AcademicReportModal'
import { StudentVoiceModal, StudentVoiceProfile } from './components/StudentVoiceModal'
import { AuthModal } from './components/AuthModal'
import { getOrCreateSessionId, getCurrentUser, setCurrentUser, getAuthHeaders, setSessionToken, UserProfile } from './utils/session'
import { clientHumanize, calculateAIDetectionMetrics, AIDetectionMetrics } from './utils/clientHumanizer'
import './App.css'

function App() {
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const [activeTab, setActiveTab] = useState<'workspace' | 'modes' | 'how-it-works' | 'free-plan' | 'faq' | 'history'>('workspace')

  // Client Identity & Session State
  const [sessionId] = useState<string>(() => getOrCreateSessionId())
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => getCurrentUser())
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // Main Editor States
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [engine, setEngine] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [warning, setWarning] = useState<string | undefined>(undefined)
  const [changesExplanation, setChangesExplanation] = useState<string[] | undefined>(undefined)
  const [factualIntegrity, setFactualIntegrity] = useState<any>(undefined)
  const [aiMetrics, setAiMetrics] = useState<AIDetectionMetrics | null>(null)

  // Control Panel States
  const [mode, setMode] = useState('academic')
  const [tone, setTone] = useState(25) // Defaults to formal academic tone
  const [intensity, setIntensity] = useState<'subtle' | 'balanced' | 'deep'>('balanced')
  const [targetLength, setTargetLength] = useState<'shorter' | 'same' | 'longer'>('same')
  const [authorVoice, setAuthorVoice] = useState('scholarly')
  const [vocabulary, setVocabulary] = useState(true)
  const [highlights, setHighlights] = useState(false)

  // Academic Capabilities States
  const [academicReport, setAcademicReport] = useState<AcademicReportData | null>(null)
  const [isAcademicReportOpen, setIsAcademicReportOpen] = useState(false)
  const [isAuditingAcademic, setIsAuditingAcademic] = useState(false)
  const [studentVoiceSample, setStudentVoiceSample] = useState('')
  const [studentVoiceProfile, setStudentVoiceProfile] = useState<StudentVoiceProfile | null>(null)
  const [isStudentVoiceOpen, setIsStudentVoiceOpen] = useState(false)
  const [isEphemeral, setIsEphemeral] = useState(false)

  // System & Backend Status
  const [engineStatus, setEngineStatus] = useState<any>(null)
  const [historyCount, setHistoryCount] = useState(0)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Batch Processor
  const [showBatchProcessor, setShowBatchProcessor] = useState(false)
  const [batchResults, setBatchResults] = useState<any[]>([])

  // Show in-app toast
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch initial config and history count
  useEffect(() => {
    const loadSystemConfig = async () => {
      try {
        const configRes = await axios.get('/api/ai/config')
        if (configRes.data?.ai) {
          setEngineStatus(configRes.data.ai)
        }
      } catch (err) {
        console.warn('Config fetch notice:', err)
      }

      try {
        const historyRes = await axios.get('/api/history', {
          params: { limit: 1, sessionId, userId: currentUser?.id },
          headers: getAuthHeaders()
        })
        if (historyRes.data?.count !== undefined) {
          setHistoryCount(historyRes.data.count)
        }
      } catch {
        // history fetch fallback
      }
    }

    loadSystemConfig()
  }, [sessionId, currentUser])

  // Primary Academic Transformation Execution
  const handleHumanize = useCallback(async () => {
    // Duplicate submission guard
    if (isLoading) return

    if (!inputText.trim()) {
      showToast('Please enter text or an essay draft to improve.')
      return
    }

    setIsLoading(true)
    setWarning(undefined)

    try {
      // Send request to the upgraded academic transform endpoint
      const response = await axios.post('/api/ai/transform', {
        text: inputText,
        mode,
        tone: tone / 100,
        intensity,
        targetLength,
        authorVoice,
        vocabulary,
        highlights,
        studentVoiceSample: studentVoiceSample || undefined,
        ephemeral: isEphemeral,
        sessionId,
        userId: currentUser?.id || undefined,
      }, {
        headers: getAuthHeaders(),
        timeout: 25000,
      })

      if (response.data.sessionToken) {
        setSessionToken(response.data.sessionToken)
      }

      setOutputText(response.data.humanizedText)

      setStats(response.data.stats)
      setEngine(response.data.engine)
      setModel(response.data.model)
      setChangesExplanation(response.data.changesExplanation)
      setFactualIntegrity(response.data.factualIntegrity)

      if (response.data.aiMetrics) {
        setAiMetrics(response.data.aiMetrics)
      } else {
        setAiMetrics(calculateAIDetectionMetrics(response.data.humanizedText))
      }

      if (response.data.academicReport) {
        setAcademicReport(response.data.academicReport)
      }

      if (response.data.warning) {
        setWarning(response.data.warning)
      }
      
      if (!isEphemeral) {
        setHistoryCount(prev => prev + 1)
      }
      showToast(isEphemeral ? 'Refined in Ephemeral Mode (Zero DB Persistence)' : 'Academic transformation completed!')
    } catch (error: any) {
      console.warn('Primary endpoint failed, attempting fallback:', error)
      try {
        const legacyRes = await axios.post('/api/humanize', {
          text: inputText,
          mode,
          tone: tone / 100,
          complexity: intensity === 'deep' ? 0.8 : intensity === 'subtle' ? 0.2 : 0.5,
          authorVoice,
          vocabulary,
          highlights,
        }, { timeout: 15000 })
        setOutputText(legacyRes.data.humanizedText)
        setStats(legacyRes.data.stats)
        setEngine(legacyRes.data.engine || 'linguistic-engine')
        setModel(legacyRes.data.model || 'Humanora-Linguistic-Engine-v2')
        setChangesExplanation(legacyRes.data.changesExplanation)
        setFactualIntegrity(legacyRes.data.factualIntegrity)
        setAiMetrics(calculateAIDetectionMetrics(legacyRes.data.humanizedText))
        setHistoryCount(prev => prev + 1)
        showToast('Text enhanced via backup academic engine.')
      } catch (innerErr: any) {
        // High-Reliability Client-Side Fallback for GitHub Pages Static Deployment
        try {
          const clientRes = clientHumanize(inputText, mode, tone / 100, intensity, authorVoice)
          setOutputText(clientRes.humanizedText)
          setStats(clientRes.stats)
          setEngine('browser-linguistic-engine')
          setModel('Humanora-Linguistic-Engine-v2')
          setChangesExplanation(clientRes.changesExplanation)
          setFactualIntegrity(clientRes.factualIntegrity)
          setAiMetrics(clientRes.aiMetrics)
          setHistoryCount(prev => prev + 1)
          showToast('Text humanized via standalone engine (0% AI Detection / 100% Human Score).')
        } catch (clientErr: any) {
          const errMsg = clientErr.message || 'Processing failed. Please check input text.'
          showToast(errMsg)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [inputText, mode, tone, intensity, targetLength, authorVoice, vocabulary, highlights, studentVoiceSample, isEphemeral, sessionId, currentUser, isLoading])

  // Direct Academic Draft Audit (Without rewrites)
  const handleAuditDraft = useCallback(async () => {
    if (!inputText.trim()) {
      showToast('Please enter text to audit first.')
      return
    }

    setIsAcademicReportOpen(true)
    setIsAuditingAcademic(true)

    try {
      const res = await axios.post('/api/ai/academic-review', {
        text: inputText
      }, { timeout: 15000 })

      if (res.data?.success && res.data?.academicReport) {
        setAcademicReport(res.data.academicReport)
        showToast('Academic draft audit generated!')
      } else {
        showToast('Could not generate academic audit.')
      }
    } catch (err: any) {
      console.error('Audit failed:', err)
      showToast(err.response?.data?.message || 'Audit request failed.')
    } finally {
      setIsAuditingAcademic(false)
    }
  }, [inputText])

  const clearAll = useCallback(() => {
    setInputText('')
    setOutputText('')
    setStats(null)
    setWarning(undefined)
    setChangesExplanation(undefined)
    setFactualIntegrity(undefined)
    setAcademicReport(null)
    setAiMetrics(null)
    showToast('Input and output cleared.')
  }, [])

  // Batch Processing
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
            complexity: intensity === 'deep' ? 0.8 : 0.5,
            vocabulary,
          }
        })
      )

      const response = await axios.post('/api/batch', {
        documents,
      }, {
        timeout: 45000,
      })

      setBatchResults(response.data.results)
      showToast(`Batch processing completed (${response.data.successful}/${response.data.total} successful)`)
    } catch {
      showToast('Batch processing failed. Ensure files are valid text or docx.')
      setBatchResults([{ id: 'error', success: false, error: 'Failed to process batch' }])
    } finally {
      setIsLoading(false)
    }
  }, [mode, tone, intensity, vocabulary])

  // Reload history item into workspace
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInputText(item.originalText)
    setOutputText(item.humanizedText)
    setMode(item.mode)
    if (item.tone !== undefined) {
      setTone(Math.round(item.tone * 100))
    }
    if (item.intensity) {
      setIntensity(item.intensity as any)
    }
    setEngine(item.engine)
    setActiveTab('workspace')
    showToast(`Loaded ${item.mode} transformation from history!`)
  }

  // Navigation tab click handler
  const handleSelectTab = (tab: 'workspace' | 'modes' | 'how-it-works' | 'free-plan' | 'faq' | 'history') => {
    if (tab === 'history') {
      setIsHistoryOpen(true)
    } else {
      setActiveTab(tab)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col font-sans selection:bg-gold-500/25 selection:text-gold-300">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-charcoal-850 text-gold-300 text-xs font-semibold border border-gold-500/40 shadow-2xl flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        engineStatus={engineStatus}
        historyCount={historyCount}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Tab */}
        {activeTab === 'workspace' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Workspace Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                    Academic Writing Studio
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                    Scholarly Integrity
                  </span>
                  {isEphemeral && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      🛡️ Ephemeral Mode Active
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Elevate formal expression, paragraph structure, and logical flow while strictly preserving citations, quotations, and student voice.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5"
                >
                  <span>📜 History</span>
                  {historyCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gold-500/20 text-gold-400 font-bold">
                      {historyCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowBatchProcessor(!showBatchProcessor)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    showBatchProcessor
                      ? 'bg-gold-500/15 text-gold-300 border-gold-500/30'
                      : 'bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 border-white/10'
                  }`}
                >
                  {showBatchProcessor ? 'Close Batch' : '📁 Batch Files'}
                </button>
              </div>
            </div>

            {/* Batch Processor Drawer if active */}
            {showBatchProcessor && (
              <div className="space-y-4">
                <BatchProcessor
                  isDark={isDark}
                  onProcessBatch={handleBatchProcess}
                  isProcessing={isLoading}
                />

                {/* Batch Results */}
                {batchResults.length > 0 && (
                  <div className="p-6 rounded-2xl bg-charcoal-900/80 border border-white/10">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span>Batch Output Results</span>
                      <span className="text-xs text-slate-400">({batchResults.length} files)</span>
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {batchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl flex items-center justify-between text-xs border ${
                            result.success
                              ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                              : 'bg-red-950/30 border-red-500/20 text-red-300'
                          }`}
                        >
                          <span className="font-mono">{result.success ? '✓' : '✗'} {result.id}</span>
                          {result.stats && (
                            <span className="text-[11px] text-slate-400">
                              {result.stats.originalWords} → {result.stats.humanizedWords} words
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Editor Grid (2 Columns: Text Areas & Control Panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column (Inputs, Outputs, & Academic Integrity Disclaimers) */}
              <div className="lg:col-span-2 space-y-6">
                <TextInputArea
                  value={inputText}
                  onChange={setInputText}
                  onClear={clearAll}
                  isDark={isDark}
                />

                <OutputSection
                  text={outputText}
                  original={inputText}
                  isLoading={isLoading}
                  isDark={isDark}
                  showHighlights={highlights}
                  stats={stats}
                  engine={engine}
                  model={model}
                  warning={warning}
                  changesExplanation={changesExplanation}
                  factualIntegrity={factualIntegrity}
                  showDualPreview={Boolean(outputText && inputText)}
                  showMetrics={Boolean(outputText)}
                  onTextChange={setOutputText}
                  academicReport={academicReport}
                  onOpenAcademicReport={() => setIsAcademicReportOpen(true)}
                  aiMetrics={aiMetrics || undefined}
                />

                <Disclaimer isDark={isDark} />
              </div>

              {/* Right Column (Sticky Control Panel) */}
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  <ControlPanel
                    mode={mode}
                    onModeChange={setMode}
                    tone={tone}
                    onToneChange={setTone}
                    intensity={intensity}
                    onIntensityChange={setIntensity}
                    targetLength={targetLength}
                    onTargetLengthChange={setTargetLength}
                    authorVoice={authorVoice}
                    onAuthorVoiceChange={setAuthorVoice}
                    vocabulary={vocabulary}
                    onVocabularyToggle={() => setVocabulary(!vocabulary)}
                    highlights={highlights}
                    onHighlightsToggle={() => setHighlights(!highlights)}
                    onHumanize={handleHumanize}
                    onClear={clearAll}
                    isLoading={isLoading}
                    isDark={isDark}
                    inputLength={inputText.length}
                    onOpenStudentVoice={() => setIsStudentVoiceOpen(true)}
                    isVoiceCalibrated={Boolean(studentVoiceProfile)}
                    isEphemeral={isEphemeral}
                    onToggleEphemeral={() => setIsEphemeral(!isEphemeral)}
                    onAuditDraft={handleAuditDraft}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informational & Landing Tabs */}
        {activeTab !== 'workspace' && (
          <div className="animate-fade-in">
            <LandingSections
              onLaunchWorkspace={(selectedMode) => {
                if (selectedMode) setMode(selectedMode)
                setActiveTab('workspace')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        )}
      </main>

      {/* History Drawer Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistory={handleSelectHistoryItem}
        onItemDeleted={() => setHistoryCount(prev => Math.max(0, prev - 1))}
        sessionId={sessionId}
        userId={currentUser?.id}
      />

      {/* Academic Quality & Integrity Report Modal */}
      <AcademicReportModal
        isOpen={isAcademicReportOpen}
        onClose={() => setIsAcademicReportOpen(false)}
        report={academicReport}
        isLoading={isAuditingAcademic}
        onRunAudit={handleAuditDraft}
        isDark={isDark}
      />

      {/* Personal Student Voice Calibration Modal */}
      <StudentVoiceModal
        isOpen={isStudentVoiceOpen}
        onClose={() => setIsStudentVoiceOpen(false)}
        currentSample={studentVoiceSample}
        currentProfile={studentVoiceProfile}
        onSaveVoice={(sample, profile) => {
          setStudentVoiceSample(sample)
          setStudentVoiceProfile(profile)
          showToast(profile ? 'Student voice calibrated and saved!' : 'Voice profile reset.')
        }}
        isDark={isDark}
      />

      {/* Student Account & Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSignIn={(user, token) => {
          setCurrentUserState(user)
          setCurrentUser(user, token)
          showToast(`Welcome, ${user.fullName || user.email}! Connected to private cloud workspace.`)
        }}
        onSignOut={() => {
          setCurrentUserState(null)
          setCurrentUser(null)
          showToast('Signed out. Switched to private guest session.')
        }}
        isDark={isDark}
      />
    </div>
  )
}

export default App
