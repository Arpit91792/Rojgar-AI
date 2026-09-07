import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Building2, Briefcase, GraduationCap, Calendar, FileText, FileCheck, X, Loader2 } from 'lucide-react'
import { fetchPostsByType, normaliseJob } from '../services/api.js'

const CAT_META = {
      GOVERNMENT_JOB: { label: 'Govt Job', color: 'bg-blue-100 text-blue-700', icon: Building2 },
      PRIVATE_JOB: { label: 'Private', color: 'bg-green-100 text-green-700', icon: Briefcase },
      INTERNSHIP: { label: 'Internship', color: 'bg-purple-100 text-purple-700', icon: GraduationCap },
      TIME_TABLE: { label: 'Time Table', color: 'bg-yellow-100 text-yellow-700', icon: Calendar },
      RESULT: { label: 'Result', color: 'bg-teal-100 text-teal-700', icon: FileText },
      ADMIT_CARD: { label: 'Admit Card', color: 'bg-orange-100 text-orange-700', icon: FileCheck },
}

const ResultCard = ({ post }) => (
      <Link
            to={`/posts/${post.id}`}
            className="block w-full bg-white border-2 border-green-500 rounded-xl px-5 py-4 hover:shadow-md hover:border-green-600 transition-all duration-200 group"
      >
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-green-700 transition-colors">
                  {post.title}
            </h3>
      </Link>
)

// ── SearchPage ────────────────────────────────────────────────────────────────
const TYPES = ['GOVERNMENT', 'PRIVATE', 'INTERNSHIP', 'TIME_TABLE', 'RESULT', 'ADMIT_CARD']

const SearchPage = () => {
      const [searchParams, setSearchParams] = useSearchParams()
      const [inputValue, setInputValue] = useState(searchParams.get('q') || '')
      const [allPosts, setAllPosts] = useState([])
      const [loading, setLoading] = useState(false)

      // Fetch all published posts from API on mount
      useEffect(() => {
            setLoading(true)
            Promise.all(
                  TYPES.map((t) =>
                        fetchPostsByType(t, { limit: 100, status: 'PUBLISHED' })
                              .then((r) => (r.data || []).map(normaliseJob))
                              .catch(() => [])
                  )
            ).then((results) => {
                  setAllPosts(results.flat())
            }).finally(() => setLoading(false))
      }, [])

      useEffect(() => {
            setInputValue(searchParams.get('q') || '')
      }, [searchParams])

      const query = searchParams.get('q') || ''

      const results = useMemo(() => {
            if (!query.trim()) return []
            const q = query.toLowerCase()
            return allPosts.filter((p) =>
                  p.title?.toLowerCase().includes(q) ||
                  p.organization?.toLowerCase().includes(q) ||
                  p.location?.toLowerCase().includes(q) ||
                  p.description?.toLowerCase().includes(q) ||
                  p.qualification?.toLowerCase().includes(q)
            )
      }, [allPosts, query])

      const grouped = useMemo(() => {
            const map = {}
            results.forEach((p) => {
                  if (!map[p.category]) map[p.category] = []
                  map[p.category].push(p)
            })
            return map
      }, [results])

      const handleSubmit = (e) => {
            e.preventDefault()
            if (inputValue.trim()) setSearchParams({ q: inputValue.trim() })
      }

      const clearSearch = () => { setInputValue(''); setSearchParams({}) }

      return (
            <div className="space-y-6">
                  <div>
                        <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                    <Search className="w-6 h-6 text-blue-600" />
                              </div>
                              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Search</h1>
                        </div>
                        <p className="text-gray-600">Search across all jobs, internships, results and more</p>
                  </div>

                  <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border">
                        <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search jobs, internships, results, admit cards…"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full pl-10 pr-24 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {inputValue && (
                                          <button type="button" onClick={clearSearch} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Clear search">
                                                <X size={16} />
                                          </button>
                                    )}
                                    <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                          Search
                                    </button>
                              </div>
                        </div>
                  </form>

                  {loading && (
                        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                              <Loader2 size={20} className="animate-spin" /> Loading posts from server…
                        </div>
                  )}

                  {!loading && query.trim() && (
                        results.length === 0 ? (
                              <div className="bg-white rounded-xl p-12 text-center border">
                                    <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No results for "{query}"</h3>
                                    <p className="text-gray-500 text-sm">Try different keywords or browse a category from the sidebar.</p>
                              </div>
                        ) : (
                              <>
                                    <p className="text-sm text-gray-500">
                                          <span className="font-semibold text-gray-900">{results.length}</span> result{results.length !== 1 ? 's' : ''} for "{query}"
                                    </p>
                                    {Object.entries(grouped).map(([category, posts]) => {
                                          const meta = CAT_META[category] || { label: category, color: 'bg-gray-100 text-gray-600', icon: FileText }
                                          const Icon = meta.icon
                                          return (
                                                <section key={category}>
                                                      <div className="flex items-center gap-2 mb-3">
                                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                                                                  <Icon size={13} /> {meta.label}
                                                            </span>
                                                            <span className="text-xs text-gray-400">{posts.length} found</span>
                                                      </div>
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                            {posts.map((post) => <ResultCard key={post.id} post={post} />)}
                                                      </div>
                                                </section>
                                          )
                                    })}
                              </>
                        )
                  )}

                  {!loading && !query.trim() && (
                        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
                              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                              <p className="text-gray-500 text-sm font-medium">Type something to search across all posts</p>
                        </div>
                  )}
            </div>
      )
}

export default SearchPage
