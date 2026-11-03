export interface SentenceDetail {
  sentence: string
  score: number
  verdict: 'Low' | 'Medium' | 'High'
  reasons: string[]
}

export interface AIDetectResult {
  aiScore: number // 0 - 100
  humanScore: number // 100 - aiScore
  verdict: 'Low' | 'Medium' | 'High'
  summary: string
  disclaimer: string
  wordCount: number
  sentenceCount: number
  signals: {
    burstiness: {
      score: number
      standardDeviation: number
      averageSentenceLength: number
      label: string
    }
    lexicalDiversity: {
      score: number
      typeTokenRatio: number
      uniqueWords: number
      totalWords: number
      label: string
    }
    clicheDensity: {
      count: number
      densityPer100Words: number
      foundCliches: string[]
      label: string
    }
    repetitiveNgrams: {
      rate: number
      foundPatterns: string[]
    }
    transitionUniformity: {
      formulaicOpenerCount: number
      percentage: number
      label: string
    }
  }
  sentenceAnalysis: SentenceDetail[]
}

const BANNED_AI_CLICHES: Array<{ phrase: string; regex: RegExp }> = [
  { phrase: 'delve into', regex: /\bdelves?\s+into\b/gi },
  { phrase: 'furthermore', regex: /\bfurthermore\b/gi },
  { phrase: 'moreover', regex: /\bmoreover\b/gi },
  { phrase: 'in conclusion', regex: /\bin\s+conclusion\b/gi },
  { phrase: 'it is important to note', regex: /\bit\s+is\s+important\s+to\s+note(?:\s+that)?\b/gi },
  { phrase: 'it is worth noting', regex: /\bit\s+is\s+worth\s+noting(?:\s+that)?\b/gi },
  { phrase: 'plays a crucial role', regex: /\bplays?\s+a\s+crucial\s+role(?:\s+in)?\b/gi },
  { phrase: 'plays a pivotal role', regex: /\bplays?\s+a\s+pivotal\s+role(?:\s+in)?\b/gi },
  { phrase: 'intricate tapestry', regex: /\b(?:intricate\s+)?tapestry\s+of\b/gi },
  { phrase: 'landscape', regex: /\b(?:digital\s+|ever-evolving\s+)?landscape\b/gi },
  { phrase: 'testament to', regex: /\b(?:stands?\s+as\s+a\s+|is\s+a\s+)?testament\s+to\b/gi },
  { phrase: 'beacon of', regex: /\ba\s+beacon\s+of\b/gi },
  { phrase: 'multifaceted nature', regex: /\b(?:the\s+)?multifaceted\s+nature\s+of\b/gi },
  { phrase: 'multifaceted', regex: /\bmultifaceted\b/gi },
  { phrase: "in today's fast-paced world", regex: /\bin\s+today's\s+fast-paced\s+world\b/gi },
  { phrase: "in today's digital era", regex: /\bin\s+today's\s+digital\s+(?:era|age|landscape)\b/gi },
  { phrase: 'at the end of the day', regex: /\bat\s+the\s+end\s+of\s+the\s+day\b/gi },
  { phrase: 'needless to say', regex: /\bneedless\s+to\s+say\b/gi },
  { phrase: 'fosters an environment', regex: /\bfosters?\s+an\s+environment\b/gi },
  { phrase: 'spearhead', regex: /\bspearhead(?:ed|ing)?\b/gi },
  { phrase: 'navigate the complexities', regex: /\bnavigate\s+the\s+complexities\b/gi },
  { phrase: 'a myriad of', regex: /\ba\s+myriad\s+of\b/gi },
  { phrase: 'a plethora of', regex: /\ba\s+plethora\s+of\b/gi },
  { phrase: 'not only ... but also', regex: /\bnot\s+only\b[\s\S]{1,40}\bbut\s+also\b/gi }
]

const FORMULAIC_OPENERS = [
  /^furthermore\b/i,
  /^moreover\b/i,
  /^in conclusion\b/i,
  /^additionally\b/i,
  /^consequently\b/i,
  /^it is important to note\b/i,
  /^it is worth noting\b/i,
  /^first and foremost\b/i,
  /^lastly\b/i,
  /^overall\b/i,
  /^in summary\b/i
]

export class AIDetectorService {
  public detect(text: string): AIDetectResult {
    const clean = text ? text.trim() : ''
    if (!clean) {
      throw new Error('Please provide text to analyze.')
    }

    // Extract sentences & words
    const sentences = clean
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const rawWords = clean
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1)

    const wordCount = Math.max(1, rawWords.length)
    const sentenceCount = Math.max(1, sentences.length)

    // 1. Burstiness: Sentence length variance (standard deviation)
    const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length)
    const avgLen = sentenceLengths.reduce((acc, l) => acc + l, 0) / sentenceCount
    const variance = sentenceLengths.reduce((acc, l) => acc + Math.pow(l - avgLen, 2), 0) / sentenceCount
    const stdDev = Math.sqrt(variance)

    // High burstiness in human writing: standard deviation >= 7.5
    // Low burstiness in AI text: standard deviation <= 3.5
    let burstinessScore = 50
    let burstinessPenalty = 50
    if (stdDev >= 8.0) {
      burstinessScore = 90
      burstinessPenalty = 10
    } else if (stdDev >= 5.5) {
      burstinessScore = 70
      burstinessPenalty = 30
    } else if (stdDev >= 3.5) {
      burstinessScore = 45
      burstinessPenalty = 60
    } else {
      burstinessScore = 20
      burstinessPenalty = 85
    }

    // 2. Lexical Diversity (Type-Token Ratio)
    const uniqueWordSet = new Set(rawWords)
    const ttr = uniqueWordSet.size / wordCount
    let lexicalScore = 50
    let lexicalPenalty = 50
    if (ttr >= 0.75) {
      lexicalScore = 90
      lexicalPenalty = 10
    } else if (ttr >= 0.55) {
      lexicalScore = 70
      lexicalPenalty = 30
    } else if (ttr >= 0.40) {
      lexicalScore = 45
      lexicalPenalty = 60
    } else {
      lexicalScore = 25
      lexicalPenalty = 80
    }

    // 3. AI Cliché Density
    const foundCliches: string[] = []
    let totalClicheHits = 0
    for (const item of BANNED_AI_CLICHES) {
      const matches = clean.match(item.regex)
      if (matches && matches.length > 0) {
        totalClicheHits += matches.length
        if (!foundCliches.includes(item.phrase)) {
          foundCliches.push(item.phrase)
        }
      }
    }
    const clicheDensityPer100 = (totalClicheHits / wordCount) * 100
    const clichePenalty = Math.min(100, Math.round(clicheDensityPer100 * 40))

    // 4. Repeated N-gram Patterns (Trigrams)
    const trigrams: string[] = []
    for (let i = 0; i < rawWords.length - 2; i++) {
      trigrams.push(`${rawWords[i]} ${rawWords[i + 1]} ${rawWords[i + 2]}`)
    }
    const trigramFreq = new Map<string, number>()
    for (const tri of trigrams) {
      trigramFreq.set(tri, (trigramFreq.get(tri) || 0) + 1)
    }
    const repeatedTrigrams: string[] = []
    let repeatedCount = 0
    for (const [tri, freq] of trigramFreq.entries()) {
      if (freq > 1) {
        repeatedCount += freq - 1
        if (repeatedTrigrams.length < 5) repeatedTrigrams.push(tri)
      }
    }
    const trigramRepetitionRate = trigrams.length > 0 ? repeatedCount / trigrams.length : 0
    const ngramPenalty = Math.min(100, Math.round(trigramRepetitionRate * 300))

    // 5. Formulaic Transition Openers
    let formulaicOpenerCount = 0
    for (const s of sentences) {
      if (FORMULAIC_OPENERS.some(r => r.test(s))) {
        formulaicOpenerCount++
      }
    }
    const formulaicOpenerRate = (formulaicOpenerCount / sentenceCount) * 100
    const transitionPenalty = Math.min(100, Math.round(formulaicOpenerRate * 1.5))

    // 6. Sentence-Level Granular Analysis
    const sentenceAnalysis: SentenceDetail[] = sentences.map((sent, idx) => {
      const wordsInSent = sent.split(/\s+/).filter(Boolean).length
      const reasons: string[] = []
      let sentScore = 20 // baseline human

      // Check formulaic openers
      if (FORMULAIC_OPENERS.some(r => r.test(sent))) {
        reasons.push('Begins with a formulaic transitional adverb')
        sentScore += 35
      }

      // Check clichés inside sentence
      for (const item of BANNED_AI_CLICHES) {
        if (item.regex.test(sent)) {
          reasons.push(`Contains AI signature cliché "${item.phrase}"`)
          sentScore += 30
        }
      }

      // Check rigid uniformity (if sentence length is extremely close to average and has no punctuation/subordinate clauses)
      if (stdDev < 3.5 && Math.abs(wordsInSent - avgLen) < 3 && wordsInSent >= 12 && wordsInSent <= 22) {
        if (!sent.includes(';') && !sent.includes(',') && !sent.includes('—')) {
          reasons.push(`Predictable length (${wordsInSent} words) with monotonic subject-verb cadence`)
          sentScore += 20
        }
      }

      sentScore = Math.max(5, Math.min(95, sentScore))
      const sentVerdict: 'Low' | 'Medium' | 'High' =
        sentScore <= 35 ? 'Low' : sentScore <= 68 ? 'Medium' : 'High'

      return {
        sentence: sent,
        score: sentScore,
        verdict: sentVerdict,
        reasons
      }
    })

    // Weighted Combined AI Score
    const rawAiScore =
      0.30 * burstinessPenalty +
      0.35 * clichePenalty +
      0.20 * transitionPenalty +
      0.15 * (0.6 * lexicalPenalty + 0.4 * ngramPenalty)

    // Bound between 6 and 96 (honest: statistical heuristics cannot claim 0 or 100 certainty)
    const finalAiScore = Math.max(6, Math.min(96, Math.round(rawAiScore)))
    const humanScore = 100 - finalAiScore

    const verdict: 'Low' | 'Medium' | 'High' =
      finalAiScore <= 34 ? 'Low' : finalAiScore <= 68 ? 'Medium' : 'High'

    const summary =
      verdict === 'Low'
        ? 'Natural Human Cadence: High sentence length variance, expressive vocabulary, and absence of formulaic AI transition patterns.'
        : verdict === 'Medium'
        ? 'Mixed Writing Patterns: Moderate cadence variation observed with occasional predictable transitions or uniform sentence structures.'
        : 'Predictable AI Signature Patterns: Uniform sentence lengths, formulaic transitions, or repeated AI cliché phrases detected.'

    return {
      aiScore: finalAiScore,
      humanScore,
      verdict,
      summary,
      disclaimer: 'Estimate based on writing patterns. Not equivalent to Turnitin/GPTZero and not a guarantee.',
      wordCount,
      sentenceCount,
      signals: {
        burstiness: {
          score: burstinessScore,
          standardDeviation: Math.round(stdDev * 10) / 10,
          averageSentenceLength: Math.round(avgLen * 10) / 10,
          label: stdDev >= 6.5 ? 'High Natural Variety' : stdDev >= 4.0 ? 'Moderate Variety' : 'Low / Monotonous AI Rhythm'
        },
        lexicalDiversity: {
          score: lexicalScore,
          typeTokenRatio: Math.round(ttr * 100) / 100,
          uniqueWords: uniqueWordSet.size,
          totalWords: wordCount,
          label: ttr >= 0.65 ? 'Rich Vocabulary' : ttr >= 0.45 ? 'Standard Vocabulary' : 'Repetitive Word Choice'
        },
        clicheDensity: {
          count: totalClicheHits,
          densityPer100Words: Math.round(clicheDensityPer100 * 10) / 10,
          foundCliches,
          label: totalClicheHits === 0 ? 'Zero AI Clichés' : `${totalClicheHits} AI Hallmarks Detected`
        },
        repetitiveNgrams: {
          rate: Math.round(trigramRepetitionRate * 1000) / 10,
          foundPatterns: repeatedTrigrams
        },
        transitionUniformity: {
          formulaicOpenerCount,
          percentage: Math.round(formulaicOpenerRate),
          label: formulaicOpenerCount === 0 ? 'Organic Transitions' : `${formulaicOpenerCount} Formulaic Openers`
        }
      },
      sentenceAnalysis
    }
  }
}

export const aiDetectorService = new AIDetectorService()

