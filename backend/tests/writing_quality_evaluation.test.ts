import assert from 'assert'
import dotenv from 'dotenv'
import path from 'path'
import { Server } from 'http'

// Configure test environment
dotenv.config({ path: path.resolve(__dirname, '../.env') })
process.env.NODE_ENV = 'test'

const app = require('../src/server').default

function request(
  server: Server,
  method: string,
  urlPath: string,
  body?: any
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const address = server.address()
    if (!address || typeof address === 'string') {
      return reject(new Error('Server address unavailable'))
    }

    const payload = body ? JSON.stringify(body) : undefined
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload).toString()
    }

    const http = require('http')
    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        method,
        path: urlPath,
        headers
      },
      (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => (data += chunk))
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} })
          } catch {
            resolve({ status: res.statusCode, body: data })
          }
        })
      }
    )

    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

// Linguistic calculation helpers
function getSentenceLengths(text: string): number[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim().split(/\s+/).filter(w => w.length > 0).length)
    .filter(len => len > 0)
}

function calculateBurstiness(sentenceLengths: number[]): number {
  if (sentenceLengths.length <= 1) return 0
  const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / sentenceLengths.length
  return Math.round(Math.sqrt(variance) * 10) / 10
}

function countOccurrences(text: string, words: string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const w of words) {
    const regex = new RegExp(`\\b${w}\\b`, 'gi')
    counts[w] = (text.match(regex) || []).length
  }
  return counts
}

async function runWritingQualityEvaluation() {
  console.log('================================================================================')
  console.log('   HUMANORA AI — HONEST ACADEMIC & PROFESSIONAL WRITING QUALITY EVALUATION       ')
  console.log('================================================================================\n')

  const server = app.listen(0)
  let passedCount = 0
  let failedCount = 0

  async function evaluate(title: string, testFn: () => Promise<void>) {
    try {
      console.log(`\n▶ EVALUATION: ${title}`)
      await testFn()
      console.log(`  [PASS] ${title}`)
      passedCount++
    } catch (err: any) {
      console.error(`  [FAIL] ${title}: ${err.message}`)
      failedCount++
    }
  }

  try {
    // --------------------------------------------------------------------------
    // 1. ACADEMIC WRITING: CITATION INTEGRITY, FACTUAL FIDELITY, AND BURSTINESS
    // --------------------------------------------------------------------------
    await evaluate('Academic Clarity: Preserves Complex Citations, Empirical Data, and Modulates Cadence', async () => {
      const academicDraft = 
        'It is important to remember that recent investigations into cross-attention mechanisms (Vaswani et al., 2017; Marcus & Davis, 2019, p. 104) demonstrate that representational alignment yields 94.2% accuracy in syntactic parsing. ' +
        'Due to the fact that empirical trials in [1, 3] achieved statistically significant convergence (p < 0.01), researchers concluded that capital expenditures of $2.5M by October 2023 were justified. ' +
        'Furthermore, the authors stated that "representational alignment across layers" serves as a testament to algorithmic robustness.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: academicDraft,
        mode: 'academic',
        tone: 0.2,
        intensity: 'balanced',
        authorVoice: 'scholarly'
      })

      assert.strictEqual(res.status, 200)
      const enhanced = res.body.humanizedText

      console.log('    • Original Text Word Count:', academicDraft.split(/\s+/).length)
      console.log('    • Enhanced Text Word Count:', enhanced.split(/\s+/).length)
      console.log('    • Transformation Engine:', res.body.engine, `(${res.body.model})`)
      console.log('    • Enhanced Preview:\n      "' + enhanced.substring(0, 160) + '..."')

      // Check Citations
      assert.ok(
        enhanced.includes('Vaswani et al., 2017') || enhanced.includes('(Vaswani et al., 2017'),
        'Must preserve Vaswani citation'
      )
      assert.ok(enhanced.includes('[1, 3]') || enhanced.includes('[1]'), 'Must preserve IEEE citation')
      assert.ok(enhanced.includes('Marcus & Davis, 2019'), 'Must preserve multi-author citation')

      // Check Empirical & Numerical Integrity
      assert.ok(enhanced.includes('94.2%'), 'Must preserve exact percentage 94.2%')
      assert.ok(enhanced.includes('$2.5M'), 'Must preserve financial figure $2.5M')
      assert.ok(enhanced.includes('p < 0.01'), 'Must preserve p-value benchmark')
      assert.ok(enhanced.includes('October 2023'), 'Must preserve timeline October 2023')

      // Check Direct Quotation
      assert.ok(enhanced.includes('representational alignment across layers'), 'Must preserve direct quotation text')

      // Check Cliché Pruning
      assert.ok(!enhanced.toLowerCase().includes('it is important to remember that'), 'Must prune throat-clearing')
      assert.ok(!enhanced.toLowerCase().includes('serves as a testament to'), 'Must prune AI cliché "testament to"')

      // Cadence Analysis
      const sentenceLengths = getSentenceLengths(enhanced)
      const burstiness = calculateBurstiness(sentenceLengths)
      console.log(`    • Sentence Lengths Distribution: [${sentenceLengths.join(', ')}] words`)
      console.log(`    • Cadence Burstiness Index: ${burstiness} (Natural rhythm variation)`)
      assert.ok(sentenceLengths.length >= 2, 'Must maintain multi-sentence structure')

      // Factual Preservation Audit
      assert.ok(res.body.factualIntegrity)
      assert.strictEqual(res.body.factualIntegrity.verified, true)
    })

    // --------------------------------------------------------------------------
    // 2. PROFESSIONAL WRITING: EXECUTIVE CLARITY & NOMINALIZATION REDUCTION
    // --------------------------------------------------------------------------
    await evaluate('Professional Writing: Replaces Bureaucratic Bloat with Active Executive Verbs', async () => {
      const corporateDraft = 
        'In light of the fact that Q3 2024 operating metrics demonstrated a decline in efficiency, the executive leadership team will conduct an investigation into the deployment lifecycle by November 30. ' +
        'Please be advised that our engineering organization has the ability to implement remedial configurations without introducing service interruption.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: corporateDraft,
        mode: 'professional',
        tone: 0.4,
        intensity: 'balanced',
        authorVoice: 'direct'
      })

      assert.strictEqual(res.status, 200)
      const enhanced = res.body.humanizedText

      console.log('    • Enhanced Preview:\n      "' + enhanced + '"')

      // Facts & Timelines
      assert.ok(enhanced.includes('Q3 2024'), 'Must preserve Q3 2024')
      assert.ok(enhanced.includes('November 30'), 'Must preserve deadline November 30')

      // Nominalization & Wordiness Elimination
      assert.ok(!enhanced.toLowerCase().includes('conduct an investigation into'), 'Must convert nominalization')
      assert.ok(!enhanced.toLowerCase().includes('in light of the fact that'), 'Must remove wordy preamble')
      assert.ok(!enhanced.toLowerCase().includes('has the ability to'), 'Must streamline "has the ability to"')

      // Word Economy
      assert.ok(enhanced.length <= corporateDraft.length, 'Executive rewrite must be crisper')
    })

    // --------------------------------------------------------------------------
    // 3. STUDENT WRITING SAMPLE & AUTHENTIC VOICE PRESERVATION
    // --------------------------------------------------------------------------
    await evaluate('Student Writing Sample: Calibrates Enhancements to Match Authentic Voice', async () => {
      const studentWritingSample = 
        'Throughout my fieldwork in urban planning, I observed how green infrastructure projects directly influence neighborhood social capital. ' +
        'Community gardens, for instance, create shared spaces where residents build trust and collaborate on local initiatives. ' +
        'These empirical observations suggest that public space design plays a meaningful role in civic resilience.'

      const unpolishedDraft = 
        'Due to the fact that modern cities face climate change, a lot of urban planners came up with plans to set up parks. ' +
        'It is important to note that these parks turn out to be very good for social connections.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: unpolishedDraft,
        mode: 'natural',
        tone: 0.5,
        studentVoiceSample: studentWritingSample,
        authorVoice: 'balanced'
      })

      assert.strictEqual(res.status, 200)
      const enhanced = res.body.humanizedText

      console.log('    • Student Voice Profile Detected:', res.body.studentVoiceProfile?.toneLabel)
      console.log('    • Target Sentence Length:', res.body.studentVoiceProfile?.avgSentenceLength, 'words')
      console.log('    • Calibrated Prose:\n      "' + enhanced + '"')

      // Meaning Preserved
      assert.ok(enhanced.toLowerCase().includes('climate') || enhanced.toLowerCase().includes('parks') || enhanced.toLowerCase().includes('urban'), 'Core topics must be preserved')
      assert.ok(!enhanced.toLowerCase().includes('it is important to note that'), 'Must remove generic throat-clearing')
      assert.ok(!enhanced.toLowerCase().includes('a lot of'), 'Must upgrade colloquial "a lot of"')
      assert.ok(res.body.studentVoiceProfile !== undefined, 'Must attach student voice profile')
    })

    // --------------------------------------------------------------------------
    // 4. CLICHE & REPETITIVE PHRASING AUDIT
    // --------------------------------------------------------------------------
    await evaluate('Honest Linguistic Audit: Zero Forbidden AI Clichés & Discourse Balance', async () => {
      const testPassage = 
        'Artificial neural networks process information through layered weighted representations. ' +
        'Each successive layer extracts increasingly abstract features from raw sensor data. ' +
        'This hierarchical organization allows computer vision systems to detect subtle geometric anomalies.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: testPassage,
        mode: 'natural',
        intensity: 'balanced'
      })

      assert.strictEqual(res.status, 200)
      const output = res.body.humanizedText

      const forbiddenCliches = [
        'tapestry',
        'delve',
        'testament to',
        'beacon of',
        'in today\'s digital landscape',
        'multifaceted nature',
        'paramount importance',
        'realm of'
      ]

      const counts = countOccurrences(output, forbiddenCliches)
      console.log('    • Cliché Frequency Count (must be 0):', JSON.stringify(counts))

      for (const [cliche, count] of Object.entries(counts)) {
        assert.strictEqual(count, 0, `Output should not contain forbidden cliché "${cliche}"`)
      }
    })

    // --------------------------------------------------------------------------
    // 5. TRANSPARENT ACADEMIC REPORT & NO FABRICATED DETECTOR BYPASS SCORES
    // --------------------------------------------------------------------------
    await evaluate('Quality Reporting: Transparent 5-Pillar Scores and Zero Fabricated Bypass Claims', async () => {
      const draft = 
        'The synthesis of carbon nanotubes (Iijima, 1991) resulted in a 42% increase in tensile strength. ' +
        'Subsequent trials in [5] corroborated these results.'

      const res = await request(server, 'POST', '/api/ai/academic-review', { text: draft })
      assert.strictEqual(res.status, 200)
      const report = res.body.academicReport

      assert.ok(report.scores, 'Report must contain 5 pillar scores')
      assert.ok(report.scores.clarity > 0 && report.scores.clarity <= 100)
      assert.ok(report.scores.grammar > 0 && report.scores.grammar <= 100)
      assert.ok(report.scores.citationIntegrity === 100, 'Original citations are 100% intact')
      assert.ok(report.citationAudit.detectedCitations.length >= 2, 'Should detect (Iijima, 1991) and [5]')

      // Verify Ethical Integrity Disclaimer
      console.log('    • Quality Report Disclaimer:\n      "' + report.disclaimer + '"')
      assert.ok(
        report.disclaimer.includes('never fabricate AI detection bypass scores'),
        'Must contain honest disclaimer against fake detector evasion'
      )
    })

  } finally {
    server.close()
  }

  console.log('\n================================================================================')
  console.log(`Writing Quality Evaluation Summary: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('================================================================================\n')

  if (failedCount > 0) {
    process.exit(1)
  }
}

runWritingQualityEvaluation().catch(err => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
