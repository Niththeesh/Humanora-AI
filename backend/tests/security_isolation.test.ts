import path from 'path'
import dotenv from 'dotenv'
import http, { Server } from 'http'
import crypto from 'crypto'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
process.env.NODE_ENV = 'test'

import express from 'express'
import cors from 'cors'
import aiRoutes from '../src/routes/ai'
import historyRoutes from '../src/routes/history'
import { sessionSecurityService } from '../src/services/sessionSecurityService'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/auth/login', (req, res) => {
  const { email, fullName } = req.body
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' })
  }
  const userHash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
  const userId = `${userHash.substring(0, 8)}-${userHash.substring(8, 12)}-4${userHash.substring(13, 16)}-a${userHash.substring(17, 20)}-${userHash.substring(20, 32)}`
  const token = sessionSecurityService.generateUserToken(userId)
  return res.json({
    success: true,
    user: {
      id: userId,
      email: email.trim(),
      fullName: (typeof fullName === 'string' && fullName.trim()) || email.split('@')[0],
      tier: 'pro',
      monthlyWordLimit: 100000
    },
    token
  })
})

app.use('/api/ai', aiRoutes)
app.use('/api/history', historyRoutes)

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

async function runSecurityIsolationTests() {
  console.log('=================================================================')
  console.log('   HUMANORA AI — SECURITY & MULTI-TENANT ISOLATION TEST SUITE    ')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ' — ' + detail : ''}`)
      failed++
    }
  }

  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))

  try {
    // 1. Setup Two Distinct Authenticated Users
    console.log('▶ [AUTH] Step 1: Provisioning Two Separate Authenticated Students')
    const loginA = await makeRequest(server, 'POST', '/api/auth/login', {
      email: 'student_alice@cambridge.ac.uk',
      fullName: 'Alice Scholar'
    })
    const userA = loginA.body.user
    const tokenA = loginA.body.token

    const loginB = await makeRequest(server, 'POST', '/api/auth/login', {
      email: 'student_bob@oxford.ac.uk',
      fullName: 'Bob Researcher'
    })
    const userB = loginB.body.user
    const tokenB = loginB.body.token

    assert(userA?.id && userB?.id && userA.id !== userB.id, 'Users have distinct unique user IDs')
    assert(tokenA && tokenB && tokenA !== tokenB, 'Users receive distinct cryptographic bearer tokens')

    // 2. Setup Two Distinct Guest Sessions
    console.log('\n▶ [GUEST] Step 2: Provisioning Two Separate Guest Sessions')
    const guestSession1 = crypto.randomUUID()
    const guestSession2 = crypto.randomUUID()
    assert(guestSession1 !== guestSession2, 'Guest sessions have distinct UUIDs')

    // 3. User A transforms text
    console.log('\n▶ [TRANSFORM] Step 3: Executing Transformations for User A & User B')
    const transformA = await makeRequest(
      server,
      'POST',
      '/api/ai/transform',
      {
        text: 'Alice empirical linguistic study (Chomsky, 1965) demonstrates 91.2% recursive syntax.',
        mode: 'academic',
        userId: userA.id
      },
      { Authorization: `Bearer ${tokenA}` }
    )
    assert(transformA.status === 200 && transformA.body.id, 'User A transformation succeeds and persists')
    const recordAId = transformA.body.id

    // 4. User B transforms text
    const transformB = await makeRequest(
      server,
      'POST',
      '/api/ai/transform',
      {
        text: 'Bob cognitive neuroscience research (Pinker, 1994) indicates 84.7% neural activation.',
        mode: 'academic',
        userId: userB.id
      },
      { Authorization: `Bearer ${tokenB}` }
    )
    assert(transformB.status === 200 && transformB.body.id, 'User B transformation succeeds and persists')
    const recordBId = transformB.body.id

    // 5. Guest 1 transforms text
    const transformG1 = await makeRequest(server, 'POST', '/api/ai/transform', {
      text: 'Guest 1 historical analysis reveals significant archival records across 12 centuries.',
      mode: 'academic',
      sessionId: guestSession1
    })
    assert(
      transformG1.status === 200 && transformG1.body.sessionToken,
      'Guest 1 transformation succeeds and receives signed sessionToken'
    )
    const recordG1Id = transformG1.body.id
    const tokenG1 = transformG1.body.sessionToken

    // 6. Guest 2 transforms text
    const transformG2 = await makeRequest(server, 'POST', '/api/ai/transform', {
      text: 'Guest 2 architectural engineering assessment shows structural integrity under seismic load.',
      mode: 'academic',
      sessionId: guestSession2
    })
    assert(
      transformG2.status === 200 && transformG2.body.sessionToken,
      'Guest 2 transformation succeeds and receives signed sessionToken'
    )
    const recordG2Id = transformG2.body.id
    const tokenG2 = transformG2.body.sessionToken

    // 7. Test User Isolation: User A listing history
    console.log('\n▶ [ISOLATION] Step 4: Testing History Isolation Between Authenticated Users')
    const historyA = await makeRequest(
      server,
      'GET',
      `/api/history?userId=${userA.id}`,
      undefined,
      { Authorization: `Bearer ${tokenA}` }
    )

    const idsInHistoryA = (historyA.body.history || []).map((h: any) => h.id)
    assert(idsInHistoryA.includes(recordAId), 'User A history includes User A record')
    assert(!idsInHistoryA.includes(recordBId), 'User A history does NOT include User B record (Tenant Isolation Verified)')

    // 8. Test Spoofing Attempt: User A attempts to list history with User B's ID
    const spoofAttempt = await makeRequest(
      server,
      'GET',
      `/api/history?userId=${userB.id}`,
      undefined,
      { Authorization: `Bearer ${tokenA}` }
    )
    assert(spoofAttempt.status === 403, 'User A attempting to query User B userId is blocked with 403 Forbidden')

    // 9. Unauthenticated attempt to query User B's history
    const unauthAttempt = await makeRequest(server, 'GET', `/api/history?userId=${userB.id}`)
    assert(unauthAttempt.status === 401, 'Unauthenticated query for userId without token is blocked with 401 Unauthorized')

    // 10. User A attempts to retrieve User B's record by ID
    const fetchBByA = await makeRequest(
      server,
      'GET',
      `/api/history/${recordBId}?userId=${userA.id}`,
      undefined,
      { Authorization: `Bearer ${tokenA}` }
    )
    assert(fetchBByA.status === 404, 'User A attempting to retrieve User B record returns 404 Not Found (Anti-Enumeration)')

    // 11. User A attempts to delete User B's record by ID
    const deleteBByA = await makeRequest(
      server,
      'DELETE',
      `/api/history/${recordBId}?userId=${userA.id}`,
      undefined,
      { Authorization: `Bearer ${tokenA}` }
    )
    assert(deleteBByA.status === 404, 'User A attempting to delete User B record returns 404 Not Found (Anti-Tampering)')

    // 12. Test Guest Isolation: Guest 1 vs Guest 2
    console.log('\n▶ [GUEST ISOLATION] Step 5: Testing Guest Session Proof-of-Possession')
    const historyG1 = await makeRequest(
      server,
      'GET',
      `/api/history?sessionId=${guestSession1}`,
      undefined,
      { 'x-session-token': tokenG1 }
    )
    const idsInG1 = (historyG1.body.history || []).map((h: any) => h.id)
    assert(idsInG1.includes(recordG1Id), 'Guest 1 history includes Guest 1 record')
    assert(!idsInG1.includes(recordG2Id), 'Guest 1 history does NOT include Guest 2 record')

    // 13. Guest 1 attempts to forge or access Guest 2's session with Guest 1's token
    const forgedGuestAttempt = await makeRequest(
      server,
      'GET',
      `/api/history?sessionId=${guestSession2}`,
      undefined,
      { 'x-session-token': tokenG1 }
    )
    assert(
      forgedGuestAttempt.status === 403,
      'Guest 1 attempting to query Guest 2 sessionId with mismatched token is blocked with 403'
    )

    // 14. Guest 1 attempts to fetch Guest 2's record
    const fetchG2ByG1 = await makeRequest(
      server,
      'GET',
      `/api/history/${recordG2Id}?sessionId=${guestSession1}`,
      undefined,
      { 'x-session-token': tokenG1 }
    )
    assert(fetchG2ByG1.status === 404, 'Guest 1 attempting to fetch Guest 2 record returns 404 Not Found')

    // 15. Guest 1 attempts to delete Guest 2's record
    const deleteG2ByG1 = await makeRequest(
      server,
      'DELETE',
      `/api/history/${recordG2Id}?sessionId=${guestSession1}`,
      undefined,
      { 'x-session-token': tokenG1 }
    )
    assert(deleteG2ByG1.status === 404, 'Guest 1 attempting to delete Guest 2 record returns 404 Not Found')

    // 16. Cleanup Authorized Test Records
    console.log('\n▶ [CLEANUP] Step 6: Cleaning Up Test Records with Valid Ownership')
    const delA = await makeRequest(
      server,
      'DELETE',
      `/api/history/${recordAId}?userId=${userA.id}`,
      undefined,
      { Authorization: `Bearer ${tokenA}` }
    )
    const delB = await makeRequest(
      server,
      'DELETE',
      `/api/history/${recordBId}?userId=${userB.id}`,
      undefined,
      { Authorization: `Bearer ${tokenB}` }
    )
    const delG1 = await makeRequest(
      server,
      'DELETE',
      `/api/history/${recordG1Id}?sessionId=${guestSession1}`,
      undefined,
      { 'x-session-token': tokenG1 }
    )
    const delG2 = await makeRequest(
      server,
      'DELETE',
      `/api/history/${recordG2Id}?sessionId=${guestSession2}`,
      undefined,
      { 'x-session-token': tokenG2 }
    )

    assert(delA.status === 200, 'User A cleans up record A successfully')
    assert(delB.status === 200, 'User B cleans up record B successfully')
    assert(delG1.status === 200, 'Guest 1 cleans up record G1 successfully')
    assert(delG2.status === 200, 'Guest 2 cleans up record G2 successfully')

    console.log('\n=================================================================')
    console.log(`Security Test Suite Completed: ${passed} PASSED, ${failed} FAILED`)
    console.log('=================================================================')

    server.close()
    if (failed > 0) {
      process.exit(1)
    }
    process.exit(0)
  } catch (err) {
    server.close()
    console.error('Test error:', err)
    process.exit(1)
  }
}

runSecurityIsolationTests()
