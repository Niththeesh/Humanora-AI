/**
 * Humanora AI — Client Session & User Identity Utilities
 * Provides secure, persistent guest session tokens and authenticated user profile management.
 */

const SESSION_STORAGE_KEY = 'humanora_session_id'
const SESSION_TOKEN_STORAGE_KEY = 'humanora_session_token'
const USER_STORAGE_KEY = 'humanora_user_profile'
const USER_TOKEN_STORAGE_KEY = 'humanora_user_token'

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  tier: 'free' | 'pro' | 'enterprise'
  monthlyWordLimit: number
}

const isUuid = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

export function getOrCreateSessionId(): string {
  try {
    let existing = localStorage.getItem(SESSION_STORAGE_KEY)
    if (existing && isUuid(existing)) {
      return existing
    }

    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
        })

    localStorage.setItem(SESSION_STORAGE_KEY, newId)
    return newId
  } catch {
    return '11111111-1111-4111-8111-111111111111'
  }
}

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setSessionToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
    }
  } catch {}
}

export function getUserToken(): string | null {
  try {
    return localStorage.getItem(USER_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setUserToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(USER_TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(USER_TOKEN_STORAGE_KEY)
    }
  } catch {}
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function setCurrentUser(user: UserProfile | null, token?: string): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      if (token) {
        setUserToken(token)
      }
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(USER_TOKEN_STORAGE_KEY)
    }
  } catch {}
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const userToken = getUserToken()
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`
  }
  const sessionToken = getSessionToken()
  if (sessionToken) {
    headers['x-session-token'] = sessionToken
  }
  return headers
}

export function resetGuestSession(): string {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(USER_TOKEN_STORAGE_KEY)
  } catch {}
  return getOrCreateSessionId()
}

