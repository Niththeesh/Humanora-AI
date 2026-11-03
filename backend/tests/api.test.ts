import assert from 'assert'
import dotenv from 'dotenv'
import path from 'path'
import { Server } from 'http'

// Load environment and configure test mode before importing application
dotenv.config({ path: path.resolve(__dirname, '../.env') })
process.env.NODE_ENV = 'test'

const app = require('../src/server').default

// Simple HTTP client helper for testing without requiring heavy external test dependencies
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

async function runTests() {
  console.log('--- Starting Humanora AI Automated API Test Suite ---')
  process.env.NODE_ENV = 'test'

  // Start test server on random port
  const server = app.listen(0)
  let passed = 0
  let failed = 0

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn()
      console.log(`  [PASS] ${name}`)
      passed++
    } catch (err: any) {
      console.error(`  [FAIL] ${name}: ${err.message}`)
      failed++
    }
  }

  try {
    // 1. Health check
    await test('GET /api/health returns 200 with service status', async () => {
      const res = await request(server, 'GET', '/api/health')
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.status, 'ok')
      assert.strictEqual(res.body.brand, 'Humanora AI')
      assert.strictEqual(res.body.tagline, 'Write Naturally. Express Authentically.')
      assert.ok(res.body.services)
      assert.ok(res.body.services.ai)
      assert.ok(res.body.services.database)
    })

    // 2. Config check
    await test('GET /api/ai/config returns available modes & quotas', async () => {
      const res = await request(server, 'GET', '/api/ai/config')
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.brand, 'Humanora AI')
      assert.strictEqual(res.body.tagline, 'Write Naturally. Express Authentically.')
      assert.ok(Array.isArray(res.body.modes))
      assert.strictEqual(res.body.modes.length, 10)
      assert.ok(res.body.limits)
    })

    // 3. Validation: Empty text
    await test('POST /api/ai/transform rejects empty text with 400', async () => {
      const res = await request(server, 'POST', '/api/ai/transform', { text: '   ' })
      assert.strictEqual(res.status, 400)
      assert.strictEqual(res.body.error, 'Empty text')
    })

    // 4. Validation: Missing text
    await test('POST /api/ai/transform rejects missing text with 400', async () => {
      const res = await request(server, 'POST', '/api/ai/transform', {})
      assert.strictEqual(res.status, 400)
      assert.strictEqual(res.body.error, 'Invalid input')
    })

    // 5. Validation: Oversized text
    await test('POST /api/ai/transform rejects oversized text (>50k chars)', async () => {
      const longText = 'a'.repeat(50001)
      const res = await request(server, 'POST', '/api/ai/transform', { text: longText })
      assert.strictEqual(res.status, 400)
      assert.strictEqual(res.body.error, 'Text too long')
    })

    // 6. Valid Transformation
    const testSessionId = '99999999-9999-9999-9999-999999999999'
    let createdId: string = ''
    await test('POST /api/ai/transform successfully processes text', async () => {
      const sampleText = 'The utilization of algorithmic structures demonstrates a substantial increment in computational velocity.'
      const res = await request(server, 'POST', '/api/ai/transform', {
        text: sampleText,
        mode: 'natural',
        tone: 0.5,
        intensity: 'balanced',
        targetLength: 'same',
        vocabulary: true,
        highlights: true,
        sessionId: testSessionId
      })

      assert.strictEqual(res.status, 200)
      assert.ok(res.body.humanizedText)
      assert.strictEqual(res.body.originalText, sampleText)
      assert.strictEqual(res.body.mode, 'natural')
      assert.ok(res.body.stats)
      assert.ok(res.body.stats.originalWords > 0)
      assert.ok(res.body.id)
      createdId = res.body.id
    })

    // 7. History retrieval scoped to session
    await test('GET /api/history returns saved transformations for authenticated session', async () => {
      const res = await request(server, 'GET', `/api/history?limit=10&sessionId=${testSessionId}`)
      assert.strictEqual(res.status, 200)
      assert.ok(Array.isArray(res.body.history))
      assert.ok(res.body.history.length >= 1)
      const found = res.body.history.some((h: any) => h.id === createdId)
      assert.ok(found, 'Created transformation should be present in session history')
    })

    // 7B. Security: Unauthenticated history prevents data leak
    await test('GET /api/history without session/user prevents cross-tenant data leak', async () => {
      const res = await request(server, 'GET', '/api/history?limit=10')
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.history.length, 0, 'Must return 0 records without session identification')
    })

    // 8. History item lookup with session ownership
    await test('GET /api/history/:id retrieves specific item with session ownership', async () => {
      const res = await request(server, 'GET', `/api/history/${createdId}?sessionId=${testSessionId}`)
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.id, createdId)
    })

    // 8B. Security: History item lookup without session ownership returns 404 (anti-enumeration)
    await test('GET /api/history/:id without session ownership rejects with 404', async () => {
      const res = await request(server, 'GET', `/api/history/${createdId}`)
      assert.strictEqual(res.status, 404)
    })

    // 8C. Security: History item lookup with foreign session returns 404
    await test('GET /api/history/:id with foreign session rejects with 404', async () => {
      const res = await request(server, 'GET', `/api/history/${createdId}?sessionId=00000000-0000-0000-0000-000000000000`)
      assert.strictEqual(res.status, 404)
    })

    // 9. History item deletion with ownership
    await test('DELETE /api/history/:id deletes item with session ownership', async () => {
      const res = await request(server, 'DELETE', `/api/history/${createdId}?sessionId=${testSessionId}`)
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.success, true)

      // Confirm item is gone
      const verifyRes = await request(server, 'GET', `/api/history/${createdId}?sessionId=${testSessionId}`)
      assert.strictEqual(verifyRes.status, 404)
    })

    // 10. Backward compatibility with /api/humanize
    await test('POST /api/humanize preserves backward compatibility', async () => {
      const res = await request(server, 'POST', '/api/humanize', {
        text: 'This is a test of backward compatibility.',
        mode: 'standard',
        tone: 0.5,
        complexity: 0.5
      })
      assert.strictEqual(res.status, 200)
      assert.ok(res.body.humanizedText)
      assert.strictEqual(res.body.mode, 'standard')
    })

    // 11. Batch endpoint functionality
    await test('POST /api/batch processes document list', async () => {
      const res = await request(server, 'POST', '/api/batch', {
        documents: [
          {
            id: 'doc1.txt',
            text: 'First document text for batch processing.',
            mode: 'natural',
            tone: 0.5,
            complexity: 0.5,
            vocabulary: false
          }
        ]
      })
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.total, 1)
      assert.strictEqual(res.body.successful, 1)
    })

    // 12. AI Detector: empty and whitespace input validation
    await test('POST /api/detect rejects empty or whitespace text with 400', async () => {
      const emptyRes = await request(server, 'POST', '/api/detect', { text: '' })
      assert.strictEqual(emptyRes.status, 400)
      assert.strictEqual(emptyRes.body.success, false)

      const spaceRes = await request(server, 'POST', '/api/detect', { text: '    ' })
      assert.strictEqual(spaceRes.status, 400)
      assert.strictEqual(spaceRes.body.success, false)
    })

    // 13. AI Detector: oversized payload validation
    await test('POST /api/detect rejects oversized text exceeding 50,000 characters with 400', async () => {
      const oversizedText = 'A'.repeat(50001)
      const res = await request(server, 'POST', '/api/detect', { text: oversizedText })
      assert.strictEqual(res.status, 400)
      assert.strictEqual(res.body.success, false)
      assert.ok(res.body.message.includes('50,000'))
    })

    // 14. AI Detector: honest heuristic signals and scoring
    await test('POST /api/detect computes real signals and transparent disclaimers', async () => {
      const sampleText = 'Moreover, it is important to note that artificial intelligence plays a crucial role in modern society. Furthermore, we must delve into this tapestry to unpack its multifaceted implications.'
      const res = await request(server, 'POST', '/api/detect', { text: sampleText })
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.success, true)
      assert.strictEqual(typeof res.body.aiScore, 'number')
      assert.strictEqual(typeof res.body.humanScore, 'number')
      assert.strictEqual(res.body.aiScore + res.body.humanScore, 100)
      assert.ok(['Low', 'Medium', 'High'].includes(res.body.verdict))
      assert.ok(res.body.signals)
      assert.strictEqual(typeof res.body.signals.burstiness.score, 'number')
      assert.strictEqual(typeof res.body.signals.lexicalDiversity.typeTokenRatio, 'number')
      assert.strictEqual(typeof res.body.signals.clicheDensity.count, 'number')
      assert.strictEqual(typeof res.body.signals.repetitiveNgrams.rate, 'number')
      assert.strictEqual(typeof res.body.signals.transitionUniformity.formulaicOpenerCount, 'number')
      assert.ok(Array.isArray(res.body.sentenceAnalysis))
      assert.ok(res.body.sentenceAnalysis.length >= 2)
      // Clichés detected in sampleText
      assert.ok(res.body.signals.clicheDensity.foundCliches.length > 0)
      // Must contain honest non-guarantee disclaimer
      assert.ok(res.body.disclaimer.includes('Estimate based on writing patterns'))
      assert.ok(res.body.disclaimer.includes('not a guarantee'))
    })

    // 15. AI Detector: router alias POST /api/ai/detect
    await test('POST /api/ai/detect functions identically via router mount', async () => {
      const res = await request(server, 'POST', '/api/ai/detect', {
        text: 'The 2024 survey showed that 45% of students used digital notes. Short sentence here. But when we look closer at the archives, different trends emerge across secondary schools.'
      })
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.body.success, true)
      assert.ok(res.body.aiScore < 70) // Varied lengths and factual numbers
    })

  } finally {
    server.close()
  }

  console.log(`\nTest Run Summary: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    process.exit(1)
  }
  process.exit(0)
}

runTests().catch(err => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
