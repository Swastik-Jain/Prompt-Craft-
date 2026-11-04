import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#2d251f] relative overflow-hidden">
      {/* Warm organic ambient light glows */}
      <div className="fixed top-0 right-1/4 w-[550px] h-[550px] bg-gradient-to-br from-terracotta-100/60 via-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-1/3 w-[650px] h-[650px] bg-gradient-to-tr from-sand-200/50 via-olive-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      <Sidebar />
      <Navbar />
      <main className="ml-64 pt-14 min-h-screen relative z-10">
        <div className="p-7 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
