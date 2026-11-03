import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const isUuid = (str: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

export interface TransformationRecord {
  id: string
  sessionId?: string
  userId?: string
  mode: string
  tone?: number
  intensity?: string
  originalText: string
  humanizedText: string
  originalWords: number
  humanizedWords: number
  originalChars: number
  humanizedChars: number
  engine: 'gemini' | 'linguistic-engine'
  modelVersion?: string
  latencyMs?: number
  createdAt: string
  persistedDurable: boolean
  persistenceNote?: string
  ephemeral?: boolean
}

export interface HistoryQueryResult {
  history: TransformationRecord[]
  count: number
  durableStorageActive: boolean
  schemaStatus: 'active' | 'schema_migration_required' | 'not_configured'
  diagnosticMessage?: string
}

class DatabaseService {
  private client: SupabaseClient | null = null
  private memoryHistory: Map<string, TransformationRecord> = new Map()
  private isConfigured: boolean = false
  private tableVerified: boolean = false
  private schemaError: string | null = null

  constructor() {
    if (!process.env.SUPABASE_URL) {
      try {
        const dotenv = require('dotenv')
        const path = require('path')
        dotenv.config({ path: path.resolve(__dirname, '../../.env') })
        dotenv.config()
      } catch (_) {}
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      try {
        this.client = createClient(supabaseUrl, supabaseKey)
        this.isConfigured = true
        console.log('[DatabaseService] Initialized Supabase client for project:', supabaseUrl)
        this.verifySchemaAsync()
      } catch (err: any) {
        console.warn('[DatabaseService] Failed to initialize Supabase client:', err.message)
        this.client = null
        this.isConfigured = false
      }
    } else {
      console.log('[DatabaseService] Supabase credentials not found. Using local in-memory session persistence.')
    }
  }

  public async verifySchemaAsync(): Promise<boolean> {
    if (!this.client || !this.isConfigured) return false

    try {
      const { error } = await this.client
        .from('transformations')
        .select('id')
        .limit(1)

      if (error) {
        this.tableVerified = false
        this.schemaError = error.message
        return false
      }

      this.tableVerified = true
      this.schemaError = null
      return true
    } catch (err: any) {
      this.tableVerified = false
      this.schemaError = err.message
      return false
    }
  }

  public getStatus(): {
    isConfigured: boolean
    tableVerified: boolean
    provider: string
    schemaStatus: 'active' | 'schema_migration_required' | 'not_configured'
    message: string
  } {
    if (!this.isConfigured) {
      return {
        isConfigured: false,
        tableVerified: false,
        provider: 'in-memory',
        schemaStatus: 'not_configured',
        message: 'Supabase credentials not configured in backend/.env. Using local session persistence.'
      }
    }

    if (this.tableVerified) {
      return {
        isConfigured: true,
        tableVerified: true,
        provider: 'supabase',
        schemaStatus: 'active',
        message: 'Connected to Supabase PostgreSQL with verified schema tables.'
      }
    }

    return {
      isConfigured: true,
      tableVerified: false,
      provider: 'in-memory',
      schemaStatus: 'schema_migration_required',
      message: `Connected to Supabase endpoint, but table 'public.transformations' is pending migration (${this.schemaError || 'schema cache'}). Execute backend/migrations/001_initial_schema.sql in Supabase SQL Editor.`
    }
  }

  private saveToMemoryHistory(id: string, record: TransformationRecord): void {
    this.memoryHistory.set(id, record)
    const MAX_MEMORY_HISTORY = 200
    if (this.memoryHistory.size > MAX_MEMORY_HISTORY) {
      const oldestKey = this.memoryHistory.keys().next().value
      if (oldestKey) this.memoryHistory.delete(oldestKey)
    }
  }

  /**
   * Saves a transformation record.
   * If ephemeral privacy mode is enabled, skips database persistence completely.
   */
  public async saveTransformation(
    record: Omit<TransformationRecord, 'id' | 'createdAt' | 'persistedDurable'>,
    ephemeral: boolean = false
  ): Promise<TransformationRecord> {
    const id = randomUUID()
    const createdAt = new Date().toISOString()

    // If student opted into ephemeral mode, respect privacy and do not store permanently
    if (ephemeral) {
      return {
        ...record,
        id,
        createdAt,
        persistedDurable: false,
        ephemeral: true,
        persistenceNote: 'Ephemeral privacy mode: Assignment content processed in memory and not retained.'
      }
    }

    // Default optimistic memory record
    let fullRecord: TransformationRecord = {
      ...record,
      id,
      createdAt,
      persistedDurable: false,
      persistenceNote: 'In-memory session storage'
    }

    if (this.isConfigured && this.client) {
      try {
        if (fullRecord.sessionId && isUuid(fullRecord.sessionId)) {
          try {
            await this.client
              .from('writing_sessions')
              .upsert({
                id: fullRecord.sessionId,
                session_token: fullRecord.sessionId,
                title: 'Academic Writing Session'
              }, { onConflict: 'id' })
          } catch (_) {}
        }

        if (fullRecord.userId && isUuid(fullRecord.userId)) {
          try {
            await this.client
              .from('profiles')
              .upsert({
                id: fullRecord.userId,
                email: `${fullRecord.userId}@student.humanora.ai`,
                tier: 'pro'
              }, { onConflict: 'id' })
          } catch (_) {}
        }

        const { data, error } = await this.client
          .from('transformations')
          .insert({
            id: fullRecord.id,
            session_id: fullRecord.sessionId || null,
            user_id: fullRecord.userId || null,
            mode: fullRecord.mode,
            tone_value: fullRecord.tone ?? 0.5,
            intensity: fullRecord.intensity ?? 'balanced',
            original_text: fullRecord.originalText,
            humanized_text: fullRecord.humanizedText,
            original_word_count: fullRecord.originalWords,
            humanized_word_count: fullRecord.humanizedWords,
            original_char_count: fullRecord.originalChars,
            humanized_char_count: fullRecord.humanizedChars,
            engine_used: fullRecord.engine,
            model_version: fullRecord.modelVersion ?? null,
            latency_ms: fullRecord.latencyMs ?? null,
            created_at: fullRecord.createdAt
          })
          .select()
          .single()

        if (error) {
          console.warn('[DatabaseService] Supabase insert failed (' + error.message + '). Saving to in-memory session.')
          this.tableVerified = false
          this.schemaError = error.message
          fullRecord.persistenceNote = `Saved to session memory (Supabase table notice: ${error.message}).`
          this.saveToMemoryHistory(id, fullRecord)
        } else if (data) {
          this.tableVerified = true
          this.schemaError = null
          fullRecord = {
            id: data.id,
            sessionId: data.session_id,
            userId: data.user_id,
            mode: data.mode,
            tone: data.tone_value,
            intensity: data.intensity,
            originalText: data.original_text,
            humanizedText: data.humanized_text,
            originalWords: data.original_word_count,
            humanizedWords: data.humanized_word_count,
            originalChars: data.original_char_count,
            humanizedChars: data.humanized_char_count,
            engine: data.engine_used,
            modelVersion: data.model_version,
            latencyMs: data.latency_ms,
            createdAt: data.created_at,
            persistedDurable: true,
            persistenceNote: 'Persisted to Supabase PostgreSQL'
          }
        }
      } catch (err: any) {
        console.warn('[DatabaseService] Error during Supabase insert:', err.message)
        fullRecord.persistenceNote = `Saved to session memory (Connection error: ${err.message})`
        this.saveToMemoryHistory(id, fullRecord)
      }
    } else {
      this.saveToMemoryHistory(id, fullRecord)
    }

    return fullRecord
  }

  /**
   * Retrieves history with mandatory session or user ownership scoping.
   * Unauthenticated or unscoped queries strictly return empty results.
   */
  public async getHistory(limit: number = 20, sessionId?: string, userId?: string): Promise<HistoryQueryResult> {
    const status = this.getStatus()
    const hasValidSession = Boolean(sessionId && isUuid(sessionId))
    const hasValidUser = Boolean(userId && isUuid(userId))

    // Privacy & Security Enforcement: Never allow unscoped global history retrieval
    if (!hasValidSession && !hasValidUser) {
      return {
        history: [],
        count: 0,
        durableStorageActive: status.isConfigured,
        schemaStatus: status.schemaStatus,
        diagnosticMessage: 'Authentication or session identification is required to retrieve transformation history.'
      }
    }

    if (this.isConfigured && this.client) {
      try {
        let query = this.client
          .from('transformations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        // Enforce ownership check
        if (hasValidSession) {
          query = query.eq('session_id', sessionId!)
        } else if (hasValidUser) {
          query = query.eq('user_id', userId!)
        }

        const { data, error } = await query

        if (!error && data) {
          this.tableVerified = true
          const formatted: TransformationRecord[] = data.map(item => ({
            id: item.id,
            sessionId: item.session_id,
            userId: item.user_id,
            mode: item.mode,
            tone: item.tone_value,
            intensity: item.intensity,
            originalText: item.original_text,
            humanizedText: item.humanized_text,
            originalWords: item.original_word_count,
            humanizedWords: item.humanized_word_count,
            originalChars: item.original_char_count,
            humanizedChars: item.humanized_char_count,
            engine: item.engine_used,
            modelVersion: item.model_version,
            latencyMs: item.latency_ms,
            createdAt: item.created_at,
            persistedDurable: true,
            persistenceNote: 'Supabase PostgreSQL'
          }))

          for (const memItem of this.memoryHistory.values()) {
            const matchesSession = hasValidSession && memItem.sessionId === sessionId
            const matchesUser = hasValidUser && memItem.userId === userId
            if ((matchesSession || matchesUser) && !formatted.some(f => f.id === memItem.id)) {
              formatted.unshift(memItem)
            }
          }

          return {
            history: formatted.slice(0, limit),
            count: formatted.length,
            durableStorageActive: true,
            schemaStatus: 'active'
          }
        } else if (error) {
          this.tableVerified = false
          this.schemaError = error.message
        }
      } catch (err: any) {
        console.warn('[DatabaseService] Error fetching Supabase history:', err.message)
      }
    }

    // Fallback: In-memory scoped history
    let memoryItems = Array.from(this.memoryHistory.values())
    if (hasValidSession) {
      memoryItems = memoryItems.filter(item => item.sessionId === sessionId)
    } else if (hasValidUser) {
      memoryItems = memoryItems.filter(item => item.userId === userId)
    } else {
      memoryItems = []
    }

    const sorted = memoryItems
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return {
      history: sorted,
      count: sorted.length,
      durableStorageActive: false,
      schemaStatus: status.schemaStatus,
      diagnosticMessage: status.message
    }
  }

  public async getTransformationById(id: string, sessionId?: string, userId?: string): Promise<TransformationRecord | null> {
    const hasValidSession = Boolean(sessionId && isUuid(sessionId))
    const hasValidUser = Boolean(userId && isUuid(userId))

    // Privacy & Security Enforcement: Refuse unscoped object lookups
    if (!hasValidSession && !hasValidUser) {
      return null
    }

    if (this.isConfigured && this.client && this.tableVerified && isUuid(id)) {
      try {
        let query = this.client
          .from('transformations')
          .select('*')
          .eq('id', id)

        if (hasValidSession) {
          query = query.eq('session_id', sessionId!)
        } else if (hasValidUser) {
          query = query.eq('user_id', userId!)
        }

        const { data, error } = await query.single()

        if (!error && data) {
          return {
            id: data.id,
            sessionId: data.session_id,
            userId: data.user_id,
            mode: data.mode,
            tone: data.tone_value,
            intensity: data.intensity,
            originalText: data.original_text,
            humanizedText: data.humanized_text,
            originalWords: data.original_word_count,
            humanizedWords: data.humanized_word_count,
            originalChars: data.original_char_count,
            humanizedChars: data.humanized_char_count,
            engine: data.engine_used,
            modelVersion: data.model_version,
            latencyMs: data.latency_ms,
            createdAt: data.created_at,
            persistedDurable: true
          }
        }
      } catch (err: any) {
        console.warn('[DatabaseService] Error fetching transformation by id:', err.message)
      }
    }

    const record = this.memoryHistory.get(id)
    if (!record) return null
    if (hasValidSession && record.sessionId !== sessionId) return null
    if (hasValidUser && record.userId !== userId) return null
    return record
  }

  /**
   * Deletes a transformation with mandatory ownership verification.
   */
  public async deleteTransformation(id: string, sessionId?: string, userId?: string): Promise<boolean> {
    const hasValidSession = Boolean(sessionId && isUuid(sessionId))
    const hasValidUser = Boolean(userId && isUuid(userId))

    // Privacy & Security Enforcement: Refuse unscoped deletions
    if (!hasValidSession && !hasValidUser) {
      return false
    }

    let deleted = false

    if (this.isConfigured && this.client && this.tableVerified && isUuid(id)) {
      try {
        let query = this.client
          .from('transformations')
          .delete()
          .eq('id', id)

        if (hasValidSession) {
          query = query.eq('session_id', sessionId!)
        } else if (hasValidUser) {
          query = query.eq('user_id', userId!)
        }

        const { data, error } = await query.select('id')
        if (!error && Array.isArray(data) && data.length > 0) {
          deleted = true
        }
      } catch (err: any) {
        console.warn('[DatabaseService] Error deleting Supabase transformation:', err.message)
      }
    }


    if (this.memoryHistory.has(id)) {
      const memRecord = this.memoryHistory.get(id)
      const allowed = (hasValidSession && memRecord?.sessionId === sessionId) ||
                      (hasValidUser && memRecord?.userId === userId)
      if (allowed) {
        this.memoryHistory.delete(id)
        deleted = true
      }
    }

    return deleted
  }
}

export const databaseService = new DatabaseService()
