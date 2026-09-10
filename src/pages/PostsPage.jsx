/**
 * PostsPage.jsx — /posts
 *
 * A standalone "Latest Jobs & Posts" listing page.
 * Rendered OUTSIDE the main Layout so it has its own header
 * (no site-wide nav bar or desktop sidebar).
 *
 * Shows ALL published posts across every category, newest first.
 * Includes search + browse (category) filtering that work together.
 *
 * Individual post detail pages (/posts/:slug) are NOT affected —
 * they continue to use the main Layout and PostDetail component.
 */
import React, {
      useState, useEffect, useMemo, useCallback, useRef
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
      Search, ChevronDown, X, RefreshCw,
      Building2, Briefcase, GraduationCap, Calendar,
      FileText, FileCheck, BookOpen, Award, Zap, Cpu,
      LayoutList, ArrowLeft, Loader2
} from 'lucide-react'
import { fetchPostsByType, normaliseJob } from '../services/api.js'
import logo from '../assets/logo.png'

// ── Category / type definitions ───────────────────────────────────────────────

const CATEGORIES = [
      { type: '', label: 'All', Icon: LayoutList, color: 'bg-slate-100   text-slate-700', active: 'bg-slate-800  text-white' },
      { type: 'GOVERNMENT', label: 'Government Jobs', Icon: Building2, color: 'bg-blue-50     text-blue-700', active: 'bg-blue-600   text-white' },
      { type: 'PRIVATE', label: 'Private Jobs', Icon: Briefcase, color: 'bg-emerald-50  text-emerald-700', active: 'bg-emerald-600 text-white' },
      { type: 'INTERNSHIP', label: 'Internships', Icon: GraduationCap, color: 'bg-violet-50   text-violet-700', active: 'bg-violet-600 text-white' },
      { type: 'TIME_TABLE', label: 'Time Table', Icon: Calendar, color: 'bg-amber-50    text-amber-700', active: 'bg-amber-500  text-white' },
      { type: 'RESULT', label: 'Results', Icon: FileText, color: 'bg-teal-50     text-teal-700', active: 'bg-teal-600   text-white' },
      { type: 'ADMIT_CARD', label: 'Admit Cards', Icon: FileCheck, color: 'bg-orange-50   text-orange-700', active: 'bg-orange-500 text-white' },
      { type: 'SCHOLARSHIP', label: 'Scholarships', Icon: Award, color: 'bg-pink-50     text-pink-700', active: 'bg-pink-600   text-white' },
      { type: 'HACKATHON', label: 'Hackathons', Icon: Zap, color: 'bg-red-50      text-red-700', active: 'bg-red-600    text-white' },
      { type: 'PLACEMENT_DRIVE', label: 'Placements', Icon: BookOpen, color: 'bg-cyan-50     text-cyan-700', active: 'bg-cyan-600   text-white' },
      { type: 'COURSE', label: 'Courses', Icon: Cpu, color: 'bg-indigo-50   text-indigo-700', active: 'bg-indigo-600 text-white' },
]

// Backend type → category (as returned by normaliseJob)
const TYPE_TO_CAT = {
      GOVERNMENT: 'GOVERNMENT_JOB', PRIVATE: 'PRIVATE_JOB', INTERNSHIP: 'INTERNSHIP',
      TIME_TABLE: 'TIME_TABLE', RESULT: 'RESULT', ADMIT_CARD: 'ADMIT_CARD',
      SCHOLARSHIP: 'SCHOLARSHIP', HACKATHON: 'HACKATHON', PLACEMENT_DRIVE: 'PLACEMENT_DRIVE',
      COURSE: 'COURSE',
}

// Category (normaliseJob output) → type meta
const CAT_TO_META = {}
CATEGORIES.filter(c => c.type).forEach(c => {
      CAT_TO_META[TYPE_TO_CAT[c.type] || c.type] = c
})

const ALL_FETCH_TYPES = CATEGORIES.filter(c => c.type).map(c => c.type)

const PAGE_SIZE = 25

// ── Type badge for each card ──────────────────────────────────────────────────
const TypeBadge = ({ category }) => {
      const meta = CAT_TO_META[category]
      if (!meta) return null
      const { Icon, label, color } = meta
      return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${color}`}>
                  <Icon size={10} />
                  {label}
            </span>
      )
}

// ── Post card ─────────────────────────────────────────────────────────────────
const PostCard = ({ job }) => (
      <Link
            to={`/posts/${job.slug || job.id}`}
            className="group flex flex-col gap-2 bg-white border-2 border-green-500 rounded-xl px-5 py-4 hover:shadow-md hover:border-green-600 transition-all duration-200"
      >
            <TypeBadge category={job.category} />
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
                  {job.title}
            </h3>
            {job.organization && (
                  <p className="text-xs text-gray-500 truncate">{job.organization}</p>
            )}
      </Link>
)

// ── Browse dropdown ───────────────────────────────────────────────────────────
const BrowseDropdown = ({ active, onChange }) => {
      const [open, setOpen] = useState(false)
      const ref = useRef(null)
      const activeMeta = CATEGORIES.find(c => c.type === active) || CATEGORIES[0]

      // Close on outside click
      useEffect(() => {
            const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
            document.addEventListener('mousedown', handler)
            return () => document.removeEventListener('mousedown', handler)
      }, [])

      return (
            <div ref={ref} className="relative">
                  <button
                        type="button"
                        onClick={() => setOpen(o => !o)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                        {activeMeta.label === 'All' ? 'Browse' : activeMeta.label}
                        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden">
                              {CATEGORIES.map(({ type, label, Icon, color }) => (
                                    <button
                                          key={type}
                                          type="button"
                                          onClick={() => { onChange(type); setOpen(false) }}
                                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${active === type
                                                      ? 'bg-slate-100 font-semibold text-slate-900'
                                                      : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                    >
                                          <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${color}`}>
                                                <Icon size={14} />
                                          </span>
                                          {label}
                                          {active === type && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                                    </button>
                              ))}
                        </div>
                  )}
            </div>
      )
}

// ═════════════════════════════════════════════════════════════════════════════

const PostsPage = () => {
      const navigate = useNavigate()

      // Data
      const [allPosts, setAllPosts] = useState([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)

      // Filters
      const [search, setSearch] = useState('')
      const [typeFilter, setTypeFilter] = useState('')   // empty = All
      const [page, setPage] = useState(1)

      // ── Fetch all types in parallel on mount ─────────────────────────────────
      const fetchAll = useCallback(async () => {
            setLoading(true)
            setError(null)
            try {
                  const results = await Promise.all(
                        ALL_FETCH_TYPES.map(t =>
                              fetchPostsByType(t, { limit: 200, status: 'PUBLISHED' })
                                    .then(r => (r.data || []).map(normaliseJob))
                                    .catch(() => [])
                        )
                  )
                  // Merge & sort newest first
                  const merged = results.flat().sort(
                        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                  )
                  setAllPosts(merged)
            } catch {
                  setError('Unable to load posts. Please try again.')
            } finally {
                  setLoading(false)
            }
      }, [])

      useEffect(() => { fetchAll() }, [fetchAll])

      // Reset to page 1 whenever filters change
      useEffect(() => { setPage(1) }, [search, typeFilter])

      // ── Filtered list ─────────────────────────────────────────────────────────
      const filtered = useMemo(() => {
            const q = search.toLowerCase().trim()
            const filterCat = typeFilter ? (TYPE_TO_CAT[typeFilter] || typeFilter) : ''

            return allPosts.filter(p => {
                  const matchType = !filterCat || p.category === filterCat
                  const matchSearch = !q ||
                        p.title?.toLowerCase().includes(q) ||
                        p.organization?.toLowerCase().includes(q) ||
                        p.location?.toLowerCase().includes(q) ||
                        p.qualification?.toLowerCase().includes(q)
                  return matchType && matchSearch
            })
      }, [allPosts, search, typeFilter])

      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
      const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      const hasFilters = !!search || !!typeFilter

      // ── Render ────────────────────────────────────────────────────────────────

      return (
            <div className="min-h-screen bg-slate-50 flex flex-col">

                  {/* ── Custom page header (no site nav) ─────────────────────────────── */}
                  <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
                        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">

                              {/* Logo / back */}
                              <Link to="/" className="flex-shrink-0">
                                    <img src={logo} alt="RozgarGrid AI" className="h-8 w-auto object-contain" />
                              </Link>

                              {/* Title — hidden on xs, visible sm+ */}
                              <div className="hidden sm:flex flex-col leading-tight mr-1">
                                    <span className="text-base font-extrabold text-slate-900 leading-none">Latest Jobs &amp; Posts</span>
                                    {!loading && (
                                          <span className="text-[11px] text-slate-400 tabular-nums">
                                                {filtered.length.toLocaleString()} post{filtered.length !== 1 ? 's' : ''}
                                          </span>
                                    )}
                              </div>

                              {/* Search */}
                              <form
                                    onSubmit={e => { e.preventDefault() }}
                                    className="flex-1 relative"
                              >
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                          type="search"
                                          value={search}
                                          onChange={e => setSearch(e.target.value)}
                                          placeholder="Search jobs, results, admit cards…"
                                          className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                                    />
                                    {search && (
                                          <button
                                                type="button"
                                                onClick={() => setSearch('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                          >
                                                <X size={13} />
                                          </button>
                                    )}
                              </form>

                              {/* Browse dropdown */}
                              <BrowseDropdown active={typeFilter} onChange={setTypeFilter} />

                              {/* Refresh */}
                              <button
                                    onClick={fetchAll}
                                    disabled={loading}
                                    title="Refresh"
                                    className="hidden sm:flex p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                              >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                              </button>
                        </div>

                        {/* Active filter chips */}
                        {hasFilters && (
                              <div className="max-w-4xl mx-auto px-4 pb-2 flex items-center gap-2 flex-wrap">
                                    {typeFilter && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                                {CATEGORIES.find(c => c.type === typeFilter)?.label}
                                                <button onClick={() => setTypeFilter('')} className="hover:text-blue-900"><X size={11} /></button>
                                          </span>
                                    )}
                                    {search && (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                                                "{search}"
                                                <button onClick={() => setSearch('')} className="hover:text-slate-900"><X size={11} /></button>
                                          </span>
                                    )}
                                    <button
                                          onClick={() => { setSearch(''); setTypeFilter('') }}
                                          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                          Clear all
                                    </button>
                              </div>
                        )}
                  </header>

                  {/* ── Page body ──────────────────────────────────────────────────────── */}
                  <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-5">

                        {/* Loading */}
                        {loading && (
                              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                                    <Loader2 size={28} className="animate-spin text-blue-500" />
                                    <p className="text-sm">Loading latest posts…</p>
                              </div>
                        )}

                        {/* Error */}
                        {error && (
                              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm text-center">
                                    {error}
                                    <button onClick={fetchAll} className="ml-3 underline font-medium">Retry</button>
                              </div>
                        )}

                        {/* Post list */}
                        {!loading && !error && paginated.length > 0 && (
                              <div className="flex flex-col gap-3">
                                    {paginated.map(job => <PostCard key={job.id} job={job} />)}
                              </div>
                        )}

                        {/* Empty */}
                        {!loading && !error && paginated.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <LayoutList size={40} className="text-slate-300 mb-3" />
                                    <h3 className="font-bold text-slate-700 mb-1">
                                          {allPosts.length === 0 ? 'No published posts yet' : 'No posts match your filters'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                          {allPosts.length === 0 ? 'Check back soon!' : 'Try adjusting your search or category.'}
                                    </p>
                                    {hasFilters && (
                                          <button
                                                onClick={() => { setSearch(''); setTypeFilter('') }}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                                          >
                                                Clear Filters
                                          </button>
                                    )}
                              </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && totalPages > 1 && (
                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                                    <button
                                          onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
                                          disabled={page === 1}
                                          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                          ← Prev
                                    </button>
                                    <span className="text-sm text-slate-500">
                                          Page <strong className="text-slate-800">{page}</strong> / <strong className="text-slate-800">{totalPages}</strong>
                                          <span className="hidden sm:inline text-slate-400"> · {filtered.length.toLocaleString()} total</span>
                                    </span>
                                    <button
                                          onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
                                          disabled={page === totalPages}
                                          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                          Next →
                                    </button>
                              </div>
                        )}

                  </main>

                  {/* ── Minimal footer ─────────────────────────────────────────────────── */}
                  <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
                        © {new Date().getFullYear()} RozgarGrid AI · <Link to="/" className="hover:text-slate-600">Home</Link>
                  </footer>

            </div>
      )
}

export default PostsPage
