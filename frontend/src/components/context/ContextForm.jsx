import React, { useState } from 'react'
import {
  User,
  Users,
  Target,
  ShieldAlert,
  Layout,
  FileCode,
  Plus,
  X,
  Gauge,
} from 'lucide-react'

const OUTPUT_FORMATS = [
  { value: 'step-by-step', label: 'Step-by-step sequential breakdown' },
  { value: 'bullet-points', label: 'Structured bullet points & key highlights' },
  { value: 'paragraph', label: 'Dense, cohesive narrative paragraph' },
  { value: 'json', label: 'Strict JSON schema / Structured payload' },
  { value: 'table', label: 'Markdown comparison matrix / table' },
  { value: 'code', label: 'Executable code block with implementation notes' },
]

export default function ContextForm({ value, onChange }) {
  const [newConstraint, setNewConstraint] = useState('')

  const updateField = (field, val) => {
    onChange({ ...value, [field]: val })
  }

  const addConstraint = () => {
    const trimmed = newConstraint.trim()
    if (!trimmed) return
    const current = value.constraints || []
    if (!current.includes(trimmed)) {
      updateField('constraints', [...current, trimmed])
    }
    setNewConstraint('')
  }

  const removeConstraint = (idx) => {
    const current = value.constraints || []
    updateField(
      'constraints',
      current.filter((_, i) => i !== idx)
    )
  }

  // Token estimator: rough heuristic ~ 1.3 tokens per word
  const allText = [
    value.role || '',
    value.audience || '',
    value.goal || '',
    (value.constraints || []).join(' '),
    value.output_format || '',
    value.reference_text || '',
  ].join(' ')
  const words = allText.trim().split(/\s+/).filter(Boolean).length
  const estimatedTokens = Math.round(words * 1.33)

  return (
    <div className="space-y-6">
      {/* Token Budget Gauge Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#ffffff] border border-[#e7e0d5] shadow-warm-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
            <Gauge size={16} className="text-amber-700" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#43372c]">
              Context Token Budget
            </span>
            <p className="text-xs text-[#7c6c5b]">
              Assembled payload overhead sent with system prompt
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            ~{estimatedTokens} tokens ({words} words)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Role specification */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
            <User size={14} className="text-terracotta-600" />
            Persona / Expert Role
          </label>
          <input
            type="text"
            value={value.role || ''}
            onChange={(e) => updateField('role', e.target.value)}
            placeholder='e.g. Principal AI Research Scientist, Senior Pedagogist'
            className="w-full bg-[#faf8f5] border border-[#e3dbcf] rounded-xl px-4 py-2.5 text-sm text-[#241e18] placeholder-[#9e8f7d] focus:outline-none focus:ring-2 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
            <Users size={14} className="text-amber-600" />
            Target Audience & Depth
          </label>
          <input
            type="text"
            value={value.audience || ''}
            onChange={(e) => updateField('audience', e.target.value)}
            placeholder='e.g. 2nd-year CS undergraduates with no prior ML coursework'
            className="w-full bg-[#faf8f5] border border-[#e3dbcf] rounded-xl px-4 py-2.5 text-sm text-[#241e18] placeholder-[#9e8f7d] focus:outline-none focus:ring-2 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all"
          />
        </div>
      </div>

      {/* Task Objective / Goal */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
          <Target size={14} className="text-olive-600" />
          Primary Objective / Core Intent
        </label>
        <textarea
          rows={2}
          value={value.goal || ''}
          onChange={(e) => updateField('goal', e.target.value)}
          placeholder="e.g. Establish intuitive mathematical reasoning without getting bogged down in matrix proofs"
          className="w-full bg-[#faf8f5] border border-[#e3dbcf] rounded-xl px-4 py-2.5 text-sm text-[#241e18] placeholder-[#9e8f7d] resize-y focus:outline-none focus:ring-2 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all"
        />
      </div>

      {/* Operational Constraints */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
          <ShieldAlert size={14} className="text-rose-600" />
          Explicit Constraints & Boundaries
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newConstraint}
            onChange={(e) => setNewConstraint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addConstraint()
              }
            }}
            placeholder='e.g. "Do not use Python libraries other than NumPy", "Under 300 words"'
            className="flex-1 bg-[#faf8f5] border border-[#e3dbcf] rounded-xl px-4 py-2.5 text-sm text-[#241e18] placeholder-[#9e8f7d] focus:outline-none focus:ring-2 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all"
          />
          <button
            type="button"
            onClick={addConstraint}
            className="flex items-center gap-1.5 bg-[#f3ede3] hover:bg-[#eae2d5] border border-[#ded4c6] text-[#3d3328] px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus size={14} />
            Add Rule
          </button>
        </div>

        {value.constraints && value.constraints.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {value.constraints.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-terracotta-50 border border-terracotta-200 text-terracotta-800 text-xs shadow-sm font-medium"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => removeConstraint(i)}
                  className="text-terracotta-500 hover:text-rose-700 transition-colors"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Output Format Preference */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
          <Layout size={14} className="text-amber-700" />
          Structural Output Modality
        </label>
        <select
          value={value.output_format || 'step-by-step'}
          onChange={(e) => updateField('output_format', e.target.value)}
          className="w-full bg-[#faf8f5] border border-[#e3dbcf] rounded-xl px-4 py-2.5 text-sm text-[#241e18] focus:outline-none focus:ring-2 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all cursor-pointer"
        >
          {OUTPUT_FORMATS.map((fmt) => (
            <option key={fmt.value} value={fmt.value} className="bg-white text-[#241e18]">
              {fmt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grounding Reference Corpus */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
          <FileCode size={14} className="text-sand-700" />
          Grounding Corpus / Source Material (Optional Manual RAG)
        </label>
        <textarea
          rows={3}
          value={value.reference_text || ''}
          onChange={(e) => updateField('reference_text', e.target.value)}
          placeholder="Paste raw documentation snippets, domain rules, or factual context here to ground the response..."
          className="w-full bg-[#faf8f5] border border-[#e3dbcf] rounded-xl px-4 py-2.5 text-sm text-[#241e18] placeholder-[#9e8f7d] resize-y focus:outline-none focus:ring-2 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all font-mono text-xs"
        />
      </div>
    </div>
  )
}
