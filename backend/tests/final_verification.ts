import assert from 'assert'
import dotenv from 'dotenv'
import path from 'path'
import { GoogleGenAI } from '@google/genai'

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })
process.env.NODE_ENV = 'test'

import { GeminiService } from '../src/services/geminiService'
import { databaseService } from '../src/services/databaseService'

async function runLiveVerification() {
  console.log('================================================================================')
  console.log('   HUMANORA AI — FINAL LIVE INTEGRATION & RELIABILITY VERIFICATION SUITE       ')
  console.log('================================================================================\n')

  const apiKey = process.env.GEMINI_API_KEY
  assert.ok(apiKey && apiKey.length > 10, 'GEMINI_API_KEY must be present in backend/.env')

  // Masked key display for security — NEVER print the actual key
  const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (length: ${apiKey.length})`
  console.log(`[AUTH CHECK] API Key Loaded: ${maskedKey}`)
  console.log(`[CONFIG] Configured Primary Model in .env: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}\n`)

  const ai = new GoogleGenAI({ apiKey })

  // ============================================================================
  // CHECKPOINT 1: Google Gemini API Official Catalogue Cross-Reference
  // ============================================================================
  console.log('▶ CHECKPOINT 1: Querying Official Google Gemini API Model Catalogue...')
  const modelsInService = [
    process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash'
  ].filter((m, idx, arr) => arr.indexOf(m) === idx)

  let officialCatalogue: Array<{ name: string; displayName?: string; description?: string }> = []
  try {
    const listResult: any = await (ai.models as any).list()
    if (listResult && typeof listResult[Symbol.asyncIterator] === 'function') {
      for await (const m of listResult) {
        officialCatalogue.push({
          name: m.name,
          displayName: m.displayName,
          description: m.description
        })
      }
    } else if (Array.isArray(listResult)) {
      officialCatalogue = listResult
    } else if (listResult && listResult.models) {
      officialCatalogue = listResult.models
    }
    console.log(`  ✓ Successfully connected to Google GenAI API. Total models in catalogue: ${officialCatalogue.length}`)
  } catch (catErr: any) {
    console.error(`  ✗ Error querying official model catalogue: ${catErr.message}`)
  }

  // Cross-reference every candidate model in geminiService.ts and backend/.env
  console.log('\n  Candidate Model Catalogue Status:')
  for (const modelId of modelsInService) {
    // Model names in catalogue can be formatted as 'models/gemini-...' or 'gemini-...'
    const inCatalogue = officialCatalogue.find(
      m => m.name === modelId || m.name === `models/${modelId}` || m.name.endsWith(`/${modelId}`)
    )

    // Test live call with a minimal prompt to verify real-time API availability
    let liveStatus = 'UNTESTED'
    let liveLatency = 0
    try {
      const start = Date.now()
      const testTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_5S')), 5000))
      const res: any = await Promise.race([
        ai.models.generateContent({
          model: modelId,
          contents: 'Say OK'
        }),
        testTimeout
      ])
      liveLatency = Date.now() - start
      liveStatus = res && res.text ? `ACTIVE (HTTP 200, ${liveLatency}ms)` : 'ACTIVE (Empty text)'
    } catch (liveErr: any) {
      const msg = liveErr.message || ''
      if (msg.includes('TIMEOUT')) {
        liveStatus = 'TIMEOUT (>5000ms latency - not recommended as primary)'
      } else if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
        liveStatus = 'DEGRADED / 503 (High demand spike)'
      } else if (msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('not found')) {
        liveStatus = 'INVALID / 404 (Not found or deprecated)'
      } else {
        liveStatus = `ERROR: ${msg.slice(0, 60)}`
      }
    }

    console.log(`    • Model ID: "${modelId}"`)
    console.log(`      - In Official Catalogue: ${inCatalogue ? 'YES' : 'NO'}`)
    if (inCatalogue?.displayName) console.log(`      - Display Name: ${inCatalogue.displayName}`)
    console.log(`      - Live API Response: ${liveStatus}`)
  }

  // ============================================================================
  // CHECKPOINT 2: Test Configured Primary Model with Server-Side Key
  // ============================================================================
  console.log('\n▶ CHECKPOINT 2: Live Transformation using Configured Primary Model...')
  const geminiService = new GeminiService()
  const status = geminiService.getStatus()
  console.log(`  • GeminiService Initialized: ${status.isConfigured}`)
  console.log(`  • Primary Model Configured: ${status.model}`)

  const academicDraft = 
    'In accordance with the empirical findings documented by Vaswani et al. (2017) and later corroborated by Brown et al. (2020, p. 45), ' +
    'multi-head attention mechanisms exhibit superior parallelization efficiency compared to recurrent architectures. ' +
    'Specifically, the measured throughput achieved 842 tokens per second with a 99.4% precision rate.'

  const transformStart = Date.now()
  const result = await geminiService.transform({
    text: academicDraft,
    mode: 'academic',
    tone: 0.2, // Scholarly formal
    intensity: 'balanced',
    targetLength: 'same'
  })
  const transformElapsed = Date.now() - transformStart

  console.log(`  ✓ Transformation Completed in ${transformElapsed}ms`)
  console.log(`    - Active Engine: "${result.engine}"`)
  console.log(`    - Model Used: "${result.model}"`)
  console.log(`    - Original Words: ${result.stats.originalWords} -> Rewritten Words: ${result.stats.humanizedWords}`)
  console.log(`    - In-text Citations Preserved: ${result.academicReport.citationAudit.preservedCitations.join(', ') || 'None found'}`)
  console.log(`    - Factual Integrity Verified: ${result.factualIntegrity.verified}`)
  console.log(`    - Academic Coherence Score: ${result.academicReport.scores.coherence}/100`)
  console.log(`    - Cadence Burstiness Score: ${result.academicReport.metrics.burstinessScore}/100`)
  console.log(`    - Rewritten Sample:\n      "${result.humanizedText.slice(0, 160)}..."`)

  assert.strictEqual(result.engine, 'gemini', 'Primary transformation must use cloud Gemini engine when key is valid')
  assert.ok(result.humanizedText.includes('Vaswani et al.'), 'Must preserve citation (Vaswani et al.)')
  assert.ok(result.humanizedText.includes('842') || result.humanizedText.includes('99.4%'), 'Must preserve empirical statistics')

  // ============================================================================
  // CHECKPOINT 3: Verify Fallback & Retry Behavior
  // ============================================================================
  console.log('\n▶ CHECKPOINT 3: Fallback & Resilience Verification...')

  // 3A: Invalid Model ID - Must NOT retry indefinitely, must skip immediately to next or fallback
  console.log('  [3A] Testing Invalid Model ID (404 / NOT_FOUND)...')
  try {
    const invalidService = new GeminiService()
    // Inject invalid model as primary
    ;(invalidService as any).modelName = 'gemini-nonexistent-invalid-model-v99'
    const fallbackRes = await invalidService.transform({
      text: 'Simple test paragraph to verify invalid model skip.',
      mode: 'natural'
    })
    console.log(`    ✓ Invalid model handled cleanly: engine="${fallbackRes.engine}", model="${fallbackRes.model}"`)
    assert.ok(fallbackRes.engine === 'gemini' || fallbackRes.engine === 'linguistic-engine')
  } catch (err: any) {
    console.error('    ✗ Unexpected crash on invalid model:', err.message)
    assert.fail('Invalid model must not crash application')
  }

  // 3B: Authentication Error - Fatal, must NOT retry or loop candidates; must abort to local engine
  console.log('  [3B] Testing Fatal Authentication Error (Invalid Key)...')
  try {
    const badAuthAI = new GoogleGenAI({ apiKey: 'AIzaSyFakeKeyInvalidAuthenticationVerification_0000' })
    const badAuthService = new GeminiService()
    ;(badAuthService as any).ai = badAuthAI
    ;(badAuthService as any).isConfigured = true

    const authFallbackStart = Date.now()
    const authRes = await badAuthService.transform({
      text: 'Testing authentication failure handling for academic safety.',
      mode: 'academic'
    })
    const authFallbackDuration = Date.now() - authFallbackStart

    console.log(`    ✓ Auth failure handled in ${authFallbackDuration}ms`)
    console.log(`    - Engine: "${authRes.engine}"`)
    console.log(`    - Model: "${authRes.model}"`)
    console.log(`    - Warning Label: "${authRes.warning}"`)

    assert.strictEqual(authRes.engine, 'linguistic-engine', 'Must fall back to linguistic-engine on auth failure')
    assert.strictEqual(authRes.model, 'Humanora-Linguistic-Engine-v2')
    assert.ok(authRes.warning?.includes('Authentication failed') || authRes.warning?.includes('local linguistic engine'), 'Warning must indicate auth failure')
  } catch (err: any) {
    console.error('    ✗ Unexpected crash on auth error:', err.message)
    assert.fail('Auth error must be handled gracefully')
  }

  // 3C: Transient 503 / Rate Limit / Timeout - Bounded retry with exponential backoff
  console.log('  [3C] Testing Transient Error Handling (Bounded Retries & Exponential Backoff)...')
  try {
    let callAttempts = 0
    const mockTransientAI = {
      models: {
        generateContent: async () => {
          callAttempts++
          if (callAttempts === 1) {
            const err: any = new Error('503 Service Unavailable: High demand spike')
            throw err
          }
          return { text: 'Recovered successfully on transient retry.' }
        }
      }
    }
    const transientService = new GeminiService()
    ;(transientService as any).ai = mockTransientAI
    ;(transientService as any).isConfigured = true
    ;(transientService as any).modelName = 'gemini-mock-transient'

    const retryStart = Date.now()
    const retryRes = await transientService.transform({
      text: 'Checking bounded retry on 503 transient error.',
      mode: 'natural'
    })
    const retryDuration = Date.now() - retryStart

    console.log(`    ✓ Transient 503 recovered after ${callAttempts} attempts in ${retryDuration}ms`)
    console.log(`    - Engine: "${retryRes.engine}"`)
    assert.strictEqual(callAttempts, 2, 'Must perform exactly 1 bounded retry (2 attempts total)')
    assert.ok(retryDuration >= 450, 'Must apply exponential backoff (>= 500ms delay)')
  } catch (err: any) {
    console.error('    ✗ Error during transient test:', err.message)
    assert.fail('Transient retry test failed')
  }

  // ============================================================================
  // CHECKPOINT 4: Accurate Labeling (Failed Cloud Calls NEVER Labeled as Gemini)
  // ============================================================================
  console.log('\n▶ CHECKPOINT 4: Cloud Failure & Local Fallback Labeling Integrity...')
  const simulatedFailureAI = {
    models: {
      generateContent: async () => {
        throw new Error('503 Unavailable - Total cloud outage simulation')
      }
    }
  }
  const outageService = new GeminiService()
  ;(outageService as any).ai = simulatedFailureAI
  ;(outageService as any).isConfigured = true

  const outageResult = await outageService.transform({
    text: 'Standard academic sentence to verify fallback labeling integrity.',
    mode: 'academic'
  })

  console.log(`  ✓ Cloud failure response:`)
  console.log(`    - Engine: "${outageResult.engine}" (MUST NOT be 'gemini')`)
  console.log(`    - Model: "${outageResult.model}"`)
  console.log(`    - Diagnostic Warning: "${outageResult.warning}"`)

  assert.strictEqual(outageResult.engine, 'linguistic-engine', 'Failed cloud calls MUST NEVER be labeled as gemini')
  assert.strictEqual(outageResult.model, 'Humanora-Linguistic-Engine-v2')
  assert.notStrictEqual(outageResult.engine, 'gemini')
  assert.ok(outageResult.warning && outageResult.warning.length > 0, 'Warning must accompany fallback')

  // ============================================================================
  // CHECKPOINT 5: Supabase Persistence Verification
  // ============================================================================
  console.log('\n▶ CHECKPOINT 5: Supabase PostgreSQL Live Persistence Verification...')
  const dbStatus = databaseService.getStatus()
  console.log(`  • Supabase Client Configured: ${dbStatus.isConfigured}`)
  console.log(`  • Active Provider: ${dbStatus.provider}`)
  console.log(`  • Schema Status: ${dbStatus.schemaStatus}`)

  const testSessionId = 'c069793a-654f-4a79-9ee8-fd261e186ee9'
  const testOriginal = 'Empirical evaluation of neural latency across distributed inference endpoints.'
  const testHumanized = 'Empirical testing assessed neural latency across distributed inference endpoints.'

  // 5A: Save non-sensitive test record
  console.log('  [5A] Inserting non-sensitive test transformation record...')
  const savedRecord = await databaseService.saveTransformation({
    sessionId: testSessionId,
    originalText: testOriginal,
    humanizedText: testHumanized,
    mode: 'academic',
    tone: 0.3,
    intensity: 'balanced',
    originalWords: 9,
    humanizedWords: 9,
    originalChars: testOriginal.length,
    humanizedChars: testHumanized.length,
    engine: 'gemini',
    modelVersion: 'gemini-3.5-flash-lite',
    latencyMs: 1420
  })

  console.log(`    ✓ Saved Record ID: ${savedRecord.id}`)
  console.log(`    ✓ Durable Storage Status: ${savedRecord.persistedDurable}`)
  console.log(`    ✓ Persistence Note: "${savedRecord.persistenceNote}"`)

  assert.ok(savedRecord.id, 'Record must have generated UUID')
  assert.strictEqual(savedRecord.persistedDurable, true, 'Record must be persisted durably to Supabase PostgreSQL')

  // 5B: Retrieve record by ID from PostgreSQL
  console.log('  [5B] Retrieving record by ID from PostgreSQL...')
  const retrievedRecord = await databaseService.getTransformationById(savedRecord.id, testSessionId)
  assert.ok(retrievedRecord !== null, 'Record must be retrievable from database')
  assert.strictEqual(retrievedRecord?.id, savedRecord.id)
  assert.strictEqual(retrievedRecord?.originalText, testOriginal)
  assert.strictEqual(retrievedRecord?.humanizedText, testHumanized)
  assert.strictEqual(retrievedRecord?.engine, 'gemini')
  console.log(`    ✓ Successfully retrieved and verified record fields from PostgreSQL`)

  // 5C: Verify record appears in History listing
  console.log('  [5C] Verifying record presence in history query...')
  const historyResult = await databaseService.getHistory(10, testSessionId)
  assert.strictEqual(historyResult.durableStorageActive, true)
  const foundInHistory = historyResult.history.find(h => h.id === savedRecord.id)
  assert.ok(foundInHistory !== undefined, 'Record must appear in history query')
  console.log(`    ✓ Record confirmed present in PostgreSQL history query (Total in batch: ${historyResult.count})`)

  // 5D: Clean up non-sensitive test record
  console.log('  [5D] Cleaning up test record from PostgreSQL...')
  const deleteSuccess = await databaseService.deleteTransformation(savedRecord.id, testSessionId)
  assert.strictEqual(deleteSuccess, true, 'Deletion must succeed')
  const afterDelete = await databaseService.getTransformationById(savedRecord.id, testSessionId)
  assert.strictEqual(afterDelete, null, 'Record must not exist after deletion')
  console.log(`    ✓ Test record successfully cleaned up from PostgreSQL (verified null)`)

  console.log('\n================================================================================')
  console.log('   ALL 5 LIVE INTEGRATION CHECKPOINTS COMPLETED SUCCESSFULLY WITH 0 FAILURES   ')
  console.log('================================================================================\n')
  process.exit(0)
}

runLiveVerification().catch(err => {
  console.error('\n✗ Live verification failed with unhandled exception:', err)
  process.exit(1)
})
