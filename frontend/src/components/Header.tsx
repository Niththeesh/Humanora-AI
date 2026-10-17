import React, { useState } from 'react'
import { BrandLogo } from './BrandLogo'
import { UserProfile } from '../utils/session'

interface HeaderProps {
  isDark: boolean
  onToggleDarkMode: () => void
  activeTab: 'workspace' | 'modes' | 'how-it-works' | 'free-plan' | 'faq' | 'history'
  onSelectTab: (tab: 'workspace' | 'modes' | 'how-it-works' | 'free-plan' | 'faq' | 'history') => void
  engineStatus?: { configured?: boolean; isConfigured?: boolean; model: string; provider: string }

  historyCount?: number
  currentUser?: UserProfile | null
  onOpenAuthModal?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleDarkMode,
  activeTab,
  onSelectTab,
  engineStatus,
  historyCount = 0,
  currentUser,
  onOpenAuthModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  interface NavItem {
    id: 'workspace' | 'modes' | 'how-it-works' | 'free-plan' | 'faq' | 'history'
    label: string
    badge?: number
  }

  const navLinks: NavItem[] = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'modes', label: '10 Modes' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'free-plan', label: 'Free Tier' },
    { id: 'faq', label: 'FAQ' },
    { id: 'history', label: 'History', badge: historyCount > 0 ? historyCount : undefined },
  ]

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300 bg-charcoal-900/80 dark:bg-charcoal-900/85 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
        {/* Brand */}
        <div 
          onClick={() => onSelectTab('workspace')} 
          className="cursor-pointer"
        >
          <BrandLogo size="md" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-charcoal-950/60 p-1 rounded-xl border border-white/5">

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all relative ${
                activeTab === link.id
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {link.label}
              {link.badge !== undefined && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-gold-500 text-charcoal-950 font-bold">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* AI Engine Status Pill */}
          <div 
            title={(engineStatus?.isConfigured || engineStatus?.configured) ? `Connected to ${engineStatus.model}` : 'Running with local linguistic heuristics. Free Gemini API available on backend.'}
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border bg-charcoal-850 border-white/5"
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              (engineStatus?.isConfigured || engineStatus?.configured) ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gold-400 shadow-[0_0_8px_#fbbf24]'
            }`} />
            <span className="text-[11px] text-slate-300 font-mono">
              {(engineStatus?.isConfigured || engineStatus?.configured) ? (engineStatus.model || 'Gemini Active') : 'Linguistic Engine'}
            </span>
          </div>


          {/* User Account / Sign In Pill */}
          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 border border-white/10 transition-all shadow-sm"
              title={currentUser ? `Signed in as ${currentUser.email}` : 'Sign in to access verified cloud persistence'}
            >
              <span>{currentUser ? '🎓' : '👤'}</span>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {currentUser ? (currentUser.fullName || currentUser.email.split('@')[0]) : 'Sign In'}
              </span>
              {currentUser && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gold-500/20 text-gold-300 font-bold uppercase">
                  {currentUser.tier}
                </span>
              )}
            </button>
          )}

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Niththeesh/Humanizer"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex p-2 rounded-xl transition-all bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-gold-300 border border-white/5 items-center justify-center"
            title="View Humanora AI on GitHub"
            aria-label="View Humanora AI on GitHub"
            id="github-repo-link"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl transition-all bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-gold-300 border border-white/5"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-charcoal-850 text-slate-300 border border-white/5"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-charcoal-900 border-b border-white/10">

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onSelectTab(link.id)
                setMobileMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                activeTab === link.id
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gold-500 text-charcoal-950 font-bold">
                  {link.badge}
                </span>
              )}
            </button>
          ))}

          <a
            href="https://github.com/Niththeesh/Humanizer"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-gold-300 hover:bg-white/5 transition-all flex items-center gap-2 border-t border-white/5 pt-3 mt-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>GitHub Repository</span>
          </a>
        </div>
      )}
    </header>
  )
}
