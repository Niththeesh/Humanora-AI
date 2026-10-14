import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const url = process.env.SUPABASE_URL!
const anonKey = process.env.SUPABASE_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testRLSStatus() {
  console.log('=== Testing Live Supabase RLS Status ===')
  console.log('Target URL:', url)
  
  // 1. Client with ANON KEY (sb_publish)
  console.log('\n--- Test 1: Querying with ANON KEY (sb_publish) ---')
  const anonClient = createClient(url, anonKey)
  
  const anonSelect = await anonClient.from('transformations').select('id, user_id, session_id, original_text').limit(5)
  console.log('Anon select error:', anonSelect.error ? anonSelect.error.message : 'none')
  console.log('Anon select data count:', anonSelect.data ? anonSelect.data.length : 'null')
  if (anonSelect.data && anonSelect.data.length > 0) {
    console.log('SECURITY ALERT: Anon client was able to read records directly:', anonSelect.data.map(d => ({ id: d.id, sessionId: d.session_id, userId: d.user_id })))
  } else if (!anonSelect.error) {
    console.log('Anon client received 0 records (RLS is active and blocking unauthenticated select).')
  }

  // 2. Client with SERVICE ROLE KEY (sb_secret_)
  console.log('\n--- Test 2: Querying with SERVICE ROLE KEY (sb_secret_) ---')
  const serviceClient = createClient(url, serviceKey)
  const serviceSelect = await serviceClient.from('transformations').select('id, user_id, session_id').limit(5)
  console.log('Service role select error:', serviceSelect.error ? serviceSelect.error.message : 'none')
  console.log('Service role select data count:', serviceSelect.data ? serviceSelect.data.length : 'null')

  // 3. Check writing_sessions table
  console.log('\n--- Test 3: Anon querying writing_sessions ---')
  const anonSessions = await anonClient.from('writing_sessions').select('id, title, user_id').limit(5)
  console.log('Anon writing_sessions error:', anonSessions.error ? anonSessions.error.message : 'none')
  console.log('Anon writing_sessions data count:', anonSessions.data ? anonSessions.data.length : 'null')
  if (anonSessions.data && anonSessions.data.length > 0) {
    console.log('SECURITY ALERT: Anon client was able to read writing_sessions directly:', anonSessions.data)
  }
}

testRLSStatus()
