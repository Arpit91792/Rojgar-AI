import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileCheck, Search, X, AlertCircle } from 'lucide-react'
import usePosts from '../hooks/usePosts'
import { LoadingCards, ErrorBanner, EmptyState } from './GovernmentJobs'

const AdmitCard = ({ item }) => (
      <Link
            to={`/posts/${item.slug || item.id}`}
            className="block w-full bg-white border-2 border-green-500 rounded-xl px-5 py-4 hover:shadow-md hover:border-green-600 transition-all duration-200 group"
      >
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {item.title}
            </h3>
      </Link>
)

const AdmitCards = () => {
      const { posts, loading, error } = usePosts('ADMIT_CARD', 'PUBLISHED')
      const [search, setSearch] = useState('')

      const filtered = useMemo(() => {
            const q = search.toLowerCase()
            return posts.filter((a) =>
                  !search ||
                  a.title?.toLowerCase().includes(q) ||
                  a.organization?.toLowerCase().includes(q) ||
                  a.qualification?.toLowerCase().includes(q)
            )
      }, [posts, search])

      return (
            <div className="space-y-6">
                  <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FileCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                              <h1 className="text-2xl font-extrabold text-slate-900">Admit Cards</h1>
                              <p className="text-sm text-slate-500">Download hall tickets for upcoming exams</p>
                        </div>
                        {!loading && (
                              <span className="ml-auto px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                    {filtered.length} card{filtered.length !== 1 ? 's' : ''}
                              </span>
                        )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex gap-3">
                              <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Search by exam, organization, qualification…" value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50" />
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
                              {filtered.map((a) => <AdmitCard key={a.id} item={a} />)}
                        </div>
                  )}
                  {!loading && !error && filtered.length === 0 && (
                        <EmptyState icon={FileCheck} title="No admit cards found"
                              desc={posts.length === 0 ? 'No admit cards published yet.' : 'Try adjusting your search.'}
                              onClear={search ? () => setSearch('') : null} />
                  )}

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                              <AlertCircle size={16} className="text-blue-600" />
                              <h3 className="font-bold text-blue-900 text-sm">Important Notes</h3>
                        </div>
                        <ul className="space-y-1.5 text-blue-700 text-xs">
                              {['Always verify admit card details with the official website', 'Carry valid ID proof along with admit card to exam center', 'Print multiple copies of admit card for backup'].map(t => (
                                    <li key={t} className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span>{t}</li>
                              ))}
                        </ul>
                  </div>
            </div>
      )
}

export default AdmitCards
