import React, { useState, useMemo } from 'react'
import { Briefcase, Search, X } from 'lucide-react'
import usePosts from '../hooks/usePosts'
import JobCard from '../components/JobCard'
import { LoadingCards, ErrorBanner, EmptyState } from './GovernmentJobs'

const PrivateJobs = () => {
      const { posts, loading, error } = usePosts('PRIVATE_JOB', 'PUBLISHED')
      const [search, setSearch] = useState('')

      const filtered = useMemo(() => {
            const q = search.toLowerCase()
            return posts.filter((j) =>
                  !search ||
                  j.title?.toLowerCase().includes(q) ||
                  j.organization?.toLowerCase().includes(q) ||
                  j.location?.toLowerCase().includes(q) ||
                  j.skills?.toLowerCase().includes(q) ||
                  j.jobType?.toLowerCase().includes(q)
            )
      }, [posts, search])

      return (
            <div className="space-y-6">
                  <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                              <h1 className="text-2xl font-extrabold text-slate-900">Private Jobs</h1>
                              <p className="text-sm text-slate-500">Top companies hiring right now</p>
                        </div>
                        {!loading && (
                              <span className="ml-auto px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                    {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
                              </span>
                        )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex gap-3">
                              <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                          type="text"
                                          placeholder="Search by title, company, location, skills…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50"
                                    />
                              </div>
                              {search && (
                                    <button onClick={() => setSearch('')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
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
                              icon={Briefcase}
                              title="No private jobs found"
                              desc={posts.length === 0 ? 'No jobs published yet.' : 'Try adjusting your search.'}
                              onClear={search ? () => setSearch('') : null}
                        />
                  )}
            </div>
      )
}

export default PrivateJobs
