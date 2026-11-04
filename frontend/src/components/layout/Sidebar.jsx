import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wand2,
  BookOpen,
  GitCompare,
  History,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Prompt Studio', path: '/studio', icon: Wand2 },
  { label: 'Context Builder', path: '/context', icon: BookOpen },
  { label: 'Comparison', path: '/compare', icon: GitCompare },
  { label: 'History', path: '/history', icon: History },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#fcfbfa] border-r border-[#e7e1d5] flex flex-col z-30 select-none shadow-[1px_0_10px_rgba(100,80,60,0.03)]">
      {/* Brand Header */}
      <div className="h-[73px] flex items-center gap-3 px-6 border-b border-[#eee8de] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#c85a38] flex items-center justify-center shadow-warm-sm shrink-0">
          <span className="text-lg text-white">⚡</span>
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-[#28211b] leading-tight block">
            PromptCraft
          </span>
          <span className="block text-[10px] uppercase font-mono tracking-wider text-[#938371] leading-tight">
            AI Lab & Studio
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-hidden shrink-0">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-[#9e8f7d] select-none h-6 flex items-center">
          Platform Menu
        </div>
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `h-11 flex items-center gap-3 px-3.5 rounded-xl text-sm font-medium border outline-none focus:outline-none transition-colors duration-150 ${
                isActive
                  ? 'bg-[#c85a38] text-white shadow-warm-md border-[#c85a38] font-semibold'
                  : 'text-[#615447] hover:text-[#231d17] hover:bg-[#f3ece2] border-transparent'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    backgroundColor: '#c85a38',
                    color: '#ffffff',
                    borderColor: '#c85a38',
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-white' : 'text-[#7e6e5d]'}`}
                />
                <span className={`truncate ${isActive ? 'text-white font-semibold' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Warm Earthy Footer Badge */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-[#f5efe5] border border-[#e5dcd0] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-terracotta-100 border border-terracotta-200 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-terracotta-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#2f2720] truncate">Gemini Orchestrated</p>
            <p className="text-[10px] text-[#867664] truncate">Context Optimization Engine</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
