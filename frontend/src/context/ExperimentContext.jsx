import React, { createContext, useContext, useState } from 'react'

const ExperimentContext = createContext(null)

const defaultContextConfig = {
  role: '',
  audience: '',
  goal: '',
  constraints: [],
  output_format: 'paragraph',
  reference_text: '',
}

export function ExperimentProvider({ children }) {
  const [currentExperiment, setCurrentExperiment] = useState(null)
  const [contextConfig, setContextConfig] = useState(defaultContextConfig)
  const [selectedStrategy, setSelectedStrategy] = useState('zero-shot')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [experiments, setExperiments] = useState([])
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [rawPrompt, setRawPrompt] = useState('')

  const resetContext = () => {
    setContextConfig(defaultContextConfig)
  }

  const resetAll = () => {
    setCurrentExperiment(null)
    setContextConfig(defaultContextConfig)
    setSelectedStrategy('zero-shot')
    setError(null)
    setOptimizedPrompt('')
    setRawPrompt('')
  }

  const value = {
    currentExperiment,
    setCurrentExperiment,
    contextConfig,
    setContextConfig,
    selectedStrategy,
    setSelectedStrategy,
    isLoading,
    setIsLoading,
    error,
    setError,
    experiments,
    setExperiments,
    optimizedPrompt,
    setOptimizedPrompt,
    rawPrompt,
    setRawPrompt,
    resetContext,
    resetAll,
  }

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  )
}

export function useExperimentContext() {
  const ctx = useContext(ExperimentContext)
  if (!ctx) {
    throw new Error('useExperimentContext must be used within ExperimentProvider')
  }
  return ctx
}

export default ExperimentContext
