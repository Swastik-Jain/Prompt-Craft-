import React from 'react'
import { X, AlertCircle } from 'lucide-react'

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null

  const displayMessage =
    typeof message === 'string'
      ? message
      : Array.isArray(message)
      ? message
          .map((m) =>
            typeof m === 'object' && m !== null
              ? m.msg || m.message || JSON.stringify(m)
              : String(m)
          )
          .join(', ')
      : typeof message === 'object' && message !== null
      ? message.msg || message.message || message.error || JSON.stringify(message)
      : String(message)

  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl px-4 py-3 text-xs shadow-warm-sm">
      <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
      <span className="flex-1 leading-relaxed font-medium">{displayMessage}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-rose-500 hover:text-rose-800 transition-colors"
          aria-label="Dismiss message"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
