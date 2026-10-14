const puppeteer = require('puppeteer-core')

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

async function runBrowserVerification() {
  console.log('=================================================================')
  console.log('   HUMANORA AI — REAL BROWSER AUTOMATION VERIFICATION (EDGE)     ')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition, testName, detail) {
    if (condition) {
      console.log(`  [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ' — ' + detail : ''}`)
      failed++
    }
  }

  console.log('▶ Launching Microsoft Edge Headless Browser...')
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,800'
    ]
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    // 1. Navigate to localhost:5173
    console.log('\n▶ Step 1: Navigating to http://localhost:5173 (Desktop 1280x800)...')
    const navStartTime = Date.now()
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForSelector('header', { timeout: 10000 })
    const loadTime = Date.now() - navStartTime
    console.log(`  Page loaded in ${loadTime}ms`)

    const title = await page.title()
    assert(title.length > 0, `Page Title loaded: "${title}"`)

    // Allow config API fetch to settle in React state
    await new Promise(r => setTimeout(r, 1500))

    // 2. Check Header and Model Engine Badge
    const headerText = await page.$eval('header', (el) => el.textContent || '')
    assert(headerText.includes('Humanora'), 'Header contains Humanora branding')
    assert(headerText.includes('gemini-3.5-flash-lite'), 'Header displays live primary model: gemini-3.5-flash-lite')

    // 3. Test Empty Submission / Disabled State
    console.log('\n▶ Step 2: Testing Empty Input Handling & Duplicate Submission Lockout...')
    const enhanceBtnDisabled = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'))
      const enhance = allBtns.find(b => (b.textContent || '').includes('Improve Academic Writing') || (b.textContent || '').includes('Refining'))
      return enhance ? enhance.disabled : false
    })
    assert(enhanceBtnDisabled === true, 'Improve Academic Writing button is strictly disabled on empty input')

    // 4. Enter Academic Text
    console.log('\n▶ Step 3: Entering Academic Draft with Citations and Statistics...')
    const testAcademicText = 'Recent empirical studies in cognitive linguistics (Chomsky, 1965; Pinker, 1994, p. 42) reveal that syntactic recursion operates across 78.4% of surveyed natural languages.'
    
    await page.focus('textarea')
    await page.keyboard.type(testAcademicText)

    // Wait for React state to update inputLength
    await new Promise(r => setTimeout(r, 500))

    const textareaValue = await page.$eval('textarea', (el) => el.value)
    assert(textareaValue === testAcademicText, 'Textarea value successfully bound to input state')

    // Verify button is now enabled
    const enhanceBtnEnabled = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'))
      const enhance = allBtns.find(b => (b.textContent || '').includes('Improve Academic Writing'))
      return enhance ? !enhance.disabled : false
    })
    assert(enhanceBtnEnabled === true, 'Improve Academic Writing button enables when text is present')

    // 5. Submit Transformation
    console.log('\n▶ Step 4: Submitting Academic Clarity Request...')
    const submitStart = Date.now()
    
    await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'))
      const enhance = allBtns.find(b => (b.textContent || '').includes('Improve Academic Writing'))
      if (enhance) enhance.click()
    })

    // 6. Verify Loading State
    await new Promise(r => setTimeout(r, 100))
    const isLoadingPresent = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'))
      const loadingBtn = allBtns.find(b => (b.textContent || '').includes('Refining with Academic Precision') || b.disabled)
      return loadingBtn ? loadingBtn.disabled : false
    })
    assert(isLoadingPresent === true, 'Button switches to disabled loading state during generation')

    // 7. Wait for Output to Render
    console.log('\n▶ Step 5: Waiting for Live Gemini Response in UI...')
    await page.waitForFunction(
      () => {
        const pageText = document.body.innerText || ''
        return pageText.includes('Chomsky, 1965') && pageText.includes('78.4%') && pageText.includes('Gemini Cloud')
      },
      { timeout: 35000 }
    )
    const transformLatency = Date.now() - submitStart
    console.log(`  Live UI transformation received and rendered in ${transformLatency}ms`)

    // 8. Inspect Rendered Output Content
    const pageContent = await page.evaluate(() => document.body.innerText)
    assert(pageContent.includes('Chomsky, 1965'), 'Transformed prose in UI preserves citation: (Chomsky, 1965)')
    assert(pageContent.includes('Pinker, 1994'), 'Transformed prose in UI preserves citation: Pinker, 1994')
    assert(pageContent.includes('78.4%'), 'Transformed prose in UI preserves statistic: 78.4%')
    assert(pageContent.includes('Gemini Cloud'), 'UI output section displays engine: Gemini Cloud')
    assert(pageContent.includes('gemini-3.5-flash-lite'), 'UI displays accurate model metadata: gemini-3.5-flash-lite')

    // 9. Test Copy Output
    console.log('\n▶ Step 6: Testing Copy Output Action...')
    const copySuccess = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'))
      const copyBtn = allBtns.find(b => (b.textContent || '').includes('Copy'))
      if (copyBtn) {
        copyBtn.click()
        return true
      }
      return false
    })
    assert(copySuccess, 'Copy button located and clicked')

    // 10. Test History Modal Open and Retrieval
    console.log('\n▶ Step 7: Testing History Retrieval in UI...')
    const historyOpened = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'))
      const historyBtn = allBtns.find(b => (b.textContent || '').includes('History'))
      if (historyBtn) {
        historyBtn.click()
        return true
      }
      return false
    })
    assert(historyOpened, 'History button clicked to open HistoryModal')

    await page.waitForSelector('[data-testid="history-modal"]', { timeout: 8000 })
    const historyModalText = await page.$eval('[data-testid="history-modal"]', el => el.textContent || '')
    assert(historyModalText.includes('Saved Writing History'), 'History Modal rendered with saved transformations')

    // Close History Modal using dedicated close button
    await page.click('[data-testid="close-history-modal"]')
    await page.waitForFunction(() => document.querySelector('[data-testid="history-modal"]') === null, { timeout: 5000 })
    assert(true, 'History Modal closed cleanly')

    // 11. Test Responsive Layout: Tablet (768px x 1024px)
    console.log('\n▶ Step 8: Testing Tablet Viewport (768px x 1024px)...')
    await page.setViewport({ width: 768, height: 1024 })
    await new Promise(r => setTimeout(r, 600))
    const tabletOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    assert(!tabletOverflow, 'Tablet viewport (768px) adapts cleanly with 0 horizontal overflow')

    // 12. Test Responsive Layout: Mobile (375px x 812px)
    console.log('\n▶ Step 9: Testing Mobile Viewport (375px x 812px)...')
    await page.setViewport({ width: 375, height: 812 })
    await new Promise(r => setTimeout(r, 600))
    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    assert(!mobileOverflow, 'Mobile viewport (375px) stacks controls cleanly with 0 horizontal overflow')

    // 13. Restore Desktop Viewport
    await page.setViewport({ width: 1280, height: 800 })

    console.log('\n=================================================================')
    console.log(`Browser Verification Suite: ${passed} PASSED, ${failed} FAILED`)
    console.log('=================================================================')

    await browser.close()
    if (failed > 0) process.exit(1)
  } catch (err) {
    await browser.close()
    console.error('Browser automation error:', err)
    process.exit(1)
  }
}

runBrowserVerification()
