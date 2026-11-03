import dotenv from 'dotenv'
import path from 'path'
import { geminiService } from '../src/services/geminiService'
import { humanizationService } from '../src/services/humanizationService'
import { aiDetectorService } from '../src/services/aiDetectorService'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

interface SampleTestCase {
  name: string
  originalText: string
  criticalFacts: string[]
}

const testCases: SampleTestCase[] = [
  {
    name: 'Sample 1: Robotic Tech / AI Draft',
    originalText:
      "In today's fast-paced digital world, artificial intelligence plays a crucial role in modern technological ecosystems. Furthermore, it is important to note that approximately 78.4% of Fortune 500 enterprises adopted automated workflows in 2023. Moreover, we must delve into the intricate tapestry of neural networks to truly comprehend how deep learning fosters operational excellence across digital landscapes.",
    criticalFacts: ['78.4%', 'Fortune 500', '2023']
  },
  {
    name: 'Sample 2: Academic AI Bloat',
    originalText:
      "Moreover, the pedagogical paradigm underscores the multifaceted nature of contemporary educational dynamics. In conclusion, Dr. Aris Thorne's 2021 empirical research across 450 undergraduate participants revealed a 34.2% variance in cognitive retention when active learning modules were deployed. It is crucial to remember that pedagogical efficacy plays a pivotal role in scholastic achievement.",
    criticalFacts: ['Dr. Aris Thorne', '2021', '450', '34.2%']
  },
  {
    name: 'Sample 3: Corporate Jargon AI Draft',
    originalText:
      "In order to maximize operational synergy, stakeholders must foster comprehensive end-to-end alignment across all touchpoints. Furthermore, navigating this intricate business landscape necessitates holistic engagement. In Q3 2024, Meridian Corp reported $14.2M in recurring software subscriptions, reflecting a 12.5% quarter-over-quarter expansion.",
    criticalFacts: ['Q3 2024', 'Meridian Corp', '$14.2M', '12.5%']
  }
]

async function runVerification() {
  console.log('======================================================================')
  console.log('     HUMANORA AI: 3-SAMPLE EVALUATION (BEFORE / AFTER & DETECTOR)      ')
  console.log('======================================================================\n')

  let allPassed = true

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i]
    console.log(`----------------------------------------------------------------------`)
    console.log(`TEST ${i + 1}: ${tc.name}`)
    console.log(`----------------------------------------------------------------------`)

    // 1. Scan Original Text
    const beforeDetection = aiDetectorService.detect(tc.originalText)
    console.log(`[BEFORE DETECTION]`)
    console.log(`  AI-Likelihood: ${beforeDetection.aiScore}% (${beforeDetection.verdict})`)
    console.log(`  Burstiness SD: ${beforeDetection.signals.burstiness.standardDeviation} (${beforeDetection.signals.burstiness.label})`)
    console.log(`  Clichés Found: ${beforeDetection.signals.clicheDensity.foundCliches.join(', ') || 'None'}`)
    console.log(`\n[ORIGINAL TEXT]`)
    console.log(tc.originalText)

    // 2. Humanize Text
    let humanized = ''
    try {
      const geminiRes = await geminiService.transform({
        text: tc.originalText,
        mode: 'natural',
        tone: 0.5,
        targetLength: 'same'
      })
      humanized = geminiRes.humanizedText
      console.log(`\n[ENGINE USED]: Gemini (${geminiRes.model}) via Two-Pass Pipeline`)
    } catch (err: any) {
      console.log(`\n[NOTICE]: Gemini fallback invoked (${err.message})`)
      humanized = humanizationService.humanize(tc.originalText, 'natural', 0.5)
      console.log(`[ENGINE USED]: Local Fallback Linguistic Engine`)
    }

    // 3. Scan Humanized Text
    const afterDetection = aiDetectorService.detect(humanized)
    console.log(`\n[HUMANIZED TEXT]`)
    console.log(humanized)

    console.log(`\n[AFTER DETECTION]`)
    console.log(`  AI-Likelihood: ${afterDetection.aiScore}% (${afterDetection.verdict})`)
    console.log(`  Burstiness SD: ${afterDetection.signals.burstiness.standardDeviation} (${afterDetection.signals.burstiness.label})`)
    console.log(`  Clichés Found: ${afterDetection.signals.clicheDensity.foundCliches.join(', ') || 'None (Clean)'}`)

    // 4. Verify Fact & Number Preservation
    console.log(`\n[FACT & NUMBER INTEGRITY CHECK]`)
    let factsPreserved = true
    for (const fact of tc.criticalFacts) {
      const preserved = humanized.toLowerCase().includes(fact.toLowerCase())
      console.log(`  - Fact '${fact}': ${preserved ? '✓ PRESERVED' : '✗ MISSING'}`)
      if (!preserved) factsPreserved = false
    }

    const scoreDropped = afterDetection.aiScore < beforeDetection.aiScore
    console.log(`  - AI Likelihood Drop: ${beforeDetection.aiScore}% -> ${afterDetection.aiScore}% (${scoreDropped ? '✓ IMPROVED' : '✗ NO DROP'})`)

    if (!factsPreserved || !scoreDropped) {
      allPassed = false
    }
    console.log('\n')
  }

  console.log('======================================================================')
  console.log(`FINAL RESULT: ${allPassed ? 'ALL 3 SAMPLES PASSED WITH COMPLETE FACT RETENTION' : 'SOME CHECKS NEED ATTENTION'}`)
  console.log('======================================================================')

  process.exit(allPassed ? 0 : 1)
}

runVerification().catch(err => {
  console.error('Verification error:', err)
  process.exit(1)
})
