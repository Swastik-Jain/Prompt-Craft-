import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { GitCompare, Star, FlaskConical, History, Sparkles } from 'lucide-react'
import { useExperimentContext } from '../context/ExperimentContext'
import { useExperiment } from '../hooks/useExperiment'
import { getExperiment } from '../services/api'
import ResponsePanel from '../components/comparison/ResponsePanel'
import ComparisonMetrics from '../components/comparison/ComparisonMetrics'
import ScoreChart from '../components/comparison/ScoreChart'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function Comparison() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const idParam = searchParams.get('id')

  const { currentExperiment, setCurrentExperiment, isLoading, error, setError } =
    useExperimentContext()
  const { handleEvaluate, handleCompare } = useExperiment()

  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    if (idParam && (!currentExperiment || String(currentExperiment.id) !== String(idParam))) {
      setLocalLoading(true)
      getExperiment(idParam).then((result) => {
        setLocalLoading(false)
        if (result.error) {
          setError(result.error)
        } else {
          setCurrentExperiment(result)
        }
      })
    }
  }, [idParam])

  const exp = currentExperiment

  const onEvaluate = async () => {
    if (!exp?.id) return
    setError(null)
    await handleEvaluate(exp.id)
  }

  const onRunComparison = async () => {
    setError(null)
    await handleCompare()
  }

  if (localLoading || isLoading) {
    return <LoadingSpinner label="Compiling differential responses from Gemini..." />
  }

  if (!exp && !idParam) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#f5efe5] border border-[#e5dcd0] flex items-center justify-center mb-4">
          <GitCompare size={24} className="text-[#968674]" />
        </div>
        <h2 className="text-base font-bold text-[#28211b] mb-1">No Active Comparison Matrix</h2>
        <p className="text-xs text-[#7e6f5f] mb-6 leading-relaxed">
          Configure a prompt in the Prompt Studio and execute a dual run to populate side-by-side responses and evaluative scores.
        </p>
        <button
          onClick={() => navigate('/studio')}
          className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all shadow-glow-terracotta border border-terracotta-400"
        >
          Initialize in Prompt Studio
        </button>
      </div>
    )
  }

  const originalResponse = exp?.original_response || {}
  const optimizedResponse = exp?.optimized_response || {}
  const evaluation = exp?.evaluation || {}
  const originalScores = evaluation.original_scores || null
  const optimizedScores = evaluation.optimized_scores || null

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-100 border border-terracotta-200 text-terracotta-700 text-xs font-semibold mb-1">
            <Sparkles size={12} />
            Phase 3: Differential Matrix
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#28211b] flex items-center gap-2.5">
            Side-by-Side Response Matrix
          </h2>
          {exp?.strategy && (
            <p className="text-xs text-[#7e6f5f]">
              Assigned paradigm:{' '}
              <span className="text-terracotta-700 font-mono uppercase font-semibold">
                {exp.strategy}
              </span>
            </p>
          )}
        </div>
        {exp?.id && (
          <span className="text-[11px] text-[#6d5e4f] font-mono px-3 py-1.5 rounded-lg bg-[#f3ede3] border border-[#ded5c7] self-start sm:self-auto font-medium">
            Experiment ID: #{exp.id}
          </span>
        )}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Side-by-side Dual Response Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ResponsePanel
          title="Baseline Raw Prompt Output"
          variant="original"
          response_text={originalResponse.text || originalResponse.response_text}
          latency_ms={originalResponse.latency_ms}
          input_tokens={originalResponse.input_tokens}
          output_tokens={originalResponse.output_tokens}
        />
        <ResponsePanel
          title="Engineered & Contextualized Output"
          variant="optimized"
          response_text={optimizedResponse.text || optimizedResponse.response_text}
          latency_ms={optimizedResponse.latency_ms}
          input_tokens={optimizedResponse.input_tokens}
          output_tokens={optimizedResponse.output_tokens}
        />
      </div>

      {/* Evaluation Section */}
      {originalScores || optimizedScores ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ComparisonMetrics
            originalScores={originalScores}
            optimizedScores={optimizedScores}
          />
          <ScoreChart
            originalScores={originalScores}
            optimizedScores={optimizedScores}
          />
        </div>
      ) : (
        <ComparisonMetrics originalScores={null} optimizedScores={null} />
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {exp?.id && !originalScores && (
          <button
            onClick={onEvaluate}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-terracotta-500 hover:from-amber-700 hover:to-terracotta-600 disabled:opacity-40 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-glow-terracotta border border-amber-500 active:scale-95"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Star size={15} />
            )}
            <span>Score Responses (LLM Judge / Heuristic)</span>
          </button>
        )}
        <button
          onClick={onRunComparison}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#f3ede3] hover:bg-[#eae2d5] border border-[#ded5c7] disabled:opacity-40 text-[#2f2720] font-semibold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition-colors duration-150"
        >
          <FlaskConical size={15} />
          <span>Re-execute Inference</span>
        </button>
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 bg-[#f3ede3] hover:bg-[#eae2d5] border border-[#ded5c7] text-[#6d5e4f] hover:text-[#28211b] font-semibold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition-colors duration-150 ml-auto"
        >
          <History size={15} />
          <span>Archive</span>
        </button>
      </div>
    </div>
  )
}
