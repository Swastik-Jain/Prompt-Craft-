import React from 'react'

const METRICS = [
  { key: 'relevance', label: 'Relevance & Grounding', desc: 'Direct semantic alignment with prompt intent' },
  { key: 'completeness', label: 'Instruction Depth & Completeness', desc: 'Thoroughness across all requested requirements' },
  { key: 'format', label: 'Structural Compliance', desc: 'Adherence to requested layout and constraints' },
  { key: 'overall', label: 'Synthesis / Composite Score', desc: 'Weighted evaluative benchmark' },
]

function ScoreBar({ score, variant }) {
  const pct = Math.min(Math.max((score / 5) * 100, 0), 100)
  const isOptimized = variant === 'optimized'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-[#ede6da] rounded-full h-2 overflow-hidden border border-[#dfd7c9]">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            isOptimized
              ? 'bg-gradient-to-r from-terracotta-500 via-terracotta-600 to-amber-500 shadow-glow-terracotta'
              : 'bg-[#9d8d7c]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs font-mono font-semibold w-9 text-right ${
          score == null
            ? 'text-[#9c8c7c]'
            : isOptimized
            ? 'text-terracotta-700'
            : 'text-[#635546]'
        }`}
      >
        {score != null ? score.toFixed(1) : '—'}
      </span>
    </div>
  )
}

export default function ComparisonMetrics({ originalScores, optimizedScores }) {
  if (!originalScores && !optimizedScores) {
    return (
      <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl p-7 text-center shadow-warm-sm">
        <p className="text-[#847463] text-xs">
          Click <strong className="text-[#2b241e]">Evaluate Responses</strong> to compute multi-vector automated metrics.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl overflow-hidden shadow-warm-md">
      <div className="px-6 py-4 border-b border-[#eee8de] bg-[#faf7f2] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#3d3328]">
            Multi-Criteria Quality Evaluation
          </h3>
          <p className="text-[11px] text-[#786958] mt-0.5">Automated Heuristic / LLM-as-Judge Normalized Scale (0.0 – 5.0)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#9d8d7c]" />
            <span className="text-[#635546]">Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-terracotta-500" />
            <span className="text-terracotta-700 font-semibold">Optimized</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#eee8de] bg-[#fdfcfb]">
              <th className="px-6 py-3 text-left font-semibold text-[#6d5e4e] uppercase tracking-wider w-1/3">
                Evaluation Vector
              </th>
              <th className="px-6 py-3 text-left font-semibold text-[#6d5e4e] uppercase tracking-wider w-1/3">
                Baseline Prompt
              </th>
              <th className="px-6 py-3 text-left font-semibold text-terracotta-700 uppercase tracking-wider w-1/3">
                Optimized Prompt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee8de]">
            {METRICS.map(({ key, label, desc }) => {
              const origScore = originalScores?.[key]
              const optScore = optimizedScores?.[key]
              const delta = optScore != null && origScore != null ? (optScore - origScore) : null
              const isOverall = key === 'overall'

              return (
                <tr
                  key={key}
                  className={`hover:bg-[#faf7f2] transition-colors ${
                    isOverall ? 'bg-[#fcf8f4] font-medium' : ''
                  }`}
                >
                  <td className="px-6 py-3.5">
                    <p className={`font-medium ${isOverall ? 'text-terracotta-800 font-semibold' : 'text-[#2b241e]'}`}>
                      {label}
                    </p>
                    <p className="text-[10px] text-[#867767] mt-0.5">{desc}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <ScoreBar score={origScore} variant="original" />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ScoreBar score={optScore} variant="optimized" />
                      </div>
                      {delta != null && delta > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-olive-100 text-olive-700 font-semibold shrink-0">
                          +{delta.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
