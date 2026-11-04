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
        raw_prompt: prompt,
        strategy: selectedStrategy,
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
        raw_prompt: rawPrompt,
        optimized_prompt: optimizedPrompt,
        strategy: selectedStrategy,
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
      setCurrentExperiment((prev) => ({ ...prev, ...result }))
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
      const list = Array.isArray(result) ? result : result.experiments || []
      setExperiments(list)
      return list
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAnalyticsSummary()
      if (result.error) {
        setError(result.error)
        return null
      }
      return result
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleOptimize,
    handleCompare,
    handleEvaluate,
    loadHistory,
    loadAnalytics,
  }
}

export default useExperiment
