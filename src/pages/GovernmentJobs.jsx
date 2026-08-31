import React, { useState, useMemo } from 'react'
import { Building2, Search, Filter, X } from 'lucide-react'
import usePosts from '../hooks/usePosts'
import JobCard from '../components/JobCard'

const GovernmentJobs = () => {
      const { posts, loading, error } = usePosts('GOVERNMENT_JOB', 'PUBLISHED')
      const [search, setSearch] = useState('')
      const [locFilter, setLocFilter] = useState('')

      const filtered = useMemo(() => {
            const q = search.toLowerCase()
            return posts.filter((j) => {
                  const matchQ = !search ||
                        j.title?.toLowerCase().includes(q) ||
                        j.organization?.toLowerCase().includes(q) ||
                        j.location?.toLowerCase().includes(q) ||
                        j.qualification?.toLowerCase().includes(q) ||
                        j.department?.toLowerCase().includes(q)
                  const matchLoc = !locFilter || j.location?.toLowerCase().includes(locFilter.toLowerCase())
                  return matchQ && matchLoc
            })
      }, [posts, search, locFilter])

      const clearAll = () => { setSearch(''); setLocFilter('') }

      return (
            <div className="space-y-6">
                  <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                              <h1 className="text-2xl font-extrabold text-slate-900">Government Jobs</h1>
                              <p className="text-sm text-slate-500">UPSC, SSC, Railways, Banking & more</p>
                        </div>
                        {!loading && (
                              <span className="ml-auto px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                    {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
                              </span>
                        )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                          type="text"
                                          placeholder="Search by title, organization, qualification…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50"
                                    />
                              </div>
                              <div className="relative sm:w-52">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                          type="text"
                                          placeholder="Filter by location…"
                                          value={locFilter}
                                          onChange={(e) => setLocFilter(e.target.value)}
                                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50"
                                    />
                              </div>
                              {(search || locFilter) && (
                                    <button onClick={clearAll} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
                                          <X size={14} /> Clear
                                    </button>
                              )}
                        </div>
                  </div>

                  {loading && <LoadingCards />}
                  {error && <ErrorBanner msg={error} />}

                  {!loading && !error && filtered.length > 0 && (
                        <div className="flex flex-col gap-4">
                              {filtered.map((job) => <JobCard key={job.id} job={job} />)}
                        </div>
                  )}

                  {!loading && !error && filtered.length === 0 && (
                        <EmptyState
                              icon={Building2}
                              title="No government jobs found"
                              desc={posts.length === 0 ? 'No jobs published yet. Check back soon!' : 'Try adjusting your search.'}
                              onClear={(search || locFilter) ? clearAll : null}
                        />
                  )}

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <h3 className="font-bold text-blue-900 text-sm mb-3">Important Information</h3>
                        <ul className="space-y-1.5 text-blue-700 text-xs">
                              {[
                                    'Always verify job notifications on official websites before applying',
                                    'Keep scanned copies of all documents ready before starting application',
                                    'Apply well before the deadline to avoid last-minute technical issues',
                                    'Check eligibility criteria carefully before applying',
                              ].map((t) => (
                                    <li key={t} className="flex items-start gap-2">
                                          <span className="text-blue-400 mt-0.5">•</span> {t}
                                    </li>
                              ))}
                        </ul>
                  </div>
            </div>
      )
}

// ── Shared helpers (used by all 6 pages) ─────────────────────────────────────
export const LoadingCards = () => (
      <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                        <div className="flex justify-between mb-3">
                              <div className="space-y-2 flex-1 mr-4">
                                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                              </div>
                              <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                        </div>
                        <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
            ))}
      </div>
)

export const ErrorBanner = ({ msg }) => (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm">{msg}</div>
)

export const EmptyState = ({ icon: Icon, title, desc, onClear }) => (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
            <div className="w-14 h-14 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-blue-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm mb-4">{desc}</p>
            {onClear && (
                  <button onClick={onClear} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                        Clear Search
                  </button>
            )}
      </div>
)

export default GovernmentJobs
