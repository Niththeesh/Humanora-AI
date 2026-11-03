import assert from 'assert'
import http, { Server } from 'http'
import express from 'express'
import cors from 'cors'
import { SessionCacheService, CachedTransformation } from '../src/services/sessionCacheService'
import aiRoutes from '../src/routes/ai'
import humanizeRoutes from '../src/routes/humanize'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeRequest(
  server: Server,
  method: string,
  reqPath: string,
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

    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        method,
        path: reqPath,
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

async function runSessionCacheTestSuite() {
  console.log('=================================================================')
  console.log('   HUMANORA AI — THREAD-SAFE SESSION CACHE & CONCURRENCY SUITE   ')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function testAssert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ' — ' + detail : ''}`)
      failed++
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Basic Hit / Miss & Storage
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 1] Basic Cache Hit, Miss, and Storage')
  const cache1 = new SessionCacheService({ ttlMs: 1000, maxCapacity: 10 })
  const key1 = cache1.getCacheKey({ text: 'Sample academic hypothesis for testing.', mode: 'academic' })

  testAssert(!cache1.has(key1), 'Cache initially does not have key1')
  testAssert(cache1.get(key1) === null, 'Cache get returns null on cold miss')

  let computeCount1 = 0
  const computeFn1 = async (): Promise<CachedTransformation> => {
    computeCount1++
    return {
      humanizedText: 'Sample academic hypothesis for testing, refined.',
      originalText: 'Sample academic hypothesis for testing.',
      mode: 'academic',
      engine: 'gemini',
      model: 'gemini-3.5-flash-lite',
      parameters: { tone: 0.5, intensity: 'balanced' },
      stats: {
        originalLength: 39,
        humanizedLength: 48,
        originalWords: 5,
        humanizedWords: 6,
        processingTimeMs: 45
      }
    }
  }

  const res1 = await cache1.getOrCompute(key1, computeFn1)
  testAssert(computeCount1 === 1, 'Computer function called once on initial miss')
  testAssert(res1.humanizedText.includes('refined'), 'Received computed transformation')
  testAssert(cache1.has(key1), 'Cache now contains key1')

  // Immediate second read must hit cache without invoking computer
  const res2 = await cache1.getOrCompute(key1, computeFn1)
  testAssert(computeCount1 === 1, 'Computer function NOT called again on cache hit (Hit confirmed)')
  testAssert(res2.humanizedText === res1.humanizedText, 'Cached response matches original')

  const stats1 = cache1.getStats()
  testAssert(stats1.hits === 1 && stats1.misses === 2, 'Cache statistics record 1 hit and 2 misses')

  // --------------------------------------------------------------------------
  // TEST 2: Concurrent Race Condition & Cache Stampede (Single-Flight Coalescing)
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 2] Concurrent Race Condition & Single-Flight Coalescing (Thundering Herd Prevention)')
  const cache2 = new SessionCacheService({ ttlMs: 5000, maxCapacity: 20 })
  const sharedKey = cache2.getCacheKey({
    text: 'High-concurrency stress test with 30 concurrent requests arriving simultaneously.',
    mode: 'academic'
  })

  let expensiveCallCount = 0
  const expensiveTransformer = async (): Promise<CachedTransformation> => {
    expensiveCallCount++
    // Simulate real Gemini network latency of 120ms
    await sleep(120)
    return {
      humanizedText: 'Concurrent stress test verified without stampede.',
      originalText: 'High-concurrency stress test with 30 concurrent requests arriving simultaneously.',
      mode: 'academic',
      engine: 'gemini',
      model: 'gemini-3.5-flash-lite',
      parameters: { tone: 0.25 },
      stats: {
        originalLength: 81,
        humanizedLength: 49,
        originalWords: 10,
        humanizedWords: 6,
        processingTimeMs: 120
      }
    }
  }

  // Fire 30 concurrent async requests simultaneously
  const CONCURRENT_REQUESTS = 30
  const promises = Array.from({ length: CONCURRENT_REQUESTS }, () =>
    cache2.getOrCompute(sharedKey, expensiveTransformer)
  )

  testAssert(cache2.isInFlight(sharedKey), 'Key is actively marked in-flight during concurrent execution')

  const results = await Promise.all(promises)
  testAssert(!cache2.isInFlight(sharedKey), 'Key in-flight status is cleared after resolution')

  testAssert(
    expensiveCallCount === 1,
    `Expensive transformer executed EXACTLY ONCE across ${CONCURRENT_REQUESTS} concurrent requests (Race Condition Neutralized)`,
    `Actual call count: ${expensiveCallCount}`
  )

  testAssert(
    results.length === CONCURRENT_REQUESTS && results.every((r) => r.humanizedText.includes('verified')),
    `All ${CONCURRENT_REQUESTS} concurrent callers received identical valid transformation results`
  )

  const stats2 = cache2.getStats()
  testAssert(
    stats2.inFlightCoalesced === CONCURRENT_REQUESTS - 1,
    `Exactly ${CONCURRENT_REQUESTS - 1} concurrent requests coalesced into the single flight`
  )

  // --------------------------------------------------------------------------
  // TEST 3: In-Flight Failure Isolation & Self-Healing
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 3] In-Flight Failure Isolation & Lock Recovery')
  const cache3 = new SessionCacheService()
  const failKey = cache3.getCacheKey({ text: 'Text destined to fail during generation.', mode: 'academic' })

  let failedAttemptCount = 0
  const failingTransformer = async (): Promise<CachedTransformation> => {
    failedAttemptCount++
    await sleep(50)
    throw new Error('Simulated Gemini 503 Outage')
  }

  // Fire 5 concurrent requests that will all fail
  const failingPromises = Array.from({ length: 5 }, () =>
    cache3.getOrCompute(failKey, failingTransformer)
  )

  let errorCaughtCount = 0
  await Promise.all(
    failingPromises.map((p) =>
      p.catch((err) => {
        if (err.message.includes('Simulated Gemini 503 Outage')) errorCaughtCount++
      })
    )
  )

  testAssert(errorCaughtCount === 5, 'All 5 concurrent callers caught the rejection cleanly')
  testAssert(failedAttemptCount === 1, 'Failing computation only ran once during single-flight')
  testAssert(!cache3.isInFlight(failKey), 'In-flight lock released in finally block despite error')
  testAssert(!cache3.has(failKey), 'Failed result was NOT cached as a valid response')

  // Subsequent request must be able to succeed and not be poisoned
  let retrySucceeded = false
  try {
    const recovered = await cache3.getOrCompute(failKey, async () => ({
      humanizedText: 'Recovered successfully on retry.',
      originalText: 'Text destined to fail during generation.',
      mode: 'academic',
      engine: 'gemini',
      model: 'gemini-3.5-flash-lite',
      parameters: {},
      stats: { originalLength: 40, humanizedLength: 32, originalWords: 6, humanizedWords: 4, processingTimeMs: 10 }
    }))
    retrySucceeded = Boolean(recovered && recovered.humanizedText.includes('Recovered'))
  } catch (_) {}

  testAssert(retrySucceeded, 'Subsequent request cleanly executed and succeeded after prior in-flight failure')

  // --------------------------------------------------------------------------
  // TEST 4: Full-Text SHA-256 Collision Immunity (Prefix Truncation Flaw Fix)
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 4] Full-Text SHA-256 Collision Immunity')
  const cache4 = new SessionCacheService()

  // Two texts that share the first 120 characters identically, but differ afterwards
  const prefix = 'The foundational principles of distributed systems dictate that under network partitioning, ' +
                 'a cluster can guarantee either consistency or availability but not both simultaneously. ' // 190 chars
  const textA = prefix + 'Furthermore, Paxos consensus ensures linearizable log replication.'
  const textB = prefix + 'In contrast, Raft consensus simplifies state transitions through leader elections.'

  const keyA = cache4.getCacheKey({ text: textA, mode: 'academic' })
  const keyB = cache4.getCacheKey({ text: textB, mode: 'academic' })

  testAssert(keyA !== keyB, 'Keys are strictly distinct despite sharing 190-character identical prefix')

  await cache4.getOrCompute(keyA, async () => ({
    humanizedText: 'Result for Text A (Paxos).',
    originalText: textA,
    mode: 'academic',
    engine: 'gemini',
    model: 'gemini-3.5-flash-lite',
    parameters: {},
    stats: { originalLength: textA.length, humanizedLength: 26, originalWords: 30, humanizedWords: 5, processingTimeMs: 10 }
  }))

  await cache4.getOrCompute(keyB, async () => ({
    humanizedText: 'Result for Text B (Raft).',
    originalText: textB,
    mode: 'academic',
    engine: 'gemini',
    model: 'gemini-3.5-flash-lite',
    parameters: {},
    stats: { originalLength: textB.length, humanizedLength: 25, originalWords: 30, humanizedWords: 5, processingTimeMs: 10 }
  }))

  const fetchedA = cache4.get(keyA)
  const fetchedB = cache4.get(keyB)
  testAssert(Boolean(fetchedA?.humanizedText.includes('Paxos') && fetchedB?.humanizedText.includes('Raft')), 'No cross-key contamination occurred')

  // --------------------------------------------------------------------------
  // TEST 5: Parameter-Aware Differentiation
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 5] Parameter-Aware Key Derivation')
  const baseText = 'Empirical analysis shows positive correlation.'
  const keyFormal = cache4.getCacheKey({ text: baseText, mode: 'academic', tone: 0.1 })
  const keyCasual = cache4.getCacheKey({ text: baseText, mode: 'casual', tone: 0.9 })
  const keyVoice = cache4.getCacheKey({ text: baseText, mode: 'academic', authorVoice: 'journalistic' })

  testAssert(keyFormal !== keyCasual, 'Different mode and tone produce distinct keys')
  testAssert(keyFormal !== keyVoice, 'Different authorVoice produces distinct keys')

  // --------------------------------------------------------------------------
  // TEST 6: TTL Expiration
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 6] TTL Expiration & Automatic Purging')
  const cache6 = new SessionCacheService({ ttlMs: 60 }) // 60ms TTL
  const key6 = cache6.getCacheKey({ text: 'Short-lived cache entry.', mode: 'academic' })

  await cache6.getOrCompute(key6, async () => ({
    humanizedText: 'Short-lived value.',
    originalText: 'Short-lived cache entry.',
    mode: 'academic',
    engine: 'gemini',
    model: 'gemini-3.5-flash-lite',
    parameters: {},
    stats: { originalLength: 25, humanizedLength: 18, originalWords: 3, humanizedWords: 2, processingTimeMs: 5 }
  }))

  testAssert(cache6.has(key6), 'Entry present immediately after set')
  await sleep(80) // wait past 60ms TTL
  testAssert(!cache6.has(key6), 'Entry expired and purged after TTL elapsed')

  // --------------------------------------------------------------------------
  // TEST 7: Bounded Capacity & Atomic LRU Eviction
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 7] Bounded Capacity & LRU Eviction')
  const cache7 = new SessionCacheService({ maxCapacity: 3, ttlMs: 10000 })

  const k1 = cache7.getCacheKey({ text: 'Doc 1', mode: 'academic' })
  const k2 = cache7.getCacheKey({ text: 'Doc 2', mode: 'academic' })
  const k3 = cache7.getCacheKey({ text: 'Doc 3', mode: 'academic' })
  const k4 = cache7.getCacheKey({ text: 'Doc 4', mode: 'academic' })

  const dummyTransform = (t: string): CachedTransformation => ({
    humanizedText: `Humanized ${t}`,
    originalText: t,
    mode: 'academic',
    engine: 'gemini',
    model: 'gemini-3.5-flash-lite',
    parameters: {},
    stats: { originalLength: t.length, humanizedLength: t.length + 10, originalWords: 2, humanizedWords: 3, processingTimeMs: 5 }
  })

  cache7.set(k1, dummyTransform('Doc 1'))
  cache7.set(k2, dummyTransform('Doc 2'))
  cache7.set(k3, dummyTransform('Doc 3'))

  testAssert(cache7.getStats().size === 3, 'Cache at max capacity (3/3)')

  // Access k1 to promote it to most recently used
  cache7.get(k1)

  // Insert k4 -> should evict k2 (least recently used, since k1 was accessed)
  cache7.set(k4, dummyTransform('Doc 4'))

  testAssert(cache7.getStats().size === 3, 'Cache maintained maximum capacity limit (3/3)')
  testAssert(cache7.has(k1), 'Recently accessed key k1 was retained')
  testAssert(!cache7.has(k2), 'Least recently used key k2 was cleanly evicted')
  testAssert(cache7.has(k3) && cache7.has(k4), 'Keys k3 and k4 present in cache')
  testAssert(cache7.getStats().evictions === 1, 'Eviction count recorded exactly 1')

  // --------------------------------------------------------------------------
  // TEST 8: Full End-to-End Express Concurrency & Multi-Tenant Session Isolation
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 8] End-to-End Express Concurrency & Multi-Tenant History Isolation')
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use('/api/ai', aiRoutes)
  app.use('/api/humanize', humanizeRoutes)

  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))

  try {
    const guestSessionAlice = 'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa'
    const guestSessionBob = 'bbbb2222-bbbb-4222-8222-bbbbbbbbbbbb'
    const identicalText = 'Recent empirical observations indicate robust parallelization across multi-core accelerators.'

    // Dispatch two concurrent HTTP POST requests with identical text from Alice and Bob
    const [resAlice, resBob] = await Promise.all([
      makeRequest(server, 'POST', '/api/ai/transform', {
        text: identicalText,
        mode: 'academic',
        sessionId: guestSessionAlice
      }),
      makeRequest(server, 'POST', '/api/ai/transform', {
        text: identicalText,
        mode: 'academic',
        sessionId: guestSessionBob
      })
    ])

    testAssert(resAlice.status === 200, 'Alice request succeeded with 200 OK')
    testAssert(resBob.status === 200, 'Bob request succeeded with 200 OK')

    // Both must receive valid humanized text
    testAssert(
      typeof resAlice.body.humanizedText === 'string' && resAlice.body.humanizedText.length > 0,
      'Alice received valid transformed prose'
    )
    testAssert(
      typeof resBob.body.humanizedText === 'string' && resBob.body.humanizedText.length > 0,
      'Bob received valid transformed prose'
    )

    // Crucial Multi-Tenant Isolation Check:
    // Even though transformation was cached/coalesced, their database record IDs and session tokens MUST BE DISTINCT
    testAssert(
      resAlice.body.id && resBob.body.id && resAlice.body.id !== resBob.body.id,
      'Alice and Bob received distinct, unique database record IDs (No cross-tenant ID leakage)'
    )
    testAssert(
      resAlice.body.sessionToken && resBob.body.sessionToken && resAlice.body.sessionToken !== resBob.body.sessionToken,
      'Alice and Bob received distinct cryptographic session tokens'
    )
    testAssert(
      resAlice.body.sessionToken.startsWith(guestSessionAlice),
      'Alice session token cryptographically bound to Alice session ID'
    )
    testAssert(
      resBob.body.sessionToken.startsWith(guestSessionBob),
      'Bob session token cryptographically bound to Bob session ID'
    )

    // Test Backward-Compatible /api/humanize endpoint with concurrent requests
    const [resH1, resH2] = await Promise.all([
      makeRequest(server, 'POST', '/api/humanize', {
        text: 'Secondary compatibility test prose for legacy humanize endpoint.',
        mode: 'academic',
        sessionId: guestSessionAlice
      }),
      makeRequest(server, 'POST', '/api/humanize', {
        text: 'Secondary compatibility test prose for legacy humanize endpoint.',
        mode: 'academic',
        sessionId: guestSessionBob
      })
    ])

    testAssert(resH1.status === 200 && resH2.status === 200, 'Legacy /api/humanize handles concurrent requests with 200 OK')
    testAssert(
      resH1.body.humanizedText === resH2.body.humanizedText,
      'Legacy /api/humanize serves identical deterministic transformation without race condition'
    )
  } finally {
    server.close()
  }

  console.log('\n=================================================================')
  console.log(`Session Cache Test Suite: ${passed} PASSED, ${failed} FAILED`)
  console.log('=================================================================')

  if (failed > 0) {
    process.exit(1)
  }
  process.exit(0)
}

runSessionCacheTestSuite().catch((err) => {
  console.error('Test suite uncaught error:', err)
  process.exit(1)
})
