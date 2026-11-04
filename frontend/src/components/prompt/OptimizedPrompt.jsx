import React, { useState } from 'react'
import { Copy, Check, Sparkles, Terminal } from 'lucide-react'

export default function OptimizedPrompt({ prompt, isLoading }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = prompt ? prompt.trim().split(/\s+/).filter(Boolean).length : 0

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1d5] p-8 text-center space-y-4 shadow-warm-sm">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-terracotta-200 border-t-terracotta-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-amber-200 border-b-amber-500 animate-spin animate-reverse" />
          <div className="w-12 h-12 flex items-center justify-center">
            <Sparkles size={18} className="text-terracotta-600 animate-pulse" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2b241e]">
            Synthesizing Optimized Prompt Architecture...
          </p>
          <p className="text-xs text-[#7e6f5f] mt-1">
            Applying structural constraints and role alignment via Gemini
          </p>
        </div>
      </div>
    )
  }

  if (!prompt) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-olive-100 flex items-center justify-center">
            <Sparkles size={13} className="text-olive-600" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#635548]">
            Optimized Prompt Artifact
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-olive-100 text-olive-700 border border-olive-200 font-semibold">
            Ready
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-[#8c7b69]">
            {wordCount} words
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-[#f3ede3] hover:bg-[#eae2d5] border border-[#ded5c7] text-[#3d3328] transition-colors duration-150"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-[#6d5f50]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#ffffff] border border-[#e5ded3] overflow-hidden shadow-warm-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-[#f5efe5] border-b border-[#e7e0d3]">
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-terracotta-600" />
            <span className="text-xs font-mono text-[#6d5e4f]">system_prompt_rewritten.md</span>
          </div>
          <span className="text-[11px] text-[#9a8977] font-mono">UTF-8</span>
        </div>
        <pre className="p-4 text-xs font-mono text-[#28211b] bg-[#faf8f5] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-terracotta-100">
          {prompt}
        </pre>
      </div>
    </div>
  )
}
