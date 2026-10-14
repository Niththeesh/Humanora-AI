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
        </div>
      )}
    </header>
  )
}
