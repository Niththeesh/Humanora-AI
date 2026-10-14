import React, { useState } from 'react'
import axios from 'axios'
import { UserProfile } from '../utils/session'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserProfile | null
  onSignIn: (user: UserProfile, token?: string) => void
  onSignOut: () => void
  isDark?: boolean
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
  isDark = true,
}) => {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post('/api/auth/login', {
        email: trimmedEmail,
        fullName: fullName.trim() || undefined
      })

      if (res.data?.user && res.data?.token) {
        onSignIn(res.data.user, res.data.token)
        setEmail('')
        setFullName('')
        onClose()
      } else {
        setError('Authentication service returned incomplete profile.')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }


  const handleSignOut = () => {
    onSignOut()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
        isDark ? 'bg-charcoal-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-charcoal-850">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{currentUser ? 'Student Account & Workspace' : isRegistering ? 'Create Student Account' : 'Sign In to Humanora AI'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser ? 'Your authenticated writing profile & persistent cloud storage' : 'Save private transformations to your verified profile'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {currentUser ? (
            /* Signed In View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-charcoal-950 border border-gold-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Tier</span>
                  <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                    {currentUser.tier} Academic
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{currentUser.fullName || 'Academic Scholar'}</div>
                  <div className="text-xs text-slate-400 font-mono">{currentUser.email}</div>
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs text-slate-400">
                  <span>Monthly Quota:</span>
                  <span className="font-semibold text-slate-200">{currentUser.monthlyWordLimit.toLocaleString()} words</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 bg-charcoal-950/60 p-3 rounded-xl border border-white/5">
                <p>🔒 <strong>Row Level Security Active:</strong> All writing sessions and drafts are cryptographically isolated to your verified account ID ({currentUser.id.slice(0, 8)}...).</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Sign Out (Switch to Guest)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Register Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                  {error}
                </div>
              )}

              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full p-2.5 rounded-xl border font-sans text-xs bg-charcoal-950 border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/60"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full p-2.5 rounded-xl border font-sans text-xs bg-charcoal-950 border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/60"
                />
              </div>

              <div className="text-[11px] text-slate-500">
                Signing in enables multi-device cloud persistence via Supabase PostgreSQL with verified Row Level Security isolation.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-charcoal-950 hover:brightness-110 shadow-lg shadow-gold-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'Connecting to Workspace...' : isRegistering ? 'Register & Open Workspace' : 'Sign In with Email'}
              </button>


              <div className="pt-2 text-center text-xs text-slate-400">
                {isRegistering ? (
                  <span>Already have an account? <button type="button" onClick={() => setIsRegistering(false)} className="text-gold-300 font-semibold hover:underline">Sign In</button></span>
                ) : (
                  <span>New student? <button type="button" onClick={() => setIsRegistering(true)} className="text-gold-300 font-semibold hover:underline">Create Free Account</button></span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
