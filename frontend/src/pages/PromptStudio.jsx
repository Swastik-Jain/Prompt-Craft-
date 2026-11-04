import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Wand2, ArrowRight, GitCompare, Sparkles } from 'lucide-react'
import { useExperimentContext } from '../context/ExperimentContext'
import { useExperiment } from '../hooks/useExperiment'
import PromptEditor from '../components/prompt/PromptEditor'
import StrategySelector from '../components/prompt/StrategySelector'
import OptimizedPrompt from '../components/prompt/OptimizedPrompt'
import ErrorMessage from '../components/common/ErrorMessage'

export default function PromptStudio() {
  const navigate = useNavigate()
  const {
    rawPrompt,
    setRawPrompt,
    optimizedPrompt,
    selectedStrategy,
    setSelectedStrategy,
    isLoading,
    error,
    setError,
  } = useExperimentContext()
  const { handleOptimize, handleCompare } = useExperiment()

  const onOptimize = async () => {
    if (!rawPrompt.trim()) {
      setError('Please enter a raw prompt before optimizing.')
      return
    }
    setError(null)
    await handleOptimize(rawPrompt)
  }

  const onRunComparison = async () => {
    if (!optimizedPrompt) {
      setError('Please optimize a prompt first.')
      return
    }
    setError(null)
    const result = await handleCompare()
    if (result) navigate('/compare')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      {/* Studio Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-100 border border-terracotta-200 text-terracotta-700 text-xs font-semibold mb-1">
          <Sparkles size={12} />
          Phase 1: Architecture Transformation
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#28211b] flex items-center gap-2.5">
          Prompt Engineering Studio
        </h2>
        <p className="text-xs text-[#706253] leading-relaxed">
          Supply raw instructions, designate an optimization paradigm, and synthesize high-fidelity structural prompts.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Main Studio Card */}
      <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-3xl p-6 space-y-6 shadow-warm-sm">
        <PromptEditor
          value={rawPrompt}
          onChange={setRawPrompt}
          placeholder="e.g. Explain how transformers and self-attention work for a software engineer transitioning into ML..."
        />

        <StrategySelector
          selected={selectedStrategy}
          onSelect={setSelectedStrategy}
        />

        <button
          onClick={onOptimize}
          disabled={isLoading || !rawPrompt.trim()}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all duration-150 shadow-glow-terracotta border border-terracotta-400 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Structural Prompt Architecture...</span>
            </>
          ) : (
            <>
              <Wand2 size={16} />
              <span>Optimize Prompt via Gemini</span>
            </>
          )}
        </button>
      </div>

      {/* Optimized Prompt Output */}
      {(optimizedPrompt || isLoading) && (
        <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-3xl p-6 shadow-warm-sm">
          <OptimizedPrompt prompt={optimizedPrompt} isLoading={isLoading} />
        </div>
      )}

      {/* Next Step Navigation */}
      {optimizedPrompt && !isLoading && (
        <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
          <button
            onClick={() => navigate('/context')}
            className="flex-1 flex items-center justify-center gap-2.5 bg-[#f3ede3] hover:bg-[#eae2d5] border border-[#ded5c7] text-[#2f2720] font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors duration-150"
          >
            <span>Proceed to Context Architecture</span>
            <ArrowRight size={15} />
          </button>
          <button
            onClick={onRunComparison}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 disabled:opacity-40 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all duration-150 shadow-glow-terracotta border border-terracotta-400 active:scale-[0.99]"
          >
            <GitCompare size={15} />
            <span>Direct Comparison Run</span>
          </button>
        </div>
      )}
    </div>
  )
}
