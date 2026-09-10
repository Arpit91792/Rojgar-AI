import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Filter, X, LayoutList, RefreshCw } from 'lucide-react'
import { fetchPostsByType } from '../services/api.js'
import { normaliseJob } from '../services/api.js'
import JobCard from '../components/JobCard'
import { LoadingCards, ErrorBanner, EmptyState } from './GovernmentJobs'

// ── All backend post types and their display labels ───────────────────────────
const ALL_TYPES = [
      { type: 'GOVERNMENT', label: 'Government Jobs', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      { type: 'PRIVATE', label: 'Private Jobs', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { type: 'INTERNSHIP', label: 'Internships', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
      { type: 'TIME_TABLE', label: 'Time Table', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
      { type: 'RESULT', label: 'Results', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
      { type: 'ADMIT_CARD', label: 'Admit Cards', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
      { type: 'SCHOLARSHIP', label: 'Scholarships', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
      { type: 'HACKATHON', label: 'Hackathons', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
      { type: 'PLACEMENT_DRIVE', label: 'Placement Drives', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
      { type: 'COURSE', label: 'Courses', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
]

const TYPE_LABEL = Object.fromEntries(ALL_TYPES.map((t) => [t.type, t.label]))
const TYPE_META = Object.fromEntries(ALL_TYPES.map((t) => [t.type, t]))

// ── Type badge ────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
      const meta = TYPE_META[type] || {}
      return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg || 'bg-gray-50'} ${meta.color || 'text-gray-600'} border ${meta.border || 'border-gray-200'}`}>
                  {TYPE_LABEL[type] || type}
            </span>
      )
}

// ── Extended JobCard showing type badge ───────────────────────────────────────
const AllPostCard = ({ job }) => {
      const category = job.category // e.g. GOVERNMENT_JOB
      // Map category → backend type for the badge
      const typeMap = {
            GOVERNMENT_JOB: 'GOVERNMENT', PRIVATE_JOB: 'PRIVATE', INTERNSHIP: 'INTERNSHIP',
            TIME_TABLE: 'TIME_TABLE', RESULT: 'RESULT', ADMIT_CARD: 'ADMIT_CARD',
            SCHOLARSHIP: 'SCHOLARSHIP', HACKATHON: 'HACKATHON',
            PLACEMENT_DRIVE: 'PLACEMENT_DRIVE', COURSE: 'COURSE',
      }
      const backendType = typeMap[category] || category

      return (
            <div className="flex flex-col gap-1.5">
                  <TypeBadge type={backendType} />
                  <JobCard job={job} />
            </div>
      )
}

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
      { value: 'newest', label: 'Newest first' },
      { value: 'oldest', label: 'Oldest first' },
      { value: 'az', label: 'A → Z' },
]

const PAGE_SIZE = 20

// ═════════════════════════════════════════════════════════════════════════════
const AllPosts = () => {
      const [allPosts, setAllPosts] = useState([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)

      const [search, setSearch] = useState('')
      const [typeFilter, setTypeFilter] = useState('')   // backend type value
      const [sort, setSort] = useState('newest')
      const [page, setPage] = useState(1)

      // ── Fetch all types in parallel ────────────────────────────────────────────
      const fetchAll = useCallback(async () => {
            setLoading(true)
            setError(null)
            try {
                  const results = await Promise.all(
                        ALL_TYPES.map(({ type }) =>
                              fetchPostsByType(type, { limit: 200, status: 'PUBLISHED' })
                                    .then((r) => (r.data || []).map(normaliseJob))
                                    .catch(() => [])
                        )
                  )
                  const merged = results.flat()
                  setAllPosts(merged)
            } catch {
                  setError('Unable to load posts. Please try again.')
            } finally {
                  setLoading(false)
            }
      }, [])

      useEffect(() => { fetchAll() }, [fetchAll])

      // Reset to page 1 whenever filters change
      useEffect(() => { setPage(1) }, [search, typeFilter, sort])

      // ── Filtered + sorted list ─────────────────────────────────────────────────
      const filtered = useMemo(() => {
            const q = search.toLowerCase().trim()

            // Map typeFilter (backend type) to category values used by normaliseJob
            const catMap = {
                  GOVERNMENT: 'GOVERNMENT_JOB', PRIVATE: 'PRIVATE_JOB', INTERNSHIP: 'INTERNSHIP',
                  TIME_TABLE: 'TIME_TABLE', RESULT: 'RESULT', ADMIT_CARD: 'ADMIT_CARD',
                  SCHOLARSHIP: 'SCHOLARSHIP', HACKATHON: 'HACKATHON',
                  PLACEMENT_DRIVE: 'PLACEMENT_DRIVE', COURSE: 'COURSE',
            }
            const filterCat = typeFilter ? catMap[typeFilter] : ''

            let list = allPosts.filter((p) => {
                  const matchType = !filterCat || p.category === filterCat
                  const matchSearch = !q ||
                        p.title?.toLowerCase().includes(q) ||
                        p.organization?.toLowerCase().includes(q) ||
                        p.location?.toLowerCase().includes(q) ||
                        p.qualification?.toLowerCase().includes(q)
                  return matchType && matchSearch
            })

            if (sort === 'newest') {
                  list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            } else if (sort === 'oldest') {
                  list = [...list].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
            } else if (sort === 'az') {
                  list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
            }

            return list
      }, [allPosts, search, typeFilter, sort])

      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
      const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

      const clearAll = () => { setSearch(''); setTypeFilter(''); setSort('newest') }
      const hasFilters = search || typeFilter || sort !== 'newest'

      return (
            <div className="space-y-6">

                  {/* Header */}
                  <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <LayoutList className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                              <h1 className="text-2xl font-extrabold text-slate-900">All Latest Posts</h1>
                              <p className="text-sm text-slate-500">Every published job, result, admit card &amp; more — newest first</p>
                        </div>
                        <div className="flex items-center gap-2">
                              {!loading && (
                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                                          {filtered.length} post{filtered.length !== 1 ? 's' : ''}
                                    </span>
                              )}
                              <button
                                    onClick={fetchAll}
                                    disabled={loading}
                                    title="Refresh"
                                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                              >
                                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                              </button>
                        </div>
                  </div>

                  {/* Filter bar */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-3">

                              {/* Search */}
                              <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                          type="text"
                                          placeholder="Search title, organization, location…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50"
                                    />
                              </div>

                              {/* Category filter */}
                              <div className="relative sm:w-48">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <select
                                          value={typeFilter}
                                          onChange={(e) => setTypeFilter(e.target.value)}
                                          className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 appearance-none cursor-pointer"
                                    >
                                          <option value="">All categories</option>
                                          {ALL_TYPES.map((t) => (
                                                <option key={t.type} value={t.type}>{t.label}</option>
                                          ))}
                                    </select>
                              </div>

                              {/* Sort */}
                              <div className="sm:w-40">
                                    <select
                                          value={sort}
                                          onChange={(e) => setSort(e.target.value)}
                                          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 cursor-pointer"
                                    >
                                          {SORT_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                          ))}
                                    </select>
                              </div>

                              {/* Clear */}
                              {hasFilters && (
                                    <button
                                          onClick={clearAll}
                                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                                    >
                                          <X size={14} /> Clear
                                    </button>
                              )}
                        </div>
                  </div>

                  {/* Content */}
                  {loading && <LoadingCards />}
                  {error && <ErrorBanner msg={error} />}

                  {!loading && !error && paginated.length > 0 && (
                        <div className="flex flex-col gap-4">
                              {paginated.map((job) => <AllPostCard key={job.id} job={job} />)}
                        </div>
                  )}

                  {!loading && !error && paginated.length === 0 && (
                        <EmptyState
                              icon={LayoutList}
                              title="No posts found"
                              desc={allPosts.length === 0
                                    ? 'No published posts yet. Check back soon!'
                                    : 'Try adjusting your search or filters.'}
                              onClear={hasFilters ? clearAll : null}
                        />
                  )}

                  {/* Pagination */}
                  {!loading && !error && totalPages > 1 && (
                        <div className="flex items-center justify-between gap-2 pt-2">
                              <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                    ← Prev
                              </button>
                              <span className="text-sm text-slate-500">
                                    Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
                                    <span className="hidden sm:inline text-slate-400"> · {filtered.length} total</span>
                              </span>
                              <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                    Next →
                              </button>
                        </div>
                  )}

            </div>
      )
}

export default AllPosts
