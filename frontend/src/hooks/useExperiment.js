import { useExperimentContext } from '../context/ExperimentContext'
import {
  optimizePrompt,
  compareExperiment,
  evaluateExperiment,
  getExperiments,
  getAnalyticsSummary,
} from '../services/api'

export function useExperiment() {
  const {
    currentExperiment,
    setCurrentExperiment,
    setIsLoading,
    setError,
    setExperiments,
    setOptimizedPrompt,
    rawPrompt,
    optimizedPrompt,
    selectedStrategy,
    contextConfig,
  } = useExperimentContext()

  const handleOptimize = async (prompt) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await optimizePrompt({
        prompt: prompt,
        raw_prompt: prompt,
        strategy: (selectedStrategy || 'zero_shot').replace('-', '_'),
        context: contextConfig,
      })
      if (result.error) {
        setError(result.error)
        return null
      }
      setOptimizedPrompt(result.optimized_prompt || result.prompt || '')
      return result
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompare = async (experimentData) => {
    setIsLoading(true)
    setError(null)
    try {
      const payload = experimentData || {
        experiment_id: currentExperiment?.id,
        prompt: rawPrompt,
        raw_prompt: rawPrompt,
        original_prompt: rawPrompt,
        optimized_prompt: optimizedPrompt || rawPrompt,
        strategy: (selectedStrategy || 'zero_shot').replace('-', '_'),
        context: contextConfig,
      }
      const result = await compareExperiment(payload)
      if (result.error) {
        setError(result.error)
        return null
      }
      setCurrentExperiment(result)
      return result
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvaluate = async (id) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await evaluateExperiment(id)
      if (result.error) {
        setError(result.error)
        return null
      }
      setCurrentExperiment((prev) => {
        if (!prev) return prev
        const evals = Array.isArray(result) ? result : []
        const origEval = evals[0] || null
        const optEval = evals[1] || evals[0] || null
        return {
          ...prev,
          evaluations: evals,
          evaluation: {
            original_scores: origEval,
            optimized_scores: optEval,
          },
        }
      })
      return result
    } finally {
      setIsLoading(false)
    }
  }

  const loadHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getExperiments()
      if (result.error) {
        setError(result.error)
        return []
      }
      const list = Array.isArray(result) ? result : []
      setExperiments(list)
      return list
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    setError(null)
    const result = await getAnalyticsSummary()
    if (result.error) {
      setError(result.error)
      return null
    }
    return result
  }

  return {
    handleOptimize,
    handleCompare,
    handleEvaluate,
    loadHistory,
    loadAnalytics,
  }
}
