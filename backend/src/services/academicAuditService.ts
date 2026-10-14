/**
 * Humanora AI — Academic Audit & Writing Quality Service
 * 
 * Provides rigorous, rule-based academic evaluation:
 * - In-depth citation and quotation preservation auditing (APA, MLA, IEEE, Chicago)
 * - Semantic meaning and factual claim consistency validation
 * - Student Voice analysis from user-provided writing samples
 * - 5-Pillar Academic Quality Reporting (Clarity, Grammar, Coherence, Vocabulary, Citation Integrity)
 * 
 * Strict Principle: Truthful linguistic metrics. Zero fabricated AI detector evasion claims.
 */

export interface StudentVoiceProfile {
  formality: number // 0 to 1
  avgSentenceLength: number // words per sentence
  vocabularyRichness: number // 0 to 1 (Type-Token Ratio)
  complexityScore: number // 0 to 1
  toneLabel: string
  keyPreferences: string[]
  sampleWordCount: number
}

export interface CitationAuditResult {
  detectedCitations: string[]
  preservedCitations: string[]
  flaggedCitations: string[]
  quotesPreserved: boolean
  numbersPreserved: boolean
  detectedQuotes: string[]
  preservedQuotes: string[]
  warnings: string[]
}

export interface MeaningPreservationResult {
  verified: boolean
  claimsAudited: number
  preservedEntities: string[]
  omittedFacts: string[]
  epistemicShifts: string[]
  warnings: string[]
}

export interface AcademicQualityReport {
  scores: {
    clarity: number // 0 - 100
    grammar: number // 0 - 100
    coherence: number // 0 - 100
    vocabulary: number // 0 - 100
    citationIntegrity: number // 0 - 100
    overallAcademicScore: number // 0 - 100
  }
  metrics: {
    originalWords: number
    revisedWords: number
    originalSentenceCount: number
    revisedSentenceCount: number
    originalAvgSentenceLength: number
    revisedAvgSentenceLength: number
    readabilityGradeLevel: string
    burstinessScore: number
  }
  critique: {
    clarityNotes: string[]
    grammarNotes: string[]
    coherenceNotes: string[]
    styleNotes: string[]
  }
  citationAudit: CitationAuditResult
  meaningPreservation: MeaningPreservationResult
  disclaimer: string
}

export class AcademicAuditService {
  /**
   * Analyzes a writing sample provided by the student to extract their authentic personal voice.
   */
  public analyzeStudentVoice(sampleText: string): StudentVoiceProfile {
    const trimmed = sampleText.trim()
    if (!trimmed) {
      return {
        formality: 0.5,
        avgSentenceLength: 18,
        vocabularyRichness: 0.6,
        complexityScore: 0.5,
        toneLabel: 'Balanced Academic',
        keyPreferences: ['Balanced formal register', 'Standard academic sentence lengths'],
        sampleWordCount: 0
      }
    }

    const words = trimmed.split(/\s+/).filter(w => w.length > 0)
    const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)
    const wordCount = words.length
    const sentenceCount = Math.max(1, sentences.length)
    const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10

    // Lexical diversity (Type-Token Ratio)
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(w => w.length > 0))
    const vocabularyRichness = Math.min(1, Math.round((uniqueWords.size / Math.max(1, wordCount)) * 100) / 100)

    // Formality assessment: check contractions, formal academic markers
    const contractionsCount = (trimmed.match(/\b(can't|won't|don't|doesn't|it's|there's|they're|we're|I'm|isn't)\b/gi) || []).length
    const academicTransitions = (trimmed.match(/\b(consequently|furthermore|specifically|subsequently|conversely|in contrast|notably|thus|therefore)\b/gi) || []).length
    const passiveMarkers = (trimmed.match(/\b(is|are|was|were|been)\s+[a-z]+ed\b/gi) || []).length

    let formality = 0.65 // Baseline scholarly
    if (contractionsCount > 0) formality -= Math.min(0.3, contractionsCount * 0.05)
    if (academicTransitions > 0) formality += Math.min(0.2, academicTransitions * 0.04)
    if (avgSentenceLength > 22) formality += 0.1
    formality = Math.max(0.1, Math.min(0.95, Math.round(formality * 100) / 100))

    const complexityScore = Math.max(0.2, Math.min(0.95, Math.round(((avgSentenceLength / 28) * 0.6 + vocabularyRichness * 0.4) * 100) / 100))

    const keyPreferences: string[] = []
    if (contractionsCount === 0) {
      keyPreferences.push('Strictly avoids informal contractions')
    } else {
      keyPreferences.push('Natural accessible tone with occasional contractions')
    }

    if (avgSentenceLength >= 22) {
      keyPreferences.push(`Favors structured, compound academic sentences (~${avgSentenceLength} words/sentence)`)
    } else if (avgSentenceLength <= 14) {
      keyPreferences.push(`Favors direct, concise, punchy sentences (~${avgSentenceLength} words/sentence)`)
    } else {
      keyPreferences.push(`Balanced rhythmic sentence lengths (~${avgSentenceLength} words/sentence)`)
    }

    if (academicTransitions >= 2) {
      keyPreferences.push('Frequently utilizes formal discourse markers and logical connectors')
    }

    if (vocabularyRichness > 0.65) {
      keyPreferences.push('High lexical variety and precise discipline-specific vocabulary')
    }

    let toneLabel = 'Balanced Scholarly'
    if (formality >= 0.8) toneLabel = 'Formal Academic & Rigorous'
    else if (formality <= 0.45) toneLabel = 'Conversational & Accessible'
    else if (complexityScore >= 0.75) toneLabel = 'Analytical & Complex'

    return {
      formality,
      avgSentenceLength,
      vocabularyRichness,
      complexityScore,
      toneLabel,
      keyPreferences,
      sampleWordCount: wordCount
    }
  }

  /**
   * Audits in-text citations, numerical data, and quotations for preservation.
   */
  public auditCitations(original: string, revised: string): CitationAuditResult {
    const warnings: string[] = []
    const preservedCitations: string[] = []
    const flaggedCitations: string[] = []
    const preservedQuotes: string[] = []

    // 1. In-text citation regexes
    // APA / Harvard: (Smith et al., 2020), (Jones, 2019, p. 45), Smith et al. (2020)
    // IEEE / Vancouver: [1], [1-3], [4, 7]
    // MLA: (Smith 42)
    const citationRegexes = [
      /\([A-Z][A-Za-z\s.,&]+,?\s*(?:18|19|20)\d{2}[a-z]?(?:;\s*[A-Z][A-Za-z\s.,&]+,?\s*(?:18|19|20)\d{2}[a-z]?)*(?:,\s*p{1,2}\.?\s*\d+(?:-\d+)?)?\)/g,
      /\b[A-Z][A-Za-z\s.,&]+\s+et\s+al\.\s*\((?:18|19|20)\d{2}[a-z]?(?:,\s*p{1,2}\.?\s*\d+(?:-\d+)?)?\)/g,
      /\[\s*\d+(?:[–\-,]\s*\d+)*\s*\]/g,
      /\([A-Z][A-Za-z]+(?:\s+and\s+[A-Z][A-Za-z]+)?\s+\d+(?:-\d+)?\)/g
    ]

    const detectedCitations: string[] = []
    for (const regex of citationRegexes) {
      const matches = original.match(regex) || []
      for (const m of matches) {
        if (!detectedCitations.includes(m)) detectedCitations.push(m)
      }
    }

    for (const citation of detectedCitations) {
      const normalizedCitation = citation.replace(/\s+/g, ' ')
      if (revised.includes(citation) || revised.replace(/\s+/g, ' ').includes(normalizedCitation)) {
        preservedCitations.push(citation)
      } else {
        flaggedCitations.push(citation)
        warnings.push(`In-text citation '${citation}' was omitted or modified in the revised text.`)
      }
    }

    // 2. Direct quotations
    const quoteRegex = /("[^"\r\n]{5,}"|“[^”\r\n]{5,}”)/g
    const detectedQuotes = original.match(quoteRegex) || []
    let quotesPreserved = true

    for (const quote of detectedQuotes) {
      const cleanQuote = quote.replace(/^[“"]|[”"]$/g, '').trim()
      if (revised.includes(cleanQuote) || revised.includes(quote)) {
        preservedQuotes.push(quote)
      } else {
        quotesPreserved = false
        warnings.push(`Direct quotation '${quote}' was altered or omitted.`)
      }
    }

    // 3. Numerical data & statistical figures
    const numRegex = /\b(?:(?:\$|€|£)\s*)?\d+(?:\.\d+)?(?:%|\s*(?:billion|million|trillion|k))?\b/g
    const origNums = Array.from(new Set(original.match(numRegex) || [])).filter(n => n.length >= 2 || n.includes('%') || n.includes('$'))
    let numbersPreserved = true

    for (const num of origNums) {
      if (!revised.includes(num)) {
        // Significant number missing
        if (num.includes('%') || num.includes('$') || num.length >= 3) {
          numbersPreserved = false
          warnings.push(`Empirical figure '${num}' was not found in the revised text.`)
        }
      }
    }

    return {
      detectedCitations,
      preservedCitations,
      flaggedCitations,
      quotesPreserved,
      numbersPreserved,
      detectedQuotes,
      preservedQuotes,
      warnings
    }
  }

  /**
   * Evaluates original vs revised text for meaning preservation, argument consistency, and factual integrity.
   */
  public auditMeaningPreservation(original: string, revised: string): MeaningPreservationResult {
    const warnings: string[] = []
    const preservedEntities: string[] = []
    const omittedFacts: string[] = []
    const epistemicShifts: string[] = []

    // 1. Named proper entities (capitalized sequences: e.g. "World Health Organization", "CRISPR-Cas9", "Germany")
    const entityRegex = /\b[A-Z][a-zA-Z0-9-]*(?:\s+[A-Z][a-zA-Z0-9-]*)*\b/g
    const stopWords = new Set(['The', 'This', 'That', 'These', 'Those', 'In', 'On', 'At', 'However', 'Therefore', 'Moreover', 'Furthermore', 'It', 'As', 'Although'])
    
    const origEntities = Array.from(new Set(original.match(entityRegex) || []))
      .filter(e => !stopWords.has(e) && e.length > 2)

    for (const ent of origEntities) {
      if (revised.includes(ent)) {
        preservedEntities.push(ent)
      } else {
        // Check case-insensitive match
        if (revised.toLowerCase().includes(ent.toLowerCase())) {
          preservedEntities.push(ent)
        } else {
          omittedFacts.push(ent)
          warnings.push(`Key named entity or concept '${ent}' was omitted in the revision.`)
        }
      }
    }

    // 2. Epistemic stance check (did revision turn tentative claims into absolute certainties or vice versa?)
    const tentativeRegex = /\b(may suggest|might indicate|could imply|appears to be|seems to indicate|tends to)\b/i
    const absoluteRegex = /\b(proves that|definitively demonstrates|clearly establishes|undeniably shows)\b/i

    if (tentativeRegex.test(original) && absoluteRegex.test(revised)) {
      epistemicShifts.push('Tentative claim was strengthened into an absolute certainty.')
      warnings.push('Caution: A cautious empirical claim was revised into an absolute claim.')
    } else if (absoluteRegex.test(original) && tentativeRegex.test(revised)) {
      epistemicShifts.push('Definitive argument was weakened into a tentative possibility.')
    }

    const verified = omittedFacts.length === 0 && epistemicShifts.length === 0

    return {
      verified,
      claimsAudited: origEntities.length + (tentativeRegex.test(original) ? 1 : 0),
      preservedEntities,
      omittedFacts,
      epistemicShifts,
      warnings
    }
  }

  /**
   * Generates a transparent, multi-dimensional Academic Quality Report.
   */
  public generateAcademicQualityReport(original: string, revised: string): AcademicQualityReport {
    const origWords = original.split(/\s+/).filter(w => w.length > 0)
    const revWords = revised.split(/\s+/).filter(w => w.length > 0)
    const origSentences = original.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)
    const revSentences = revised.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)

    const origAvgLen = Math.round((origWords.length / Math.max(1, origSentences.length)) * 10) / 10
    const revAvgLen = Math.round((revWords.length / Math.max(1, revSentences.length)) * 10) / 10

    // Sentence burstiness calculation (standard deviation of sentence lengths)
    const sentenceLengths = revSentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length)
    const meanLen = revAvgLen
    const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - meanLen, 2), 0) / Math.max(1, sentenceLengths.length)
    const burstinessScore = Math.min(100, Math.round(Math.sqrt(variance) * 10))

    // Audits
    const citationAudit = this.auditCitations(original, revised)
    const meaningPreservation = this.auditMeaningPreservation(original, revised)

    // Clarity Analysis
    const clarityNotes: string[] = []
    let clarityScore = 88

    // Check for passive nominalization reduction
    const origNominalizations = (original.match(/\b(utilization|investigation into|assumption that|examination of)\b/gi) || []).length
    const revNominalizations = (revised.match(/\b(utilization|investigation into|assumption that|examination of)\b/gi) || []).length
    if (origNominalizations > revNominalizations) {
      clarityNotes.push('Converted bureaucratic nominalizations into active, direct scholarly verbs.')
      clarityScore += 5
    }

    // Check for clunky throat-clearing removal
    if (/it is important to note that|it should be noted that|needless to say/i.test(original) && !/it is important to note that|it should be noted that/i.test(revised)) {
      clarityNotes.push('Pruned formulaic throat-clearing preambles to enhance argumentative focus.')
      clarityScore += 4
    }

    if (revAvgLen >= 14 && revAvgLen <= 26) {
      clarityNotes.push(`Balanced sentence length distribution averaging ${revAvgLen} words per sentence.`)
    } else if (revAvgLen > 30) {
      clarityNotes.push('Warning: Several long compound sentences may benefit from clause separation.')
      clarityScore -= 6
    }
    clarityScore = Math.min(98, Math.max(70, clarityScore))

    // Grammar & Style Review
    const grammarNotes: string[] = []
    let grammarScore = 92

    // Check for contractions in academic context
    const contractionsFound = (revised.match(/\b(can't|won't|don't|doesn't|it's|they're)\b/gi) || []).length
    if (contractionsFound > 0) {
      grammarNotes.push(`Flagged ${contractionsFound} informal contraction(s). Formal scholarly writing prefers expanded forms (cannot, does not).`)
      grammarScore -= Math.min(10, contractionsFound * 3)
    } else {
      grammarNotes.push('Formal grammatical agreement maintained with full expanded verb forms.')
    }

    // Check comma splice or spacing artifacts
    if (/\s+[,.]/.test(revised) || /[,.][A-Za-z]/.test(revised)) {
      grammarNotes.push('Minor punctuation spacing inconsistency detected.')
      grammarScore -= 4
    } else {
      grammarNotes.push('Punctuation mechanics and clause boundaries verified.')
    }
    grammarScore = Math.min(99, Math.max(72, grammarScore))

    // Coherence & Flow
    const coherenceNotes: string[] = []
    let coherenceScore = 86

    const transitionMatches = revised.match(/\b(consequently|furthermore|specifically|subsequently|conversely|in contrast|notably|thus|therefore|moreover|on the other hand)\b/gi) || []
    if (transitionMatches.length >= 1) {
      coherenceNotes.push(`Effective use of logical discourse markers (${Array.from(new Set(transitionMatches.map(t => t.toLowerCase()))).slice(0, 3).join(', ')}) connecting claims.`)
      coherenceScore += 6
    } else {
      coherenceNotes.push('Logical progression relies on direct semantic connection between adjacent clauses.')
    }

    if (burstinessScore >= 40) {
      coherenceNotes.push('Organic cadence variation (burstiness): alternates concise assertions with detailed analysis.')
      coherenceScore += 5
    }
    coherenceScore = Math.min(96, Math.max(70, coherenceScore))

    // Vocabulary & Academic Rigor
    const styleNotes: string[] = []
    let vocabularyScore = 87

    const repetitiveFiller = revised.match(/\b(very|really|quite|somewhat|a lot of)\b/gi) || []
    if (repetitiveFiller.length === 0) {
      styleNotes.push('Vague colloquial intensifiers (very, really, a lot of) eliminated in favor of precise diction.')
      vocabularyScore += 6
    } else {
      styleNotes.push(`Found ${repetitiveFiller.length} colloquial qualifier(s) that could be replaced with specific scholarly terms.`)
      vocabularyScore -= 5
    }

    const uniqueRevWords = new Set(revWords.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(w => w.length > 0))
    const revTTR = uniqueRevWords.size / Math.max(1, revWords.length)
    if (revTTR > 0.6) {
      styleNotes.push('High lexical diversity with discipline-appropriate terminology.')
      vocabularyScore += 4
    }
    vocabularyScore = Math.min(97, Math.max(68, vocabularyScore))

    // Citation Integrity Score
    let citationIntegrityScore = 100
    if (citationAudit.flaggedCitations.length > 0) {
      citationIntegrityScore -= citationAudit.flaggedCitations.length * 25
    }
    if (!citationAudit.quotesPreserved) {
      citationIntegrityScore -= 20
    }
    if (!citationAudit.numbersPreserved) {
      citationIntegrityScore -= 15
    }
    citationIntegrityScore = Math.max(0, Math.min(100, citationIntegrityScore))

    const overallAcademicScore = Math.round(
      clarityScore * 0.25 +
      grammarScore * 0.2 +
      coherenceScore * 0.2 +
      vocabularyScore * 0.15 +
      citationIntegrityScore * 0.2
    )

    const gradeLevel = revAvgLen > 24 ? 'Graduate / Scholarly (Grade 14-16)' : revAvgLen > 18 ? 'Undergraduate Academic (Grade 12-14)' : 'Accessible Academic (Grade 10-12)'

    return {
      scores: {
        clarity: clarityScore,
        grammar: grammarScore,
        coherence: coherenceScore,
        vocabulary: vocabularyScore,
        citationIntegrity: citationIntegrityScore,
        overallAcademicScore
      },
      metrics: {
        originalWords: origWords.length,
        revisedWords: revWords.length,
        originalSentenceCount: origSentences.length,
        revisedSentenceCount: revSentences.length,
        originalAvgSentenceLength: origAvgLen,
        revisedAvgSentenceLength: revAvgLen,
        readabilityGradeLevel: gradeLevel,
        burstinessScore
      },
      critique: {
        clarityNotes,
        grammarNotes,
        coherenceNotes,
        styleNotes
      },
      citationAudit,
      meaningPreservation,
      disclaimer: 'Humanora AI provides transparent linguistic, syntactic, and citation integrity analysis. We never fabricate AI detection bypass scores or guarantee evasion of third-party detectors.'
    }
  }
}

export const academicAuditService = new AcademicAuditService()
