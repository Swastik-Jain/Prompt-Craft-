import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History as HistoryIcon, Trash2, Eye, Wand2, ChevronDown, ChevronUp, Layers } from 'lucide-react'
import { useExperiment } from '../hooks/useExperiment'
import { useExperimentContext } from '../context/ExperimentContext'
import { deleteExperiment } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const STRATEGY_THEMES = {
  'zero-shot': 'bg-amber-100 text-amber-800 border-amber-200',
  'role-based': 'bg-terracotta-100 text-terracotta-800 border-terracotta-200',
  'few-shot': 'bg-sand-200 text-sand-800 border-sand-300',
  'context-aware': 'bg-olive-100 text-olive-800 border-olive-200',
}

function ScorePill({ score, label }) {
  if (score == null) return null
  const color =
    score >= 4
      ? 'text-olive-700 bg-olive-50 border-olive-200 font-semibold'
      : score >= 2.8
      ? 'text-amber-700 bg-amber-50 border-amber-200 font-semibold'
      : 'text-rose-700 bg-rose-50 border-rose-200 font-semibold'

  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${color}`}>
      {label}: {score.toFixed(1)}
    </span>
  )
}

function ExperimentCard({ experiment, onDelete, onReuse }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  const evaluation = experiment.evaluation || {}
  const scores = evaluation.optimized_scores || null

  return (
    <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl overflow-hidden hover:border-[#d5cbbd] transition-all duration-200 shadow-warm-sm">
      {/* Card Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border font-semibold ${
                  STRATEGY_THEMES[experiment.strategy] || 'bg-[#f4efe8] text-[#5c4f42] border-[#ded4c6]'
                }`}
              >
                {experiment.strategy || 'zero-shot'}
              </span>
              {experiment.created_at && (
                <span className="text-xs text-[#8c7b69]">
                  {new Date(experiment.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#28211b] line-clamp-2 leading-relaxed">
              {experiment.original_prompt || experiment.raw_prompt || 'No prompt recorded'}
            </p>
            {scores && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                <ScorePill score={scores.overall} label="Overall" />
                <ScorePill score={scores.relevance} label="Relevance" />
                <ScorePill score={scores.completeness} label="Depth" />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3.5 border-t border-[#eee8de]">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#635546] hover:text-[#28211b] bg-[#f5efe5] hover:bg-[#eae2d5] px-3 py-1.5 rounded-lg border border-[#ded5c7] transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>{expanded ? 'Collapse' : 'Details'}</span>
          </button>
          <button
            onClick={() => navigate(`/compare?id=${experiment.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 hover:text-white bg-terracotta-100 hover:bg-terracotta-600 px-3 py-1.5 rounded-lg border border-terracotta-200 transition-colors"
          >
            <Eye size={13} />
            <span>Matrix</span>
          </button>
          <button
            onClick={() => onReuse(experiment)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-white bg-amber-100 hover:bg-amber-600 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
          >
            <Wand2 size={13} />
            <span>Reuse</span>
          </button>
          <button
            onClick={() => onDelete(experiment.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors ml-auto"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="border-t border-[#eee8de] bg-[#faf7f2] px-5 py-4 space-y-3">
          {experiment.optimized_prompt && (
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-terracotta-700 mb-1">
                Optimized Prompt Artifact
              </p>
              <p className="text-xs text-[#28211b] leading-relaxed whitespace-pre-wrap bg-[#ffffff] p-3 rounded-xl border border-[#e5dfd4]">
                {experiment.optimized_prompt}
              </p>
            </div>
          )}
          {experiment.context_json && Object.keys(experiment.context_json).some((k) => experiment.context_json[k]) && (
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#867664] mb-1.5">
                Context Profile
              </p>
              <div className="space-y-1 text-xs text-[#4e4033]">
                {experiment.context_json.role && (
                  <p>
                    <span className="text-[#867664]">Persona:</span> {experiment.context_json.role}
                  </p>
                )}
                {experiment.context_json.audience && (
                  <p>
                    <span className="text-[#867664]">Audience:</span> {experiment.context_json.audience}
                  </p>
                )}
                {experiment.context_json.output_format && (
                  <p>
                    <span className="text-[#867664]">Format:</span> {experiment.context_json.output_format}
                  </p>
                )}
              </div>
            </div>
          )}
          {scores && (
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#867664] mb-2">
                Evaluative Breakdown
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(scores).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between bg-[#ffffff] border border-[#e5dfd4] rounded-lg px-3 py-1.5">
                    <span className="text-xs text-[#6e5f50] capitalize">{k}</span>
                    <span className="text-xs font-mono font-semibold text-[#28211b]">{v?.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function History() {
  const navigate = useNavigate()
  const { loadHistory } = useExperiment()
  const { experiments, setExperiments, error, setError, setRawPrompt, setSelectedStrategy } =
    useExperimentContext()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    loadHistory().finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this experiment from local SQLite database?')) return
    const result = await deleteExperiment(id)
    if (result && result.error) {
      setError(result.error)
    } else {
      setExperiments((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const handleReuse = (experiment) => {
    const promptToUse = experiment.original_prompt || experiment.raw_prompt
    if (promptToUse) setRawPrompt(promptToUse)
    if (experiment.strategy) setSelectedStrategy(experiment.strategy)
    navigate('/studio')
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200 border border-sand-300 text-sand-800 text-xs font-semibold mb-1">
            <HistoryIcon size={12} />
            Persistent SQLite Archive
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#28211b] flex items-center gap-2.5">
            Experiment Archive & Laboratory History
          </h2>
          <p className="text-xs text-[#706253]">
            {experiments.length} experiment{experiments.length !== 1 ? 's' : ''} cataloged across testing suites
          </p>
        </div>
        <button
          onClick={() => navigate('/studio')}
          className="btn-primary self-start sm:self-auto text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          + New Experiment
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Querying experiment archive..." />
      ) : experiments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#f5efe5] border border-[#e5dcd0] flex items-center justify-center mb-4">
            <Layers size={22} className="text-[#968674]" />
          </div>
          <h3 className="text-sm font-bold text-[#28211b] mb-1">Archive is Empty</h3>
          <p className="text-xs text-[#706253] mb-6 leading-relaxed">
            Execute your first prompt optimization and response comparison run to persist records and benchmarks.
          </p>
          <button
            onClick={() => navigate('/studio')}
            className="btn-primary text-xs font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Launch Prompt Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {experiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onDelete={handleDelete}
              onReuse={handleReuse}
            />
          ))}
        </div>
      )}
    </div>
  )
}
