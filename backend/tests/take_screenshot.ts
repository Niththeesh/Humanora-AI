import http from 'http'
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer-core'

const docsDir = path.resolve(__dirname, '../../docs')
const artifactDir = 'C:/Users/Sritharan Niththeesh/.gemini/antigravity/brain/0492198c-b8b0-456d-b9cc-44d5b380a1dd'

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json'
}

const server = http.createServer((req, res) => {
  let reqPath = req.url || '/'
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html'
  }
  const filePath = path.join(docsDir, reqPath.split('?')[0])
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
    fs.createReadStream(filePath).pipe(res)
  } else {
    // SPA fallback
    const indexHtml = path.join(docsDir, 'index.html')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.createReadStream(indexHtml).pipe(res)
  }
})

async function run() {
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Server address error')
  }
  const port = address.port
  console.log(`Docs static server listening at http://127.0.0.1:${port}`)

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 1100 })
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0', timeout: 30000 })

    // Wait a brief moment for React hydration
    await new Promise((r) => setTimeout(r, 1500))

    const screenshotPath = path.join(artifactDir, 'detector_panel_deployed.png')
    await page.screenshot({ path: screenshotPath, fullPage: false })
    console.log(`Screenshot saved successfully to ${screenshotPath}`)

    // Check if the detector component text is rendered
    const bodyText = (await page.evaluate('document.body.innerText')) as string
    const hasDetector = bodyText.includes('AI Writing Pattern Estimator') || bodyText.includes('AI-Likelihood Detector')
    console.log(`Detector heading present in rendered DOM: ${hasDetector}`)
  } finally {
    await browser.close()
    server.close()
    process.exit(0)
  }
}

run().catch((err) => {
  console.error('Screenshot error:', err)
  server.close()
  process.exit(1)
})
