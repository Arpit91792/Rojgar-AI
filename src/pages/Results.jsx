import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, X, CalendarDays, ExternalLink, Eye, Share2, Heart, BookOpen } from 'lucide-react'
import usePosts from '../hooks/usePosts'
import { LoadingCards, ErrorBanner, EmptyState } from './GovernmentJobs'

const fmt = (d) =>
      d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null

const ResultCard = ({ item }) => {
      const [liked, setLiked] = useState(false)
      const [shared, setShared] = useState(false)

      const handleShare = (e) => {
            e.preventDefault()
            if (navigator.share) {
                  navigator.share({ title: item.title, url: window.location.origin + `/posts/${item.slug}` })
            } else {
                  navigator.clipboard?.writeText(window.location.origin + `/posts/${item.slug}`)
                  setShared(true); setTimeout(() => setShared(false), 2000)
            }
      }

      return (
            <Link
                  to={`/posts/${item.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200"
            >
                  <div className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                          {item.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-0.5 truncate">{item.organization}</p>
                              </div>
                              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="text-blue-600" />
                              </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
                              {item.examName && item.examName !== item.title && (
                                    <span className="flex items-center gap-1.5">
                                          <BookOpen size={13} className="text-slate-400" /> {item.examName}
                                    </span>
                              )}
                              {item.resultDate && (
                                    <span className="flex items-center gap-1.5">
                                          <CalendarDays size={13} className="text-slate-400" />
                                          Result Date: <span className="font-medium text-slate-700 ml-1">{fmt(item.resultDate)}</span>
                                    </span>
                              )}
                              {item.course && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-medium">
                                          {item.course}
                                    </span>
                              )}
                        </div>

                        {item.description && (
                              <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        )}
                  </div>

                  <div className="mx-5 border-t border-slate-100" />

                  <div className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <CalendarDays size={11} />
                              {item.createdAt ? `Posted ${fmt(item.createdAt)}` : 'Recently posted'}
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                              <button onClick={handleShare} className={`p-1.5 rounded-lg transition-colors ${shared ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}>
                                    <Share2 size={15} />
                              </button>
                              <button onClick={(e) => { e.preventDefault(); setLiked(l => !l) }} className={`p-1.5 rounded-lg transition-colors ${liked ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-400 hover:bg-blue-50'}`}>
                                    <Heart size={15} className={liked ? 'fill-blue-600' : ''} />
                              </button>
                              {item.resultLink ? (
                                    <a href={item.resultLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                          className="ml-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors">
                                          View Result <ExternalLink size={11} />
                                    </a>
                              ) : (
                                    <span className="ml-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold">
                                          <Eye size={11} /> Details
                                    </span>
                              )}
                        </div>
                  </div>
            </Link>
      )
}

const Results = () => {
      const { posts, loading, error } = usePosts('RESULT', 'PUBLISHED')
      const [search, setSearch] = useState('')

      const filtered = useMemo(() => {
            const q = search.toLowerCase()
            return posts.filter((r) =>
                  !search ||
                  r.title?.toLowerCase().includes(q) ||
                  r.organization?.toLowerCase().includes(q) ||
                  r.examName?.toLowerCase().includes(q) ||
                  r.course?.toLowerCase().includes(q)
            )
      }, [posts, search])

      return (
            <div className="space-y-6">
                  <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                              <h1 className="text-2xl font-extrabold text-slate-900">Exam Results</h1>
                              <p className="text-sm text-slate-500">Check latest results and scorecards</p>
                        </div>
                        {!loading && (
                              <span className="ml-auto px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                              </span>
                        )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex gap-3">
                              <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Search by exam name, organization, course…" value={search}
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
                              {filtered.map((r) => <ResultCard key={r.id} item={r} />)}
                        </div>
                  )}
                  {!loading && !error && filtered.length === 0 && (
                        <EmptyState icon={FileText} title="No results found"
                              desc={posts.length === 0 ? 'No results published yet.' : 'Try adjusting your search.'}
                              onClear={search ? () => setSearch('') : null} />
                  )}
            </div>
      )
}

export default Results
