import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getAuthHeaders } from '../utils/session'

export interface HistoryItem {
  id: string
  mode: string
  tone?: number
  intensity?: string
  originalText: string
  humanizedText: string
  originalWords: number
  humanizedWords: number
  engine: string
  createdAt: string
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectHistory: (item: HistoryItem) => void
  onItemDeleted?: () => void
  sessionId: string
  userId?: string
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectHistory,
  onItemDeleted,
  sessionId,
  userId,
}) => {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { limit: 30 }
      if (sessionId) params.sessionId = sessionId
      if (userId) params.userId = userId

      const res = await axios.get('/api/history', { 
        params,
        headers: getAuthHeaders()
      })
      if (res.data?.history) {
        setItems(res.data.history)
      }
    } catch (err) {
      console.warn('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen, sessionId, userId])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Delete this saved writing session?')) return

    setDeletingId(id)
    try {
      const params: Record<string, any> = {}
      if (sessionId) params.sessionId = sessionId
      if (userId) params.userId = userId

      await axios.delete(`/api/history/${id}`, { 
        params,
        headers: getAuthHeaders()
      })
      setItems(prev => prev.filter(item => item.id !== id))
      if (onItemDeleted) onItemDeleted()
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div data-testid="history-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-charcoal-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-charcoal-850">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Saved Writing History</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-semibold">
                {items.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and reload past transformations into your workspace
            </p>
          </div>

          <button
            data-testid="close-history-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>


        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <span className="inline-block w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mr-2" />
              Loading your saved sessions...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium mb-1">No saved sessions yet</p>
              <p className="text-xs text-slate-500">
                Transform any text in the workspace to save it to your history.
              </p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistory(item)
                  onClose()
                }}
                className="p-4 rounded-xl bg-charcoal-950/70 border border-white/5 hover:border-gold-500/40 hover:bg-charcoal-850/80 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/20">
                      {item.mode}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {item.originalWords} → {item.humanizedWords} words
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
                      title="Delete entry"
                    >
                      {deletingId === item.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 font-mono leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                  {item.humanizedText}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="capitalize">Engine: {item.engine}</span>
                  <span className="text-gold-400 font-semibold group-hover:underline">Click to reload ↵</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-charcoal-950 flex justify-between items-center text-xs text-slate-500">
          <span>Click any entry to load back into workspace</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
