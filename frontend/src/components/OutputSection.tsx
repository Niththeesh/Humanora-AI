import React, { useState, useMemo } from 'react'
import { DualPreview } from './DualPreview'
import { MetricsDisplay } from './MetricsDisplay'
import { AcademicReportData } from './AcademicReportModal'
import { AIDetectionMeter } from './AIDetectionMeter'
import { calculateAIDetectionMetrics, AIDetectionMetrics } from '../utils/clientHumanizer'

export interface FactualIntegrityReport {
  verified: boolean
  missingEntities: string[]
  preservedEntities: string[]
  warnings: string[]
}

interface OutputSectionProps {
  text: string
  original?: string
  isLoading: boolean
  isDark: boolean
  showHighlights: boolean
  stats?: any
  engine?: string
  model?: string
  warning?: string
  changesExplanation?: string[]
  factualIntegrity?: FactualIntegrityReport
  showMetrics?: boolean
  showDualPreview?: boolean
  onTextChange?: (newText: string) => void
  aiMetrics?: AIDetectionMetrics
  isFallback?: boolean
  // Academic Capabilities
  academicReport?: AcademicReportData | null
  onOpenAcademicReport?: () => void
}

export const OutputSection: React.FC<OutputSectionProps> = ({ 
  text, 
  original = '',
  isLoading, 
  isDark, 
  showHighlights: _showHighlights,
  stats,
  engine,
  model,
  warning,
  changesExplanation,
  factualIntegrity,
  onTextChange,
  aiMetrics,
  isFallback,
  academicReport,
  onOpenAcademicReport,
}) => {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'text' | 'dual' | 'metrics'>('text')
  const [isEditing, setIsEditing] = useState(false)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base')
  const [showExplanationCard, setShowExplanationCard] = useState(true)

  // Compute live real-time AI detection metrics dynamically whenever text updates
  const computedMetrics = useMemo(() => calculateAIDetectionMetrics(text), [text])
  const effectiveMetrics = aiMetrics || computedMetrics

  const handleCopy = () => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsText = () => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
    element.setAttribute('download', 'humanora-academic-output.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadAsMarkdown = () => {
    const mdContent = `# Academic Writing Improvement — Humanora AI\n\n${text}\n\n---\n*Original words: ${stats?.originalWords || 0} | Enhanced words: ${stats?.humanizedWords || 0} | Academic Quality Index: ${academicReport?.overallScore || 'Audited'}/100*`
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/markdown;charset=utf-8,${encodeURIComponent(mdContent)}`)
    element.setAttribute('download', 'humanora-academic-output.md')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadAsDocx = () => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${btoa(unescape(encodeURIComponent(text)))}`)
    element.setAttribute('download', 'humanora-academic-output.docx')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const fontClasses = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base'
  }

  const currentWords = text.split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className={`flex flex-col gap-4 p-6 rounded-2xl border transition-all ${
      isDark
        ? 'bg-charcoal-900/70 border-white/10 shadow-xl'
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Top Header & Status */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <span>Enhanced Output</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/30">
              Academic Draft
            </span>
          </label>

          {engine && (
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded border flex items-center gap-1.5 ${
              engine === 'gemini' && !isFallback
                ? 'bg-gold-500/10 text-gold-300 border-gold-500/20' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${engine === 'gemini' && !isFallback ? 'bg-gold-400' : 'bg-amber-400'}`} />
              <span>
                {engine === 'gemini' && !isFallback 
                  ? `Gemini Cloud (${model || 'Active'})` 
                  : `Offline Linguistic Engine (Fallback: ${model || 'Local'})`}
              </span>
            </span>
          )}

          {factualIntegrity && (
            <span className={`text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 border ${
              factualIntegrity.verified
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
            }`}>
              <span>{factualIntegrity.verified ? '✓' : '⚠'}</span>
              <span>{factualIntegrity.verified ? 'Citations & Meaning Intact' : 'Entity Notice'}</span>
            </span>
          )}
        </div>

        {/* View Mode Switcher & Academic Report Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAcademicReport && (
            <button
              type="button"
              onClick={onOpenAcademicReport}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-gold-500/15 hover:bg-gold-500/25 text-gold-300 border border-gold-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>📊 Academic Quality Report</span>
              {academicReport && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gold-500/25 text-gold-300 font-extrabold">
                  {academicReport.overallScore}/100
                </span>
              )}
            </button>
          )}

          {text && (
            <div className="flex items-center gap-1 bg-charcoal-950 p-1 rounded-xl border border-white/5 text-xs">
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'text'
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Refined Text
              </button>
              <button
                onClick={() => setViewMode('dual')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'dual'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Side-by-Side Diff
              </button>
              <button
                onClick={() => setViewMode('metrics')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'metrics'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Writing Metrics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fallback Disclosure Notice */}
      {isFallback && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-sm">
          <span className="text-base text-amber-400 mt-[-2px]">⚠️</span>
          <div>
            <span className="font-bold block text-amber-300">
              Transparent Disclosure: Local Heuristic Fallback Used
            </span>
            <span className="text-amber-200/90 leading-relaxed block mt-0.5">
              Cloud AI generation was unavailable (quota limit or connection issue). Text was processed using the local rule-based engine. Rule-based synonym de-cluttering and cadence modulation were applied, but full semantic restructuring requires active cloud connectivity.
            </span>
          </div>
        </div>
      )}

      {/* Warning Notice if any */}
      {warning && !isFallback && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <span>⚠</span>
          <span>{warning}</span>
        </div>
      )}

      {/* Changes Explanation Drawer */}
      {changesExplanation && changesExplanation.length > 0 && showExplanationCard && (
        <div className="p-4 rounded-xl bg-charcoal-950/90 border border-gold-500/20 text-xs">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/5">
            <span className="font-bold text-gold-300 flex items-center gap-1.5">
              <span>✦</span>
              <span>Academic Refinement & Clarity Enhancements Applied</span>
            </span>
            <button
              type="button"
              onClick={() => setShowExplanationCard(false)}
              className="text-slate-500 hover:text-slate-300 text-[10px]"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-1 text-slate-300 pl-1">
            {changesExplanation.map((exp, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-gold-400 font-bold">•</span>
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Body */}
      {isLoading ? (
        <div className="h-72 rounded-xl bg-charcoal-950/60 border border-white/5 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">
            Applying academic clarity & natural scholarly rewrite...
          </p>
          <p className="text-xs text-slate-500">
            Auditing citations, empirical figures, quotes, and meaning fidelity
          </p>
        </div>
      ) : text ? (
        <>
          {/* 0% AI Detection / 100% Human Score UI Meter */}
          <AIDetectionMeter metrics={effectiveMetrics} isDark={isDark} />

          {viewMode === 'text' && (
            <div className="relative">
              {/* Font Sizer & Inline Edit Toggle */}
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 bg-charcoal-850/90 p-1 rounded-lg border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    isEditing ? 'bg-gold-500 text-charcoal-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Edit text manually"
                >
                  {isEditing ? 'Save Edits' : '✎ Edit Manually'}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setFontSize(fontSize === 'lg' ? 'base' : fontSize === 'base' ? 'sm' : 'lg')}
                  className="px-1.5 py-0.5 text-slate-400 hover:text-white"
                  title="Toggle font size"
                >
                  A±
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={text}
                    onChange={(e) => onTextChange && onTextChange(e.target.value)}
                    className={`w-full h-72 p-4 pt-12 rounded-xl border font-mono ${fontClasses[fontSize]} leading-relaxed resize-none bg-charcoal-950/90 text-slate-100 border-gold-500/40 focus:outline-none`}
                    placeholder="Type or edit your text here..."
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
                    <span>Inline Editing Active — Live changes update exports</span>
                    <span>{currentWords} words | {text.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className={`min-h-[18rem] p-5 pt-12 rounded-xl border bg-charcoal-950/80 border-white/10 text-slate-100 font-mono ${fontClasses[fontSize]} leading-relaxed whitespace-pre-wrap select-text`}>
                  {text}
                </div>
              )}
            </div>
          )}

          {viewMode === 'dual' && (
            <DualPreview
              original={original}
              humanized={text}
              isDark={isDark}
            />
          )}

          {viewMode === 'metrics' && (
            <MetricsDisplay
              original={original}
              humanized={text}
              isDark={isDark}
            />
          )}

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-charcoal-950/80 border border-white/5 text-xs text-slate-300">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Words</span>
                <span className="font-semibold text-slate-200">
                  {stats.originalWords} → {stats.humanizedWords || currentWords}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Characters</span>
                <span className="font-semibold text-slate-200">
                  {stats.originalLength} → {text.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Processing Time</span>
                <span className="font-semibold text-slate-200">
                  {stats.processingTimeMs ? `${(stats.processingTimeMs / 1000).toFixed(2)}s` : 'Fast'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Citation Fidelity</span>
                <span className="font-semibold text-emerald-400">
                  {academicReport?.citationAudit?.allCitationsPreserved ? '100% Preserved' : 'Audited'}
                </span>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
              >
                <span>{copied ? '✓ Copied!' : '📋 Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 border border-white/10 transition-all"
              >
                {isEditing ? '✓ Done Editing' : '✎ Edit'}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Export:</span>
              <button
                type="button"
                onClick={downloadAsText}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 border border-white/5 transition-all"
              >
                .TXT
              </button>
              <button
                type="button"
                onClick={downloadAsMarkdown}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 border border-white/5 transition-all"
              >
                .MD
              </button>
              <button
                type="button"
                onClick={downloadAsDocx}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 border border-white/5 transition-all"
              >
                .DOCX
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="h-72 rounded-xl bg-charcoal-950/40 border border-white/5 flex flex-col items-center justify-center gap-2 text-center p-6">
          <span className="text-2xl text-slate-600">🎓</span>
          <p className="text-sm font-semibold text-slate-400">
            Your refined academic paper will appear here
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            Configure academic clarity, author voice, and privacy settings on the right panel, then click "Improve Academic Writing".
          </p>
        </div>
      )}
    </div>
  )
}
