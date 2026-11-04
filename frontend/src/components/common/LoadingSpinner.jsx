import React from 'react'

export default function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-14 h-14 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3.5 py-14">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-terracotta-200 border-t-terracotta-600 rounded-full animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-transparent border-b-amber-500 rounded-full animate-spin [animation-duration:1.5s]`}
        />
      </div>
      {label && <p className="text-xs text-[#706253] font-medium tracking-normal">{label}</p>}
    </div>
  )
}
