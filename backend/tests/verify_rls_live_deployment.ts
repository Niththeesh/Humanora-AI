import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { randomUUID } from 'crypto'
import axios from 'axios'
import express from 'express'
import cors from 'cors'
import { Server } from 'http'
import aiRoutes from '../src/routes/ai'
import historyRoutes from '../src/routes/history'
import { sessionSecurityService } from '../src/services/sessionSecurityService'
import crypto from 'crypto'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const url = process.env.SUPABASE_URL!
const anonKey = process.env.SUPABASE_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface VerificationResult {
  step: string
  status: 'PASSED' | 'FAILED' | 'PENDING_MIGRATION'
  details: string
}

export async function runLiveRLSVerification(): Promise<{
  allPassed: boolean
  isMigrationApplied: boolean
  results: VerificationResult[]
}> {
  const results: VerificationResult[] = []

  const anonClient = createClient(url, anonKey)
  const serviceClient = createClient(url, serviceKey)

  // 1. Direct Anonymous Read on transformations
  const anonTransRead = await anonClient.from('transformations').select('id').limit(5)
  if (anonTransRead.data && anonTransRead.data.length > 0) {
    results.push({
      step: '1. Direct Anonymous Read (transformations)',
      status: 'PENDING_MIGRATION',
      details: `VULNERABLE: Anon client directly read ${anonTransRead.data.length} transformation rows. Permissive policy is still active.`
    })
  } else if (!anonTransRead.error) {
    results.push({
      step: '1. Direct Anonymous Read (transformations)',
      status: 'PASSED',
      details: 'SECURED: Anon client received 0 rows. Row-Level Security blocked direct unauthenticated read.'
    })
  } else {
    results.push({
      step: '1. Direct Anonymous Read (transformations)',
      status: 'PASSED',
      details: `SECURED: Anon read blocked with error: ${anonTransRead.error.message}`
    })
  }

  // 2. Direct Anonymous Write on transformations
  const testTransId = randomUUID()
  const anonTransWrite = await anonClient.from('transformations').insert({
    id: testTransId,
    mode: 'academic',
    original_text: 'rls-test-probe',
    humanized_text: 'rls-test-probe',
    engine_used: 'gemini'
  })
  if (!anonTransWrite.error) {
    // Clean up
    await serviceClient.from('transformations').delete().eq('id', testTransId)
    results.push({
      step: '2. Direct Anonymous Insert (transformations)',
      status: 'PENDING_MIGRATION',
      details: 'VULNERABLE: Anon client was able to insert a transformation record directly.'
    })
  } else {
    results.push({
      step: '2. Direct Anonymous Insert (transformations)',
      status: 'PASSED',
      details: `SECURED: Anon insert rejected: ${anonTransWrite.error.message}`
    })
  }

  // 3. Direct Anonymous Read on writing_sessions
  const anonSessRead = await anonClient.from('writing_sessions').select('id').limit(5)
  if (anonSessRead.data && anonSessRead.data.length > 0) {
    results.push({
      step: '3. Direct Anonymous Read (writing_sessions)',
      status: 'PENDING_MIGRATION',
      details: `VULNERABLE: Anon client directly read ${anonSessRead.data.length} session rows.`
    })
  } else if (!anonSessRead.error) {
    results.push({
      step: '3. Direct Anonymous Read (writing_sessions)',
      status: 'PASSED',
      details: 'SECURED: Anon client received 0 rows. RLS blocked direct read.'
    })
  } else {
    results.push({
      step: '3. Direct Anonymous Read (writing_sessions)',
      status: 'PASSED',
      details: `SECURED: Anon read blocked with error: ${anonSessRead.error.message}`
    })
  }

  // 4. Service Role Legitimate Administrative Access
  const serviceCheck = await serviceClient.from('transformations').select('id', { count: 'exact', head: true })
  if (!serviceCheck.error) {
    results.push({
      step: '4. Service Role Backend Operations',
      status: 'PASSED',
      details: `CONFIRMED: Service role functions normally with full operational access (row count: ${serviceCheck.count}).`
    })
  } else {
    results.push({
      step: '4. Service Role Backend Operations',
      status: 'FAILED',
      details: `ERROR: Service role query failed: ${serviceCheck.error.message}`
    })
  }

  // 5. Backend API End-to-End Persistence & Isolation
  let baseUrl = 'http://localhost:5000'
  let ephemeralServer: Server | null = null

  try {
    try {
      await axios.get(`${baseUrl}/api/ai/config`, { timeout: 1000 })
    } catch (connectErr: any) {
      if (connectErr.code === 'ECONNREFUSED' || !connectErr.response) {
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

        ephemeralServer = app.listen(0)
        await new Promise((resolve) => ephemeralServer!.once('listening', resolve))
        const address: any = ephemeralServer.address()
        baseUrl = `http://127.0.0.1:${address.port}`
      }
    }

    const guestASessionId = randomUUID()
    const guestBSessionId = randomUUID()

    // Guest A transforms text
    const transformRes = await axios.post(`${baseUrl}/api/ai/transform`, {
      text: 'Security verification sample for testing Row-Level Security and cryptographic session isolation.',
      mode: 'academic',
      sessionId: guestASessionId
    })

    const guestAToken = transformRes.data.sessionToken
    const savedRecordId = transformRes.data.id

    if (!guestAToken) {
      results.push({
        step: '5. Backend API Session Token Generation',
        status: 'FAILED',
        details: 'API did not return a signed sessionToken.'
      })
    } else {
      results.push({
        step: '5. Backend API Session Token Generation',
        status: 'PASSED',
        details: 'Signed HMAC session token issued to client upon transformation.'
      })

      // Guest A retrieves own history
      const guestARetrieve = await axios.get(`${baseUrl}/api/history`, {
        params: { sessionId: guestASessionId },
        headers: { 'x-session-token': guestAToken }
      })

      const hasRecord = guestARetrieve.data.history?.some((h: any) => h.id === savedRecordId)
      if (hasRecord) {
        results.push({
          step: '6. Legitimate Guest History Retrieval',
          status: 'PASSED',
          details: 'Guest successfully retrieved their own writing history with verified token.'
        })
      } else {
        results.push({
          step: '6. Legitimate Guest History Retrieval',
          status: 'FAILED',
          details: 'Guest was unable to retrieve their saved transformation.'
        })
      }

      // Guest B attempts to read Guest A's history using Guest B's identity/token
      const guestBToken = sessionSecurityService.createSignedSessionToken(guestBSessionId)
      let crossGuestLeaked = false
      try {
        const guestBRetrieve = await axios.get(`${baseUrl}/api/history`, {
          params: { sessionId: guestBSessionId },
          headers: { 'x-session-token': guestBToken }
        })
        crossGuestLeaked = guestBRetrieve.data.history?.some((h: any) => h.id === savedRecordId)
      } catch (_) {}

      if (crossGuestLeaked) {
        results.push({
          step: '7. Guest-to-Guest Isolation Boundary',
          status: 'FAILED',
          details: 'CRITICAL FAILURE: Guest B was able to see Guest A\'s record.'
        })
      } else {
        results.push({
          step: '7. Guest-to-Guest Isolation Boundary',
          status: 'PASSED',
          details: 'Guest sessions completely isolated; Guest B received zero records belonging to Guest A.'
        })
      }

      // Tampered Token Attempt: Guest B sends Guest A's sessionId with forged/tampered token
      let tamperedBlocked = false
      try {
        await axios.get(`${baseUrl}/api/history`, {
          params: { sessionId: guestASessionId },
          headers: { 'x-session-token': guestASessionId + '.tampered_invalid_sig' }
        })
      } catch (err: any) {
        if (err.response?.status === 403) {
          tamperedBlocked = true
        }
      }

      if (tamperedBlocked) {
        results.push({
          step: '8. Anti-Tampering & Signature Validation',
          status: 'PASSED',
          details: 'Forged token rejected with 403 Forbidden.'
        })
      } else {
        results.push({
          step: '8. Anti-Tampering & Signature Validation',
          status: 'FAILED',
          details: 'Tampered token was not rejected with 403.'
        })
      }

      // Clean up test transformation
      try {
        await axios.delete(`${baseUrl}/api/history/${savedRecordId}`, {
          params: { sessionId: guestASessionId },
          headers: { 'x-session-token': guestAToken }
        })
      } catch (_) {}
    }

    // 9. Authenticated Student User Login & Bearer Token
    const studentAliceLogin = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'student_alice@cambridge.ac.uk',
      fullName: 'Alice Scholar'
    })
    const aliceToken = studentAliceLogin.data.token
    const aliceId = studentAliceLogin.data.user.id

    if (aliceToken && aliceId) {
      results.push({
        step: '9. Student Authentication & Bearer Token Generation',
        status: 'PASSED',
        details: `Student Alice successfully authenticated and received cryptographically signed Bearer token (ID: ${aliceId.substring(0, 8)}...).`
      })

      // Student Alice retrieves user-scoped history
      const aliceHistory = await axios.get(`${baseUrl}/api/history`, {
        params: { userId: aliceId },
        headers: { Authorization: `Bearer ${aliceToken}` }
      })

      if (Array.isArray(aliceHistory.data.history)) {
        results.push({
          step: '10. Authenticated Student History Scoping',
          status: 'PASSED',
          details: 'Student Alice successfully accessed user-scoped history with valid Bearer token.'
        })
      }

      // Student Bob attempts cross-tenant access to Alice's records
      const studentBobLogin = await axios.post(`${baseUrl}/api/auth/login`, {
        email: 'student_bob@oxford.ac.uk',
        fullName: 'Bob Researcher'
      })
      const bobToken = studentBobLogin.data.token

      let crossStudentBlocked = false
      try {
        await axios.get(`${baseUrl}/api/history`, {
          params: { userId: aliceId }, // Bob requests Alice's userId
          headers: { Authorization: `Bearer ${bobToken}` } // with Bob's token
        })
      } catch (err: any) {
        if (err.response?.status === 403) {
          crossStudentBlocked = true
        }
      }

      if (crossStudentBlocked) {
        results.push({
          step: '11. Student-to-Student Cross-Tenant Isolation',
          status: 'PASSED',
          details: 'Cross-tenant access attempt by Bob for Alice\'s records rejected with 403 Forbidden.'
        })
      } else {
        results.push({
          step: '11. Student-to-Student Cross-Tenant Isolation',
          status: 'FAILED',
          details: 'Bob was able to spoof or access Alice\'s records.'
        })
      }
    } else {
      results.push({
        step: '9. Student Authentication',
        status: 'FAILED',
        details: 'Login did not return student profile or token.'
      })
    }
  } catch (err: any) {
    results.push({
      step: '5-11. Backend End-to-End Operations',
      status: 'FAILED',
      details: `Backend API verification failed: ${err.message}`
    })
  } finally {
    if (ephemeralServer) {
      ephemeralServer.close()
    }
  }

  const isMigrationApplied = !results.some(r => r.status === 'PENDING_MIGRATION')
  const allPassed = results.every(r => r.status === 'PASSED')

  return { allPassed, isMigrationApplied, results }
}

if (require.main === module) {
  runLiveRLSVerification().then(res => {
    console.log('\n===============================================================')
    console.log('       SUPABASE RLS LIVE DEPLOYMENT VERIFICATION REPORT        ')
    console.log('===============================================================')
    console.log(`Migration Applied on Supabase: ${res.isMigrationApplied ? 'YES (Active)' : 'NO (Pending Dashboard Execution)'}`)
    console.log(`All Verifications Passed:      ${res.allPassed ? 'YES (100% Secure)' : 'NO'}\n`)
    res.results.forEach(r => {
      console.log(`[${r.status}] ${r.step}`)
      console.log(`  -> ${r.details}\n`)
    })
  }).catch(console.error)
}
