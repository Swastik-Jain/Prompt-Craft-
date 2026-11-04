import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const METRIC_LABELS = {
  relevance: 'Relevance',
  completeness: 'Completeness',
  format: 'Format Compliance',
  overall: 'Composite Quality',
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#ffffff] border border-[#ded5c7] rounded-xl px-3.5 py-2.5 text-xs shadow-warm-lg">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5 font-mono">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="text-[#2b241e] font-semibold">{p.value?.toFixed(1)} / 5.0</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ScoreChart({ originalScores, optimizedScores }) {
  if (!originalScores && !optimizedScores) return null

  const data = Object.keys(METRIC_LABELS).map((key) => ({
    metric: METRIC_LABELS[key],
    Baseline: originalScores?.[key] ?? 0,
    Optimized: optimizedScores?.[key] ?? 0,
  }))

  return (
    <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl p-6 shadow-warm-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#3d3328]">
            Multi-Axis Performance Radar
          </h3>
          <p className="text-[11px] text-[#786958] mt-0.5">Differential comparison across qualitative pillars</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={290}>
        <RadarChart data={data} outerRadius={95}>
          <PolarGrid stroke="#e5ded4" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#5f5244', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
          />
          <Radar
            name="Baseline"
            dataKey="Baseline"
            stroke="#9d8d7c"
            fill="#9d8d7c"
            fillOpacity={0.2}
            strokeWidth={1.5}
          />
          <Radar
            name="Optimized"
            dataKey="Optimized"
            stroke="#c85a38"
            fill="#c85a38"
            fillOpacity={0.35}
            strokeWidth={2.5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => (
              <span className="text-xs font-mono px-1 font-semibold" style={{ color: v === 'Optimized' ? '#b44a29' : '#706253' }}>
                {v}
              </span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
