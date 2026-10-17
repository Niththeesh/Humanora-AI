import crypto from 'crypto'

/**
 * Humanora AI — Thread-Safe Session & Transformation Cache Service
 * 
 * Solves:
 * 1. Cache Stampede / Thundering Herd: Coalesces concurrent in-flight requests for the
 *    same transformation into a single shared execution (Single-Flight Promise Deduplication).
 * 2. Cross-Session Tenant Isolation: Pure transformation content is cached while session ownership,
 *    database records, and cryptographic session tokens remain strictly isolated per caller.
 * 3. Hash Collision & Truncation Vulnerability: Replaces naive 100-char prefix matching with
 *    full-text SHA-256 and parameter-aware cryptographic key derivation.
 * 4. Concurrent LRU Corruption: Thread-safe, bounded capacity management with atomic reordering
 *    and TTL expiration.
 */

export interface CacheKeyParams {
  text: string
  mode?: string
  tone?: number
  intensity?: string
  targetLength?: string
  vocabulary?: boolean
  highlights?: boolean
  authorVoice?: string
  studentVoiceSample?: string
}

export interface CachedTransformation {
  humanizedText: string
  originalText: string
  mode: string
  engine: 'gemini' | 'linguistic-engine'
  model: string
  isFallback?: boolean
  parameters: {
    tone?: number
    complexity?: number
    intensity?: string
    targetLength?: string
    vocabulary?: boolean
    authorVoice?: string
  }
  stats: {
    originalLength: number
    humanizedLength: number
    originalWords: number
    humanizedWords: number
    processingTimeMs: number
  }
  changesExplanation?: string[]
  factualIntegrity?: any
  academicReport?: any
  studentVoiceProfile?: any
  warning?: string
  highlights?: any[]
  aiMetrics?: any
}

interface CacheEntry<T> {
  data: T
  createdAt: number
  expiresAt: number
  accessCount: number
}

export interface CacheStats {
  size: number
  maxSize: number
  hits: number
  misses: number
  inFlightCoalesced: number
  evictions: number
  expirations: number
}

export class SessionCacheService {
  private cache: Map<string, CacheEntry<CachedTransformation>> = new Map()
  private inFlightMap: Map<string, Promise<CachedTransformation>> = new Map()
  private readonly defaultTtlMs: number
  private readonly maxCapacity: number

  // Metrics
  private hits: number = 0
  private misses: number = 0
  private inFlightCoalesced: number = 0
  private evictions: number = 0
  private expirations: number = 0

  constructor(options?: { ttlMs?: number; maxCapacity?: number }) {
    this.defaultTtlMs = options?.ttlMs ?? 5 * 60 * 1000 // 5 minutes default
    this.maxCapacity = options?.maxCapacity ?? 200 // Max 200 cached transformations
  }

  /**
   * Generates a deterministic, collision-resistant SHA-256 cache key from full text and parameters.
   */
  public getCacheKey(params: CacheKeyParams): string {
    const normalizedText = (params.text || '').trim()
    const textHash = crypto.createHash('sha256').update(normalizedText).digest('hex')
    
    const mode = (params.mode || 'academic').toLowerCase()
    const tone = typeof params.tone === 'number' ? params.tone.toFixed(2) : '0.50'
    const intensity = params.intensity || 'balanced'
    const targetLength = params.targetLength || 'same'
    const vocabulary = params.vocabulary ? '1' : '0'
    const authorVoice = (params.authorVoice || 'scholarly').toLowerCase()

    let voiceHash = 'none'
    if (params.studentVoiceSample && params.studentVoiceSample.trim()) {
      voiceHash = crypto.createHash('sha256').update(params.studentVoiceSample.trim()).digest('hex').substring(0, 16)
    }

    return `tx:${mode}:${textHash}:${tone}:${intensity}:${targetLength}:${vocabulary}:${authorVoice}:${voiceHash}`
  }

  /**
   * Retrieves a cached entry if present and not expired.
   * Atomically refreshes LRU recency on hit.
   */
  public get(key: string): CachedTransformation | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.misses++
      return null
    }

    const now = Date.now()
    if (now > entry.expiresAt) {
      // Expired entry
      this.cache.delete(key)
      this.expirations++
      this.misses++
      return null
    }

    // Atomic LRU promotion: re-insert at tail of Map
    this.cache.delete(key)
    entry.accessCount++
    this.cache.set(key, entry)

    this.hits++
    return entry.data
  }

  /**
   * Stores an entry in the cache with bounded capacity and TTL.
   */
  public set(key: string, data: CachedTransformation, ttlMs?: number): void {
    const now = Date.now()
    const ttl = ttlMs ?? this.defaultTtlMs

    // Evict least-recently-used item if at max capacity
    if (this.cache.size >= this.maxCapacity && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.evictions++
      }
    }

    // If key already existed, remove it so new set appends at tail
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    this.cache.set(key, {
      data,
      createdAt: now,
      expiresAt: now + ttl,
      accessCount: 1
    })
  }

  /**
   * Single-Flight In-Flight Promise Coalescing:
   * If an in-flight computation is already active for this exact key, subsequent concurrent
   * callers join the pending Promise rather than launching redundant expensive operations.
   */
  public async getOrCompute(
    key: string,
    computeFn: () => Promise<CachedTransformation>,
    ttlMs?: number
  ): Promise<CachedTransformation> {
    // 1. Check existing cached item
    const cached = this.get(key)
    if (cached) {
      return cached
    }

    // 2. Check if a concurrent request is already computing this exact key
    const inFlight = this.inFlightMap.get(key)
    if (inFlight) {
      this.inFlightCoalesced++
      return await inFlight
    }

    // 3. Initiate single-flight computation
    const computePromise = (async () => {
      try {
        const result = await computeFn()
        // Only cache genuine cloud transformations; never poison cache with degraded fallback responses
        if (!result.isFallback && result.engine === 'gemini') {
          this.set(key, result, ttlMs)
        }
        return result
      } finally {
        // Guaranteed cleanup of in-flight tracking in all scenarios
        this.inFlightMap.delete(key)
      }
    })()

    this.inFlightMap.set(key, computePromise)
    return await computePromise
  }

  /**
   * Checks whether a key is currently being computed in-flight.
   */
  public isInFlight(key: string): boolean {
    return this.inFlightMap.has(key)
  }

  /**
   * Checks whether a valid (non-expired) entry exists for the key.
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.expirations++
      return false
    }
    return true
  }

  /**
   * Deletes a key from the cache.
   */
  public delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clears all cache entries and in-flight tracking.
   */
  public clear(): void {
    this.cache.clear()
    this.inFlightMap.clear()
    this.hits = 0
    this.misses = 0
    this.inFlightCoalesced = 0
    this.evictions = 0
    this.expirations = 0
  }

  /**
   * Returns current cache operational metrics.
   */
  public getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.maxCapacity,
      hits: this.hits,
      misses: this.misses,
      inFlightCoalesced: this.inFlightCoalesced,
      evictions: this.evictions,
      expirations: this.expirations
    }
  }
}

export const sessionCacheService = new SessionCacheService()
