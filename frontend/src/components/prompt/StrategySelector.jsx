import React from 'react'
import { Zap, User, BookOpen, Layers } from 'lucide-react'

const strategies = [
  {
    id: 'zero-shot',
    label: 'Zero-Shot',
    description: 'Clear, direct instruction with strict task boundary and zero priors',
    icon: Zap,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'role-based',
    label: 'Role-Based',
    description: 'Expert persona formulation to impart authoritative perspective and tone',
    icon: User,
    iconColor: 'text-terracotta-600',
    iconBg: 'bg-terracotta-100',
  },
  {
    id: 'few-shot',
    label: 'Few-Shot',
    description: 'In-context learning exemplars demonstrating precise output format',
    icon: BookOpen,
    iconColor: 'text-sand-700',
    iconBg: 'bg-sand-200',
  },
  {
    id: 'context-aware',
    label: 'Context-Aware',
    description: 'Holistic synthesis weaving constraints, target audience, and domain bounds',
    icon: Layers,
    iconColor: 'text-olive-600',
    iconBg: 'bg-olive-100',
  },
]

export default function StrategySelector({ selected, onSelect }) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#635548] flex items-center gap-2">
        <span>Prompt Engineering Strategy</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {strategies.map(({ id, label, description, icon: Icon, iconColor, iconBg }) => {
          const isSelected = selected === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-150 relative overflow-hidden ${
                isSelected
                  ? 'bg-[#fdf6f3] border-terracotta-500 shadow-warm-md ring-1 ring-terracotta-200'
                  : 'bg-[#ffffff] border-[#e7e0d5] hover:border-[#d5cbbd] hover:bg-[#faf7f2]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  isSelected
                    ? 'bg-terracotta-100 border-terracotta-300 text-terracotta-700'
                    : `${iconBg} border-transparent ${iconColor}`
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-terracotta-600' : iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-semibold tracking-tight ${
                      isSelected ? 'text-terracotta-800' : 'text-[#2b241e]'
                    }`}
                  >
                    {label}
                  </p>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700 border border-terracotta-200 font-semibold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#706253] mt-1 leading-relaxed">{description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
