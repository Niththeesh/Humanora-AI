import React, { useState } from 'react'
import { BrandLogo } from './BrandLogo'

interface LandingSectionsProps {
  onLaunchWorkspace: (mode?: string) => void
}

export const LandingSections: React.FC<LandingSectionsProps> = ({ onLaunchWorkspace }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const writingModes = [
    {
      id: 'natural',
      title: 'Natural Rewrite',
      badge: 'Most Popular',
      desc: 'Eliminates repetitive stiffness and robotic cadence, adding natural burstiness and human flow.',
      sample: 'Transforms predictable transitions into effortless, rhythmic narrative prose.'
    },
    {
      id: 'academic',
      title: 'Academic Clarity',
      badge: 'Scholarly',
      desc: 'Rigorous formal expression with disciplined transitions, precise terminology, and zero fabricated evidence.',
      sample: 'Perfect for research syntheses, essays, and scholarly literature critiques.'
    },
    {
      id: 'professional',
      title: 'Professional Writing',
      badge: 'Business',
      desc: 'Crisp, constructive, and authoritative workplace prose for memos, client proposals, and executive summaries.',
      sample: 'Delivers courteous, clear communication that spurs immediate action.'
    },
    {
      id: 'casual',
      title: 'Casual Writing',
      badge: 'Engaging',
      desc: 'Warm, conversational phrasing using natural contractions and relaxed cadences.',
      sample: 'Ideal for blogs, newsletters, creative pitches, and social commentary.'
    },
    {
      id: 'concise',
      title: 'Concise Writing',
      badge: 'Efficiency',
      desc: 'Strips out rhetorical bloat, tautologies, and filler while preserving every critical detail.',
      sample: 'Reduces word count by 20–40% without losing crucial meaning.'
    },
    {
      id: 'expand',
      title: 'Expand for Clarity',
      badge: 'Elaboration',
      desc: 'Unpacks dense assertions with illustrative nuance and transitional context without inventing facts.',
      sample: 'Clarifies technical abstractions for broader, cross-disciplinary comprehension.'
    },
    {
      id: 'grammar',
      title: 'Grammar Correction',
      badge: 'Precision',
      desc: 'Rectifies punctuation, syntactic agreement, spelling, and tense issues with surgical precision.',
      sample: 'Preserves the author’s exact natural voice while eliminating typographical errors.'
    },
    {
      id: 'tone',
      title: 'Tone Adjustment',
      badge: 'Adaptive',
      desc: 'Calibrates emotional resonance and formality anywhere along the spectrum from austere to friendly.',
      sample: 'Customizes mood to match your exact audience expectation.'
    },
    {
      id: 'paraphrase',
      title: 'Paraphrasing',
      badge: 'Alternative Phrasing',
      desc: 'Restructures sentence architecture and swaps vocabulary to express arguments from fresh angles.',
      sample: 'Maintains semantic equivalence with entirely original syntax.'
    },
    {
      id: 'summary',
      title: 'Summarization',
      badge: 'Synthesis',
      desc: 'Extracts core arguments and decisive takeaways into a coherent, high-density synopsis.',
      sample: 'Condenses multi-page documents into digestible executive takeaways.'
    }
  ]

  const faqs = [
    {
      q: 'Does Humanora AI guarantee 100% bypass of AI detectors?',
      a: 'No, and we are proudly transparent about this. Unlike services that market dishonest "guaranteed bypass" claims, Humanora AI focuses on authentic, high-grade writing quality, human sentence variety (burstiness & perplexity), and factual preservation. Detector algorithms constantly shift heuristics; our priority is making your writing clear, natural, and compelling.'
    },
    {
      q: 'How does the Google Gemini integration keep the platform free?',
      a: 'Google provides a generous free tier for developers on models like Gemini 3.8 Flash and 1.5 Flash. By hosting your own server credentials locally and keeping all API keys secret, you can utilize state-of-the-art AI without recurring subscription fees.'
    },
    {
      q: 'Is my submitted text saved or used for AI model training?',
      a: 'Your submitted text is processed strictly server-side and never used to train public language models. If Supabase is connected, you maintain complete ownership of your personal history and can delete records at any time.'
    },
    {
      q: 'Can I use Humanora AI offline or without an API key?',
      a: 'Yes! Humanora AI includes an embedded high-precision local linguistic engine that functions immediately out-of-the-box, applying heuristic transformations even when offline.'
    },
    {
      q: 'What export options are supported?',
      a: 'You can copy directly to the clipboard, download clean plain text (.txt), structured Word document (.docx), or inspect side-by-side diff comparisons with quality metrics.'
    }
  ]

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/25 mb-6">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          Free-Tier Architecture • 10 Writing Modes • StealthWriter-Grade Usability
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Write Naturally.<br />
          <span className="bg-gradient-to-r from-gold-200 via-gold-400 to-gold-500 bg-clip-text text-transparent">
            Express Authentically.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Transform robotic, repetitive drafts into fluent human writing. 
          Preserve your key facts, numbers, and quotations with fine-tuned tone and clarity controls.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onLaunchWorkspace('natural')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-charcoal-950 hover:brightness-110 shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Writing Workspace</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          
          <a
            href="#modes-section"
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-base bg-charcoal-900 hover:bg-charcoal-850 text-slate-200 border border-white/10 transition-all"
          >
            Explore 10 Writing Modes
          </a>
        </div>

        {/* Feature Badges */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-charcoal-900/60 border border-white/5">
            <div className="text-gold-400 text-lg font-bold mb-1">10 Modes</div>
            <div className="text-xs text-slate-400">From academic rigor to casual storytelling</div>
          </div>
          <div className="p-4 rounded-xl bg-charcoal-900/60 border border-white/5">
            <div className="text-gold-400 text-lg font-bold mb-1">Fact Guard</div>
            <div className="text-xs text-slate-400">Preserves dates, numbers & direct quotations</div>
          </div>
          <div className="p-4 rounded-xl bg-charcoal-900/60 border border-white/5">
            <div className="text-gold-400 text-lg font-bold mb-1">Dual Engine</div>
            <div className="text-xs text-slate-400">Gemini Cloud API + Offline Linguistic fallback</div>
          </div>
          <div className="p-4 rounded-xl bg-charcoal-900/60 border border-white/5">
            <div className="text-gold-400 text-lg font-bold mb-1">Zero Cost</div>
            <div className="text-xs text-slate-400">Built to maximize Google free-tier quotas</div>
          </div>
        </div>
      </section>

      {/* 10 Modes Section */}
      <section id="modes-section" className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            10 Tailored Writing Improvement Modes
          </h2>
          <p className="text-sm text-slate-400">
            Select a mode crafted for your specific document type, audience, and stylistic goal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {writingModes.map((m) => (
            <div 
              key={m.id}
              className="p-6 rounded-2xl bg-charcoal-900/70 border border-white/5 hover:border-gold-500/40 hover:bg-charcoal-900 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-gold-300 transition-colors">
                    {m.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    {m.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {m.desc}
                </p>
                <div className="p-3 rounded-lg bg-charcoal-950/80 border border-white/5 text-[11px] text-slate-400 italic mb-5">
                  "{m.sample}"
                </div>
              </div>

              <button
                onClick={() => onLaunchWorkspace(m.id)}
                className="w-full py-2.5 rounded-lg text-xs font-bold text-gold-400 hover:text-charcoal-950 bg-gold-500/10 hover:bg-gold-500 border border-gold-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Select {m.title}</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">
            How Humanora AI Works
          </h2>
          <p className="text-sm text-slate-400">
            A three-step workflow engineered for precision, privacy, and authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="p-6 rounded-2xl bg-charcoal-900/60 border border-white/5 relative">
            <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 font-bold flex items-center justify-center text-lg mb-4 border border-gold-500/30">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2">Input Source Draft</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste drafts up to 50,000 characters. Drag-and-drop batch documents or use one-click samples.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal-900/60 border border-white/5 relative">
            <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 font-bold flex items-center justify-center text-lg mb-4 border border-gold-500/30">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2">Configure Parameters</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select 1 of 10 modes, adjust tone slider from formal to casual, and select intensity level.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal-900/60 border border-white/5 relative">
            <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 font-bold flex items-center justify-center text-lg mb-4 border border-gold-500/30">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2">Review & Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect side-by-side diff highlights, check live readability metrics, and export to .txt or .docx.
            </p>
          </div>
        </div>
      </section>

      {/* Free Tier Information */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-850 to-charcoal-900 border border-gold-500/20 text-center">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30 mb-4 inline-block">
            Transparent Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Zero Monthly Fees With Google Gemini Free Tier
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Humanora AI uses Google’s Gemini 3.8 Flash / 1.5 Flash developer tier. 
            All API keys stay private on the server, ensuring you never pay recurring software subscription mark-ups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mb-8">
            <div className="p-4 rounded-xl bg-charcoal-950/70 border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Input Capacity</div>
              <div className="text-sm font-bold text-white">Up to 50,000 Chars</div>
            </div>
            <div className="p-4 rounded-xl bg-charcoal-950/70 border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Quota Policy</div>
              <div className="text-sm font-bold text-white">30 Req / Min Guard</div>
            </div>
            <div className="p-4 rounded-xl bg-charcoal-950/70 border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Fallback Mode</div>
              <div className="text-sm font-bold text-white">Local Heuristics</div>
            </div>
          </div>

          <button
            onClick={() => onLaunchWorkspace('natural')}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gold-500 text-charcoal-950 hover:bg-gold-400 transition-all"
          >
            Start Writing for Free
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">
            Clear, honest answers regarding data privacy, accuracy, and AI ethics.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="rounded-xl bg-charcoal-900/60 border border-white/5 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-semibold text-sm text-slate-200 flex justify-between items-center hover:text-gold-300"
              >
                <span>{faq.q}</span>
                <span className="text-gold-400 text-lg ml-4">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-12 pb-8 max-w-7xl mx-auto px-4 text-slate-500 text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
          <BrandLogo size="sm" showTagline={false} />
          
          <div className="flex flex-wrap gap-6 text-slate-400">
            <button onClick={() => onLaunchWorkspace('natural')} className="hover:text-gold-300">Workspace</button>
            <a href="#modes-section" className="hover:text-gold-300">10 Modes</a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Privacy First Architecture</span>
            <span className="text-slate-400">Preserves Author Intent</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 space-y-2 border-t border-white/5 pt-6">
          <p>
            © {new Date().getFullYear()} Humanora AI. Write Naturally. Express Authentically.
          </p>
          <p className="max-w-xl mx-auto text-slate-600 text-[10px]">
            Humanora AI improves text clarity, structure, and tone. It is not designed to assist with academic dishonesty or deceive anti-plagiarism verification systems.
          </p>
        </div>
      </footer>
    </div>
  )
}
