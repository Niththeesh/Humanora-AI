import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
process.env.NODE_ENV = 'test'

import { geminiService } from '../src/services/geminiService'
import { academicAuditService } from '../src/services/academicAuditService'

interface SampleTestCase {
  id: string
  name: string
  mode: string
  original: string
  requiredStrings: string[]
  forbiddenCliches: string[]
  expectedPreservation: string
  shouldRemainUnchangedOrMinimal?: boolean
}

const testSamples: SampleTestCase[] = [
  // 1. Academic Sample
  {
    id: 'sample-01-academic',
    name: '1. Academic: Epistemological Latent Space Analysis',
    mode: 'academic',
    original: 'The epistemological underpinnings of contemporary neural architectures necessitate an investigation into how latent spaces encode compositional semantics. Although distributed representations capture statistical regularities across large corpora, their capacity for systematic compositional generalization remains fundamentally constrained by the manifold geometry.',
    requiredStrings: ['latent spaces', 'compositional', 'semantics', 'generalization', 'geometry'],
    forbiddenCliches: ['tapestry', 'delve', 'beacon', 'testament', 'realm of'],
    expectedPreservation: 'Scholarly epistemic stance and latent space argument preserved without formulaic transition phrases.'
  },
  // 2. Technical Sample
  {
    id: 'sample-02-technical',
    name: '2. Technical: Distributed Systems & Kubernetes Ingress',
    mode: 'academic',
    original: 'In Kubernetes v1.29 cluster deployments, the gRPC ingress controller on port 8443 routes incoming microservice traffic with p99 latency under 4.2ms. When mutual TLS (mTLS) handshake overhead is considered, memory allocation spikes by 14.8% across worker nodes.',
    requiredStrings: ['Kubernetes', 'v1.29', 'gRPC', '8443', '4.2ms', 'mTLS', '14.8%'],
    forbiddenCliches: ['multifaceted', 'in today\'s digital landscape'],
    expectedPreservation: 'All port numbers, version tags, latency metrics, and network protocol acronyms strictly preserved.'
  },
  // 3. Professional Sample
  {
    id: 'sample-03-professional',
    name: '3. Professional: Operational Executive Memo (De-nominalization)',
    mode: 'professional',
    original: 'It has been brought to the attention of executive leadership that the implementation of the cross-functional operational optimization initiative has resulted in the manifestation of procedural bottlenecks with respect to stakeholder deliverables by Q4 2026.',
    requiredStrings: ['Q4 2026', 'operational', 'stakeholder'],
    forbiddenCliches: ['delve', 'beacon', 'tapestry'],
    expectedPreservation: 'Passive bureaucratic nominalizations transformed into crisp executive verbs while preserving business deliverables.'
  },
  // 4. Short Text Sample
  {
    id: 'sample-04-short',
    name: '4. Short Text: Quantum Coherence Assertion',
    mode: 'academic',
    original: 'Quantum decoherence fundamentally limits the operational coherence time of superconducting qubits.',
    requiredStrings: ['Quantum decoherence', 'superconducting qubit'],
    forbiddenCliches: ['in the realm of', 'it is important to note'],
    expectedPreservation: 'Single sentence remains compact and high-impact without artificial bloating or fluff.'
  },
  // 5. Long Text Sample
  {
    id: 'sample-05-long',
    name: '5. Long Text: Multi-Argument Higher Education Synthesis',
    mode: 'academic',
    original: 'The advent of generative artificial intelligence represents a paradigm shift across higher education institutions worldwide. While proponents argue that automated language models democratize learning by offering personalized pedagogical assistance, institutional ethicists maintain that uncritical reliance on synthetic text compromises critical cognitive faculties. Empirical investigations conducted across forty-two universities indicate that students who interact with adaptive tutors develop superior problem-solving competencies, provided that faculty establish explicit boundaries regarding academic integrity. Consequently, the challenge confronting modern universities does not lie in the prohibition of technological tools, but rather in cultivating authentic digital literacy.',
    requiredStrings: ['higher education', 'forty-two', 'pedagogical', 'cognitive', 'academic integrity', 'digital literacy'],
    forbiddenCliches: ['tapestry', 'testament', 'delve', 'beacon'],
    expectedPreservation: 'Coherent multi-paragraph argument progression and dialectical tension maintained between opposing viewpoints.'
  },
  // 6. Quotations Sample
  {
    id: 'sample-06-quotations',
    name: '6. Quotations: Verbatim Historical Quotation Integrity',
    mode: 'academic',
    original: 'As Hannah Arendt famously observed in The Origins of Totalitarianism, "The ideal subject of totalitarian rule is not the convinced Nazi or the convinced Communist, but people for whom the distinction between fact and fiction no longer exists." This philosophical observation clarifies the erosion of public discourse.',
    requiredStrings: [
      'Hannah Arendt',
      'The Origins of Totalitarianism',
      '"The ideal subject of totalitarian rule is not the convinced Nazi or the convinced Communist, but people for whom the distinction between fact and fiction no longer exists."'
    ],
    forbiddenCliches: ['delve', 'testament to'],
    expectedPreservation: 'Direct quoted speech preserved 100% verbatim with author attribution and enclosing quotation marks.'
  },
  // 7. Citations Sample
  {
    id: 'sample-07-citations',
    name: '7. Citations: Multi-Author In-Text Citation Protection',
    mode: 'academic',
    original: 'Previous empirical investigations into cross-lingual transfer (Vaswani et al., 2017; Devlin et al., 2019, p. 4171; Brown et al., 2020) demonstrate that dense contextual representations significantly outperform traditional n-gram baselines.',
    requiredStrings: [
      'Vaswani et al., 2017',
      'Devlin et al., 2019, p. 4171',
      'Brown et al., 2020'
    ],
    forbiddenCliches: ['tapestry', 'beacon of'],
    expectedPreservation: 'Parenthetical citations, multi-author markers (et al.), and page specifications preserved without alteration.'
  },
  // 8. Statistics Sample
  {
    id: 'sample-08-statistics',
    name: '8. Statistics: Clinical Trial Confidence Intervals & p-values',
    mode: 'academic',
    original: 'In a randomized controlled trial comprising 1,248 participants, the therapeutic intervention demonstrated an efficacy rate of 78.4% (95% CI: [74.1%, 82.7%], p < 0.001), compared to 42.1% in the placebo cohort (n = 624).',
    requiredStrings: [
      '1,248',
      '78.4%',
      '95% CI: [74.1%, 82.7%]',
      'p < 0.001',
      '42.1%',
      '624'
    ],
    forbiddenCliches: ['delve', 'multifaceted'],
    expectedPreservation: 'Quantitative sample sizes, percentage rates, confidence interval brackets, and inferential statistics preserved.'
  },
  // 9. Ambiguous Claims Sample
  {
    id: 'sample-09-ambiguous',
    name: '9. Ambiguous Claims: Epistemic Hedging Preservation',
    mode: 'academic',
    original: 'Preliminary mass spectrometry measurements may suggest the potential presence of subsurface hydrothermal activity on Enceladus, although alternative abiotic geological mechanisms cannot be entirely ruled out at this early stage.',
    requiredStrings: ['suggest', 'potential', 'hydrothermal', 'Enceladus', 'alternative'],
    forbiddenCliches: ['proves conclusively', 'without a doubt', 'tapestry'],
    expectedPreservation: 'Scientific uncertainty and epistemic modal hedging preserved without false assertive overclaiming.'
  },
  // 10. Text That Should Remain Unchanged Sample
  {
    id: 'sample-10-unchanged',
    name: '10. Text That Should Remain Unchanged: Pristine Mathematical Theorem Definition',
    mode: 'academic',
    original: 'The central limit theorem establishes that the normalized sum of independent and identically distributed random variables converges in distribution to a standard normal distribution as the sample size approaches infinity.',
    requiredStrings: [
      'central limit theorem',
      'independent and identically distributed',
      'converges in distribution',
      'standard normal distribution',
      'sample size'
    ],
    forbiddenCliches: ['in the realm of', 'tapestry', 'delve'],
    shouldRemainUnchangedOrMinimal: true,
    expectedPreservation: 'Rigorous mathematical definition preserved with zero semantic distortion or forced synonym substitution.'
  }

]

async function runWritingQuality10Samples() {
  console.log('================================================================================')
  console.log('   HUMANORA AI — 10 REPRESENTATIVE WRITING QUALITY EVALUATION SUITE             ')
  console.log('================================================================================\n')

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

  for (const sample of testSamples) {
    console.log(`\n▶ EVALUATING: ${sample.name}`)
    const start = Date.now()

    const result = await geminiService.transform({
      text: sample.original,
      mode: sample.mode,
      tone: 0.25,
      intensity: 'balanced',
      targetLength: 'same',
      vocabulary: false,
      highlights: false,
      authorVoice: 'scholarly'
    })

    const latency = Date.now() - start
    const enhanced = result.humanizedText

    console.log(`    • Model: ${result.model} (${result.engine}) [${latency}ms]`)
    console.log(`    • Original Word Count: ${result.stats.originalWords} | Enhanced: ${result.stats.humanizedWords}`)
    console.log(`    • Enhanced Preview:\n      "${enhanced.slice(0, 140)}..."`)

    // Check 1: Required String Preservation
    const missingStrings = sample.requiredStrings.filter(s => !enhanced.includes(s))
    assert(
      missingStrings.length === 0,
      `All required strings preserved (0 missing)`,
      missingStrings.length > 0 ? `Missing: ${JSON.stringify(missingStrings)}` : undefined
    )

    // Check 2: Cliché Elimination
    const foundCliches = sample.forbiddenCliches.filter(c => enhanced.toLowerCase().includes(c.toLowerCase()))
    assert(
      foundCliches.length === 0,
      `Zero forbidden AI clichés detected`,
      foundCliches.length > 0 ? `Found: ${JSON.stringify(foundCliches)}` : undefined
    )

    // Check 3: Factual & Entity Integrity Guardian
    assert(
      result.factualIntegrity.verified === true,
      `Factual integrity verified by programmatic guardian`
    )

    // Check 4: Epistemic & Scholarly Cadence
    const sentences = enhanced.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0)
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length)
    console.log(`    • Sentence Lengths Distribution: [${sentenceLengths.join(', ')}] words`)

    // Check 5: Academic Report Generation & Heuristic Label Transparency
    if (result.academicReport) {
      const disclaimer = result.academicReport.disclaimer
      assert(
        disclaimer.includes('transparent linguistic, syntactic, and citation integrity analysis') &&
        disclaimer.includes('never fabricate AI detection bypass scores'),
        `Report contains transparent heuristic disclaimer (no fabricated bypass claims)`
      )
    }

    if (sample.shouldRemainUnchangedOrMinimal) {
      // For theorem definitions, verify core terms remain intact
      const wordDiff = Math.abs(result.stats.originalWords - result.stats.humanizedWords)
      assert(
        wordDiff <= 8,
        `Pristine mathematical phrasing preserved without gratuitous rephrasing (word diff: ${wordDiff})`
      )
    }
  }

  console.log('\n================================================================================')
  console.log(`Writing Quality 10 Samples Suite Completed: ${passed} PASSED, ${failed} FAILED`)
  console.log('================================================================================')

  if (failed > 0) {
    process.exit(1)
  }
  process.exit(0)
}

runWritingQuality10Samples()
