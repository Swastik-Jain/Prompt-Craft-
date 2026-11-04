import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GitCompare, ArrowLeft, Sparkles, Layers } from 'lucide-react'
import { useExperimentContext } from '../context/ExperimentContext'
import { useExperiment } from '../hooks/useExperiment'
import ContextForm from '../components/context/ContextForm'
import ErrorMessage from '../components/common/ErrorMessage'

export default function ContextBuilder() {
  const navigate = useNavigate()
  const {
    optimizedPrompt,
    rawPrompt,
    contextConfig,
    setContextConfig,
    isLoading,
    error,
    setError,
  } = useExperimentContext()
  const { handleCompare } = useExperiment()

  const onRunComparison = async () => {
    setError(null)
    const result = await handleCompare()
    if (result) navigate('/compare')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold mb-1">
          <Layers size={12} />
          Phase 2: Context Engineering
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#28211b] flex items-center gap-2.5">
          Context Architecture Builder
        </h2>
        <p className="text-xs text-[#706253] leading-relaxed">
          Ground model reasoning by injecting explicit roles, audience calibrators, negative boundaries, and reference corpora.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Current Prompt Summary Pill */}
      {optimizedPrompt ? (
        <div className="bg-[#fdf6f3] border border-terracotta-200 rounded-2xl p-4.5 shadow-warm-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider text-terracotta-700 font-semibold flex items-center gap-1.5">
              <Sparkles size={11} />
              Active Optimized Prompt
            </span>
            <button
              onClick={() => navigate('/studio')}
              className="text-[11px] text-[#867664] hover:text-[#28211b] underline transition-colors"
            >
              Modify in Studio
            </button>
          </div>
          <p className="text-xs text-[#2b241e] line-clamp-3 leading-relaxed">
            {optimizedPrompt}
          </p>
        </div>
      ) : rawPrompt ? (
        <div className="bg-[#f5efe5] border border-[#e3dacd] rounded-2xl p-4.5 shadow-warm-sm">
          <p className="text-xs uppercase tracking-wider text-[#7e6e5d] font-semibold mb-1">
            Raw Baseline Prompt
          </p>
          <p className="text-xs text-[#2b241e] line-clamp-3 leading-relaxed">
            {rawPrompt}
          </p>
        </div>
      ) : null}

      {/* Main Context Form Card */}
      <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-3xl p-6 shadow-warm-sm">
        <ContextForm value={contextConfig} onChange={setContextConfig} />
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
        <button
          onClick={() => {
            setError(null)
            navigate('/studio')
          }}
          className="btn-secondary flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors duration-150"
        >
          <ArrowLeft size={15} />
          <span>Back to Studio</span>
        </button>
        <button
          onClick={onRunComparison}
          disabled={isLoading || (!optimizedPrompt && !rawPrompt)}
          className="btn-primary flex-1 flex items-center justify-center gap-2.5 font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all duration-150 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Executing Dual Inferences via Gemini...</span>
            </>
          ) : (
            <>
              <GitCompare size={15} />
              <span>Execute Differential Comparison</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
