import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { checkHealth } from '../../services/api'

const pageTitles = {
  '/': 'Analytics & Experiments',
  '/studio': 'Prompt Engineering Studio',
  '/context': 'Context Architecture Builder',
  '/compare': 'Side-by-Side Response Matrix',
  '/history': 'Experiment Archive',
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [healthy, setHealthy] = useState(null)
  const [model, setModel] = useState('')

  const title = pageTitles[location.pathname] || 'PromptCraft AI'

  useEffect(() => {
    let mounted = true
    const ping = async () => {
      const result = await checkHealth()
      if (mounted) {
        setHealthy(!result.error)
        if (result.model) setModel(result.model)
      }
    }
    ping()
    const interval = setInterval(ping, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-[#fcfbfa]/90 backdrop-blur-md border-b border-[#e7e1d5] flex items-center justify-between px-7 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold tracking-wide text-[#28211b]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Model & Health indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3ece2] border border-[#e3d8ca] text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              healthy === null
                ? 'bg-amber-500 animate-pulse'
                : healthy
                ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]'
                : 'bg-rose-500 animate-pulse'
            }`}
          />
          <span className="text-[#5a4e41] text-[11px] font-semibold">
            {healthy === null
              ? 'Checking API...'
              : healthy
              ? model || 'Gemini 1.5'
              : 'Backend Offline'}
          </span>
        </div>

        {/* New Experiment button */}
        <button
          onClick={() => navigate('/studio')}
          className="btn-primary flex items-center gap-2 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 active:scale-95"
        >
          <Plus size={15} />
          <span>New Experiment</span>
        </button>
      </div>
    </header>
  )
}
