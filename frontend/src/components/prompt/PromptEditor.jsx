import React from 'react'
import { FileText } from 'lucide-react'

export default function PromptEditor({ value, onChange, placeholder }) {
  const charCount = value ? value.length : 0
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-terracotta-100 flex items-center justify-center">
            <FileText size={13} className="text-terracotta-600" />
          </div>
          Raw Instruction / Prompt
        </label>
        <span
          className={`text-xs font-mono ${
            charCount > 2000 ? 'text-amber-600 font-semibold' : 'text-[#8c7b69]'
          }`}
        >
          {wordCount} words · {charCount} chars
        </span>
      </div>

      <div className="relative rounded-2xl bg-[#ffffff] border border-[#e5ded3] p-1.5 focus-within:border-terracotta-500 focus-within:ring-2 focus-within:ring-terracotta-200 transition-all duration-150 shadow-warm-sm">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            'Enter your raw, unoptimized prompt here... (e.g. "Explain machine learning concepts to a novice")'
          }
          rows={5}
          className="w-full bg-[#faf8f5] border-0 rounded-xl px-4 py-3 text-sm text-[#241e18] placeholder-[#9e8f7d] resize-y focus:outline-none focus:ring-0 leading-relaxed font-sans"
        />
      </div>
    </div>
  )
}
