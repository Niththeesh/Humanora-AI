import assert from 'assert'
import dotenv from 'dotenv'
import path from 'path'
import { Server } from 'http'
import { humanizationService } from '../src/services/humanizationService'
import { geminiService } from '../src/services/geminiService'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
process.env.NODE_ENV = 'test'

const app = require('../src/server').default

function request(
  server: Server,
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const address = server.address()
    if (!address || typeof address === 'string') {
      return reject(new Error('Server address unavailable'))
    }

    const payload = body ? JSON.stringify(body) : undefined
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString()
    }

    const http = require('http')
    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        method,
        path,
        headers: reqHeaders
      },
      (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => (data += chunk))
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {}
            resolve({ status: res.statusCode, body: parsed })
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

async function runQATests() {
  console.log('=================================================================')
  console.log('   HUMANORA AI — NATURAL WRITING ENGINE QUALITY ASSURANCE SUITE  ')
  console.log('=================================================================\n')

  const server = app.listen(0)
  let passed = 0
  let failed = 0

  async function test(category: string, name: string, fn: () => Promise<void>) {
    try {
      await fn()
      console.log(`  [PASS] [${category}] ${name}`)
      passed++
    } catch (err: any) {
      console.error(`  [FAIL] [${category}] ${name}: ${err.message}`)
      failed++
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. ACADEMIC WRITING & CITATION INTEGRITY
    // -------------------------------------------------------------
    await test('ACADEMIC', 'Preserves academic citations, empirical data, and scholarly tone', async () => {
      const academicInput = 
        'It is important to remember that transformer architectures (Vaswani et al., 2017) demonstrated 94.2% accuracy in sequence modeling. ' +
        'Due to the fact that cross-attention mechanisms facilitate representational alignment [3], the study concluded that empirical gains of $1.4M are achievable.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: academicInput,
        mode: 'academic',
        tone: 0.15,
        targetLength: 'same',
        authorVoice: 'scholarly'
      })

      assert.strictEqual(res.status, 200)
      const output = res.body.humanizedText

      // Check Citation Preservation
      assert.ok(output.includes('(Vaswani et al., 2017)'), 'Must retain (Vaswani et al., 2017)')
      assert.ok(output.includes('[3]'), 'Must retain citation [3]')

      // Check Numerical & Financial Integrity
      assert.ok(output.includes('94.2%'), 'Must retain numerical benchmark 94.2%')
      assert.ok(output.includes('$1.4M'), 'Must retain financial figure $1.4M')

      // Check Absence of Fluff & Cliches
      assert.ok(!output.toLowerCase().includes('it is important to remember that'), 'Must remove throat-clearing')
      assert.ok(!output.toLowerCase().includes('precipitate of'), 'Must not inject mechanical "precipitate of"')

      // Check Factual Integrity Report
      assert.ok(res.body.factualIntegrity)
      assert.strictEqual(res.body.factualIntegrity.verified, true)
      assert.ok(Array.isArray(res.body.changesExplanation))
      assert.ok(res.body.changesExplanation.length >= 2)
    })

    // -------------------------------------------------------------
    // 2. BUSINESS & PROFESSIONAL COMMUNICATION
    // -------------------------------------------------------------
    await test('PROFESSIONAL', 'Transforms bureaucratic nominalizations into crisp active executive prose', async () => {
      const businessInput = 
        'In light of the fact that Q3 2024 operations showed declining throughput, we will conduct an investigation into the pipeline by October 15. ' +
        'Please be advised that the engineering team has the ability to deliver the patch.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: businessInput,
        mode: 'professional',
        tone: 0.4,
        targetLength: 'same',
        authorVoice: 'direct'
      })

      assert.strictEqual(res.status, 200)
      const output = res.body.humanizedText

      // Dates and timeline preserved
      assert.ok(output.includes('Q3 2024'), 'Must retain timeline Q3 2024')
      assert.ok(output.includes('October 15'), 'Must retain deadline October 15')

      // Nominalization eliminated
      assert.ok(!output.toLowerCase().includes('conduct an investigation into'), 'Must eliminate nominalization')
      assert.ok(!output.toLowerCase().includes('in light of the fact that'), 'Must eliminate wordy preamble')
    })

    // -------------------------------------------------------------
    // 3. CASUAL & CONVERSATIONAL VOICE
    // -------------------------------------------------------------
    await test('CASUAL', 'Produces organic conversational rhythm without forced dialect slang', async () => {
      const casualInput = 
        'It goes without saying that I cannot believe how complex this system is. ' +
        'At the end of the day, we do not have enough hours in the day.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: casualInput,
        mode: 'casual',
        tone: 0.85,
        targetLength: 'same',
        authorVoice: 'conversational'
      })

      assert.strictEqual(res.status, 200)
      const output = res.body.humanizedText

      // Natural contractions present
      assert.ok(output.includes("can't") || output.includes("don't"), 'Must use natural contractions')

      // Forced dialect slang NOT present
      assert.ok(!output.toLowerCase().includes('i reckon'), 'Must NOT inject awkward "I reckon"')
      assert.ok(!output.toLowerCase().includes('it goes without saying that'), 'Must remove cliché')
    })

    // -------------------------------------------------------------
    // 4. TECHNICAL DOCUMENTATION & SPECIFICATIONS
    // -------------------------------------------------------------
    await test('TECHNICAL', 'Preserves version numbers, API endpoints, and technical terms', async () => {
      const technicalInput = 
        'Deploy the microservice using Node.js v20.10 and verify that OAuth 2.0 returns 99.99% uptime across all pods.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: technicalInput,
        mode: 'natural',
        tone: 0.5,
        targetLength: 'same'
      })

      assert.strictEqual(res.status, 200)
      const output = res.body.humanizedText

      assert.ok(output.includes('Node.js v20.10') || output.includes('v20.10'), 'Must retain version number')
      assert.ok(output.includes('OAuth 2.0') || output.includes('OAuth'), 'Must retain protocol name')
      assert.ok(output.includes('99.99%'), 'Must retain exact percentage 99.99%')
    })

    // -------------------------------------------------------------
    // 5. CONCISE MODE & FLUFF REDUCTION
    // -------------------------------------------------------------
    await test('CONCISE', 'Reduces wordiness by eliminating redundant phrases without losing facts', async () => {
      const wordyInput = 
        'It is absolutely essential that our future plans for the project eliminate the actual facts of past history.'

      const res = await request(server, 'POST', '/api/ai/transform', {
        text: wordyInput,
        mode: 'concise',
        tone: 0.5,
        targetLength: 'shorter'
      })

      assert.strictEqual(res.status, 200)
      const output = res.body.humanizedText

      // Redundant pairs tightened
      assert.ok(!output.toLowerCase().includes('absolutely essential'), 'Tightens absolutely essential')
      assert.ok(!output.toLowerCase().includes('past history'), 'Tightens past history')
      assert.ok(!output.toLowerCase().includes('actual facts'), 'Tightens actual facts')
      assert.ok(output.length < wordyInput.length, 'Concise output must be shorter')
    })

    // -------------------------------------------------------------
    // 6. LOCAL LINGUISTIC ENGINE & FALLBACK TRANSPARENCY
    // -------------------------------------------------------------
    await test('LINGUISTIC ENGINE', 'Direct offline linguistic engine produces clean, un-polluted prose', async () => {
      const sample = 
        'It is important to remember that the team reached out to the client. The end result was a big difference in speed.'

      const localResult = humanizationService.humanize(sample, 'natural', 0.5, 0.5, false)

      // Verify no random transitions or question marks
      assert.ok(!localResult.startsWith('Interestingly,'), 'Must not prepend random "Interestingly,"')
      assert.ok(!localResult.startsWith('Notably,'), 'Must not prepend random "Notably,"')
      assert.ok(!localResult.includes('?'), 'Must not randomly convert statements to questions')
      assert.ok(!localResult.includes('I reckon'), 'Must not inject "I reckon"')
      assert.ok(!localResult.toLowerCase().includes('it is important to remember that'), 'Must remove throat-clearing')
    })

    // -------------------------------------------------------------
    // 7. FACTUAL PRESERVATION GUARDIAN
    // -------------------------------------------------------------
    await test('GUARDIAN', 'verifyPreservation detects missing citations and numbers accurately', async () => {
      const original = 'According to (Brown, 2022), revenue grew by 48.5% in [12].'
      const badRewrite = 'Revenue grew substantially according to a study.'
      const goodRewrite = 'According to (Brown, 2022), revenue increased by 48.5% in [12].'

      const badAudit = humanizationService.verifyPreservation(original, badRewrite)
      assert.strictEqual(badAudit.verified, false)
      assert.ok(badAudit.missingEntities.length >= 2, 'Should detect missing citation and percentage')

      const goodAudit = humanizationService.verifyPreservation(original, goodRewrite)
      assert.strictEqual(goodAudit.verified, true)
      assert.strictEqual(goodAudit.missingEntities.length, 0)
    })

    // -------------------------------------------------------------
    // 8. STUDENT VOICE ANALYSIS
    // -------------------------------------------------------------
    await test('STUDENT VOICE', 'POST /api/ai/analyze-voice analyzes student writing sample', async () => {
      const sampleEssay = 
        'In this research essay, I examine the socio-economic impacts of renewable energy adoption across Northern Europe. ' +
        'Specifically, empirical surveys demonstrate that community-owned wind farms precipitate significant local investment. ' +
        'Consequently, municipal policymakers must align capital allocations with environmental mandates.'

      const res = await request(server, 'POST', '/api/ai/analyze-voice', { sample: sampleEssay })
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.success, true)
      assert.ok(res.body.voiceProfile)
      assert.ok(res.body.voiceProfile.formality > 0.5)
      assert.ok(res.body.voiceProfile.avgSentenceLength > 10)
      assert.ok(res.body.voiceProfile.keyPreferences.length >= 1)
    })

    // -------------------------------------------------------------
    // 9. ACADEMIC QUALITY REVIEW ENDPOINT
    // -------------------------------------------------------------
    await test('ACADEMIC REVIEW', 'POST /api/ai/academic-review generates 5-pillar report without transforming', async () => {
      const draftText = 
        'The investigation into genetic expression (Mendel & Watson, 2021) shows that 76.4% of variants produce viable phenotypes. ' +
        'It is important to remember that subsequent trials in [4] confirmed these findings.'

      const res = await request(server, 'POST', '/api/ai/academic-review', { text: draftText })
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.success, true)
      assert.ok(res.body.academicReport)
      assert.ok(res.body.academicReport.scores.clarity > 0)
      assert.ok(res.body.academicReport.scores.grammar > 0)
      assert.ok(res.body.academicReport.scores.citationIntegrity > 0)
      assert.ok(res.body.academicReport.critique.clarityNotes)
      assert.ok(res.body.academicReport.disclaimer.includes('never fabricate AI detection bypass scores'))
    })

    // -------------------------------------------------------------
    // 10. PRIVACY & EPHEMERAL MODE (ZERO DATABASE STORAGE)
    // -------------------------------------------------------------
    await test('PRIVACY', 'POST /api/ai/transform with ephemeral: true does not save to database', async () => {
      const confidentialAssignment = 'Confidential student honors thesis draft on quantum cryptography.'
      const res = await request(server, 'POST', '/api/ai/transform', {
        text: confidentialAssignment,
        mode: 'academic',
        ephemeral: true
      })

      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.ephemeral, true)
      const ephemeralId = res.body.id

      // Verify item cannot be retrieved from history
      const historyRes = await request(server, 'GET', `/api/history/${ephemeralId}`)
      assert.strictEqual(historyRes.status, 404, 'Ephemeral assignment must not be stored in database')
    })

    // -------------------------------------------------------------
    // 11. SESSION OWNERSHIP & SCOPING
    // -------------------------------------------------------------
    await test('SECURITY', 'GET /api/history scopes transformations to session token', async () => {
      const testSessionId = '11111111-2222-3333-4444-555555555555'
      const res = await request(server, 'POST', '/api/ai/transform', {
        text: 'Session ownership validation sample text.',
        mode: 'academic',
        sessionId: testSessionId
      })

      assert.strictEqual(res.status, 200)
      const itemId = res.body.id

      // Request history scoped to this session
      const scopedHistory = await request(server, 'GET', `/api/history?sessionId=${testSessionId}`)
      assert.strictEqual(scopedHistory.status, 200)
      assert.ok(scopedHistory.body.history.some((h: any) => h.id === itemId))

      // Clean up item with session ownership
      const deleteRes = await request(server, 'DELETE', `/api/history/${itemId}?sessionId=${testSessionId}`)
      assert.strictEqual(deleteRes.status, 200)
    })

  } finally {
    server.close()
  }

  console.log('\n=================================================================')
  console.log(`QA Test Suite Completed: ${passed} PASSED, ${failed} FAILED`)
  console.log('=================================================================')

  if (failed > 0) {
    process.exit(1)
  }
  process.exit(0)
}

runQATests().catch(err => {
  console.error('Fatal QA error:', err)
  process.exit(1)
})
