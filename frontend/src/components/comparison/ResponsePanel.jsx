import React from 'react'
import { Clock, Zap, Hash, Copy, Check } from 'lucide-react'

export default function ResponsePanel({
  title,
  response_text,
  latency_ms,
  input_tokens,
  output_tokens,
  variant = 'original',
}) {
  const isOptimized = variant === 'optimized'
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    if (!response_text) return
    await navigator.clipboard.writeText(response_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!response_text) {
    return (
      <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl flex flex-col overflow-hidden h-full shadow-warm-sm">
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isOptimized
              ? 'bg-[#fdf6f3] border-terracotta-200'
              : 'bg-[#f6f2ea] border-[#e7e0d3]'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3d3328]">
            {title}
          </span>
          <span
            className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
              isOptimized
                ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
                : 'bg-[#eae3d5] text-[#635546] border border-[#ded4c4]'
            }`}
          >
            {isOptimized ? 'Optimized Architecture' : 'Raw Baseline'}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#f5efe5] border border-[#e5dcd0] flex items-center justify-center mb-3">
            <Zap size={16} className="text-[#968674]" />
          </div>
          <p className="text-[#847463] text-xs max-w-xs">
            Awaiting execution. Run comparison to synthesize and stream model output.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-[#ffffff] border rounded-2xl flex flex-col overflow-hidden h-full shadow-warm-md transition-all duration-200 ${
        isOptimized
          ? 'border-terracotta-300 ring-1 ring-terracotta-100'
          : 'border-[#e7e1d5]'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-3.5 border-b ${
          isOptimized
            ? 'bg-gradient-to-r from-terracotta-50 to-[#faf5f0] border-terracotta-200'
            : 'bg-[#f6f2ea] border-[#e7e0d3]'
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#3d3328]">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
              isOptimized
                ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
                : 'bg-[#eae3d5] text-[#635546] border border-[#ded4c4]'
            }`}
          >
            {isOptimized ? 'Optimized' : 'Baseline'}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-[#7c6d5d] hover:text-[#2d241d] hover:bg-[#ece5d8] transition-colors"
            title="Copy text"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="flex items-center gap-4 px-5 py-2.5 bg-[#faf7f2] border-b border-[#eee7db] text-xs font-mono text-[#6e6050]">
        {latency_ms != null && (
          <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <Clock size={12} className="text-amber-600" />
            {latency_ms}ms
          </span>
        )}
        {input_tokens != null && (
          <span className="flex items-center gap-1.5 text-olive-700">
            <Hash size={12} className="text-olive-600" />
            {input_tokens} prompt tokens
          </span>
        )}
        {output_tokens != null && (
          <span className="flex items-center gap-1.5 text-sand-800">
            <Zap size={12} className="text-amber-600" />
            {output_tokens} completion tokens
          </span>
        )}
      </div>

      {/* Response text */}
      <div className="flex-1 overflow-y-auto p-5 max-h-[420px] bg-[#ffffff]">
        <p className="text-xs text-[#28211b] font-sans leading-relaxed whitespace-pre-wrap selection:bg-terracotta-100">
          {response_text}
        </p>
      </div>
    </div>
  )
}
