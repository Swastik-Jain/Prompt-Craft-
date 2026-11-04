import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ExperimentProvider } from './context/ExperimentContext'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import PromptStudio from './pages/PromptStudio'
import ContextBuilder from './pages/ContextBuilder'
import Comparison from './pages/Comparison'
import History from './pages/History'

export default function App() {
  return (
    <ExperimentProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/studio" element={<PromptStudio />} />
          <Route path="/context" element={<ContextBuilder />} />
          <Route path="/compare" element={<Comparison />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </MainLayout>
    </ExperimentProvider>
  )
}
