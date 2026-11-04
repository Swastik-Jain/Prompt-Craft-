import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { FlaskConical, Star, Zap, Clock, ArrowRight, TrendingUp, Sparkles, Layers } from 'lucide-react'
import { useExperiment } from '../hooks/useExperiment'
import { useExperimentContext } from '../context/ExperimentContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, valueColor }) {
  return (
    <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl p-5 flex items-start gap-4 shadow-warm-sm hover:border-[#d5cbbd] transition-all duration-200">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${iconBg || 'bg-terracotta-50'}`}>
        <Icon size={20} className={iconColor || 'text-terracotta-600'} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase font-semibold tracking-wider text-[#7e6f5f] mb-0.5">{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${valueColor || 'text-[#28211b]'}`}>{value}</p>
        {sub && <p className="text-xs text-[#8c7b69] mt-0.5 font-normal">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#ffffff] border border-[#ded5c7] rounded-xl px-3.5 py-2.5 text-xs shadow-warm-lg">
        <p className="text-[#2b241e] mb-1.5 font-semibold capitalize">{label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5 font-mono">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="text-[#2b241e] font-semibold">{p.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { loadAnalytics, loadHistory } = useExperiment()
  const { error, setError } = useExperimentContext()
  const [analytics, setAnalytics] = useState(null)
  const [recentExperiments, setRecentExperiments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const [a, h] = await Promise.all([loadAnalytics(), loadHistory()])
      if (a && !a.error) setAnalytics(a)
      if (h && !h.error) setRecentExperiments((Array.isArray(h) ? h : []).slice(0, 5))
      setLoading(false)
    }
    fetchAll()
  }, [])

  const strategyChartData = analytics?.by_strategy
    ? Object.entries(analytics.by_strategy).map(([strategy, data]) => ({
        strategy: strategy.replace('-', ' '),
        Baseline: data.avg_original_score ?? 0,
        Optimized: data.avg_optimized_score ?? 0,
      }))
    : []

  return (
    <div className="space-y-7">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#fff9f6] via-[#fdf6f0] to-[#f8f3ec] border border-terracotta-200 p-7 overflow-hidden shadow-warm-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-100 border border-terracotta-200 text-terracotta-700 text-xs font-semibold">
              <Sparkles size={12} />
              Prompt & Context Engineering Lab
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#28211b]">
              Evaluate and Elevate Large Language Model Synthesis
            </h2>
            <p className="text-xs text-[#6e5f50] leading-relaxed">
              Transform unstructured instructions into structured prompt architectures, parameterize context budgets, and benchmark differential outputs with automated scoring.
            </p>
          </div>
          <button
            onClick={() => navigate('/studio')}
            className="btn-primary self-start md:self-auto flex items-center gap-2 text-xs font-semibold px-5 py-3 rounded-xl transition-all duration-150 shrink-0"
          >
            <span>Launch Prompt Studio</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner label="Compiling laboratory metrics..." />
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={FlaskConical}
              label="Total Experiments"
              value={analytics?.total_experiments ?? recentExperiments.length}
              sub="Saved benchmark runs"
              iconBg="bg-terracotta-50"
              iconColor="text-terracotta-600"
            />
            <StatCard
              icon={Star}
              label="Avg Quality Score"
              value={
                analytics?.avg_optimized_score != null
                  ? `${analytics.avg_optimized_score.toFixed(1)} / 5.0`
                  : '—'
              }
              sub="Multi-vector evaluation"
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              valueColor="text-amber-800"
            />
            <StatCard
              icon={TrendingUp}
              label="Optimal Strategy"
              value={
                analytics?.best_strategy
                  ? analytics.best_strategy
                      .replace('-', ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : 'Role-Based'
              }
              sub="Highest scored technique"
              iconBg="bg-olive-50"
              iconColor="text-olive-600"
              valueColor="text-olive-700"
            />
            <StatCard
              icon={Clock}
              label="Mean Latency"
              value={
                analytics?.avg_latency_ms != null
                  ? `${Math.round(analytics.avg_latency_ms)}ms`
                  : '—'
              }
              sub="Model response duration"
              iconBg="bg-sand-100"
              iconColor="text-sand-700"
            />
          </div>

          {/* Strategy Bar Chart */}
          {strategyChartData.length > 0 && (
            <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl p-6 shadow-warm-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#3d3328]">
                    Comparative Score by Strategy
                  </h3>
                  <p className="text-[11px] text-[#786958] mt-0.5">
                    Baseline raw prompt vs optimized architecture performance
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={strategyChartData} barGap={6}>
                  <CartesianGrid stroke="#ede6db" vertical={false} />
                  <XAxis
                    dataKey="strategy"
                    tick={{ fill: '#706253', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fill: '#706253', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(v) => (
                      <span className="text-xs font-mono px-1 font-semibold" style={{ color: v === 'Optimized' ? '#b44a29' : '#706253' }}>
                        {v}
                      </span>
                    )}
                  />
                  <Bar dataKey="Baseline" fill="#bca993" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Optimized" fill="#c85a38" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Experiments Section */}
          <div className="bg-[#ffffff] border border-[#e7e1d5] rounded-2xl overflow-hidden shadow-warm-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee8de] bg-[#faf7f2]">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#3d3328]">
                  Recent Prompt Architecture Runs
                </h3>
                <p className="text-[11px] text-[#786958] mt-0.5">Historical evaluations and test suites</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1.5 transition-colors"
              >
                <span>View Full Archive</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            {recentExperiments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f5efe5] border border-[#e5dcd0] flex items-center justify-center mx-auto mb-3">
                  <Layers size={18} className="text-[#968674]" />
                </div>
                <p className="text-[#2b241e] text-sm font-semibold mb-1">No saved experiments found</p>
                <p className="text-[#7e6f5f] text-xs mb-4 max-w-sm mx-auto">
                  Run your first controlled experiment by entering a raw instruction in the Prompt Studio.
                </p>
                <button
                  onClick={() => navigate('/studio')}
                  className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Create First Experiment
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#eee8de]">
                {recentExperiments.map((exp) => (
                  <li
                    key={exp.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#faf7f2] transition-colors"
                  >
                    <div className="min-w-0 pr-4">
                      <p className="text-xs font-medium text-[#28211b] truncate">
                        {exp.original_prompt || exp.raw_prompt || 'Untitled Experiment'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700 border border-terracotta-200 font-semibold">
                          {exp.strategy || 'zero-shot'}
                        </span>
                        {exp.created_at && (
                          <span className="text-xs text-[#8c7b69]">
                            {new Date(exp.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/compare?id=${exp.id}`}
                      className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-lg bg-[#f5efe5] hover:bg-[#ede5d8] border border-[#ded5c7] transition-colors"
                    >
                      <span>Inspect Matrix</span>
                      <ArrowRight size={13} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
