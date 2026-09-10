import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
      Building2, GraduationCap, Briefcase, Calendar,
      FileText, FileCheck, ChevronRight,
      Search, TrendingUp, Star, ArrowRight, Sparkles,
      Clock
} from 'lucide-react'
import { fetchPostsByType } from '../services/api.js'
import { normaliseJob } from '../services/api.js'

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
      { icon: Building2, label: 'Government Jobs', desc: 'UPSC, SSC, Railways & more', to: '/government-jobs', gradient: 'from-blue-500 to-blue-600', softBg: 'bg-blue-50', softText: 'text-blue-600', softBorder: 'border-blue-100', hoverRing: 'hover:ring-blue-300' },
      { icon: Briefcase, label: 'Private Jobs', desc: 'Top companies hiring now', to: '/private-jobs', gradient: 'from-emerald-500 to-emerald-600', softBg: 'bg-emerald-50', softText: 'text-emerald-600', softBorder: 'border-emerald-100', hoverRing: 'hover:ring-emerald-300' },
      { icon: GraduationCap, label: 'Internships', desc: 'Launch your career early', to: '/internships', gradient: 'from-violet-500 to-violet-600', softBg: 'bg-violet-50', softText: 'text-violet-600', softBorder: 'border-violet-100', hoverRing: 'hover:ring-violet-300' },
      { icon: Calendar, label: 'Time Table', desc: 'Exam schedules & dates', to: '/time-table', gradient: 'from-amber-500 to-amber-600', softBg: 'bg-amber-50', softText: 'text-amber-600', softBorder: 'border-amber-100', hoverRing: 'hover:ring-amber-300' },
      { icon: FileText, label: 'Results', desc: 'Check latest results', to: '/results', gradient: 'from-teal-500 to-teal-600', softBg: 'bg-teal-50', softText: 'text-teal-600', softBorder: 'border-teal-100', hoverRing: 'hover:ring-teal-300' },
      { icon: FileCheck, label: 'Admit Cards', desc: 'Hall tickets & download', to: '/admit-cards', gradient: 'from-orange-500 to-orange-600', softBg: 'bg-orange-50', softText: 'text-orange-600', softBorder: 'border-orange-100', hoverRing: 'hover:ring-orange-300' },
]

// ── Recently viewed — still uses localStorage (per-device UI preference only) ─
const RECENTLY_VIEWED_KEY = 'rojgar_recently_viewed'
const MAX_RECENT = 4

export const recordView = (postId) => {
      try {
            const existing = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
            const updated = [postId, ...existing.filter((id) => id !== postId)].slice(0, MAX_RECENT)
            localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
      } catch (_) { }
}

// ── Post card ─────────────────────────────────────────────────────────────────
const PostCard = ({ post }) => (
      <Link
            to={`/posts/${post.id}`}
            className="block w-full bg-white border-2 border-green-500 rounded-xl px-5 py-4 hover:shadow-md hover:border-green-600 transition-all duration-200 group"
      >
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-green-700 transition-colors">
                  {post.title}
            </h3>
      </Link>
)

// ── Hero search ───────────────────────────────────────────────────────────────
const WORDS = ['Government Jobs', 'Private Jobs', 'Internships', 'Exam Results', 'Admit Cards']

const HeroSearch = () => {
      const [idx, setIdx] = useState(0)
      const [visible, setVisible] = useState(true)
      const [query, setQuery] = useState('')
      const navigate = useNavigate()

      useEffect(() => {
            const t = setInterval(() => {
                  setVisible(false)
                  setTimeout(() => { setIdx((i) => (i + 1) % WORDS.length); setVisible(true) }, 350)
            }, 2400)
            return () => clearInterval(t)
      }, [])

      const handleSubmit = (e) => {
            e.preventDefault()
            if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      }

      return (
            <section className="relative overflow-hidden rounded-3xl gradient-hero text-white mb-8">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
                  <div className="relative px-6 py-8 sm:px-10 sm:py-10 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-semibold text-blue-100 mb-3">
                              <Sparkles size={11} className="text-yellow-300" /> RozgarGrid AI
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold leading-tight mb-2">
                              Find Your Dream{' '}
                              <span className={`transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} inline-block text-yellow-300`}>
                                    {WORDS[idx]}
                              </span>
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm mb-5 max-w-xl mx-auto">
                              Thousands of opportunities updated daily across government, private & more.
                        </p>
                        <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
                              <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                          type="text"
                                          value={query}
                                          onChange={(e) => setQuery(e.target.value)}
                                          placeholder="Job title, company, keyword…"
                                          className="w-full pl-9 pr-4 py-3 rounded-xl text-slate-800 text-sm bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300/60 placeholder:text-slate-400"
                                    />
                              </div>
                              <button type="submit" className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl shadow-lg transition-colors text-sm whitespace-nowrap">
                                    Search
                              </button>
                        </form>
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                              <span className="text-blue-200 text-xs">Trending:</span>
                              {['UPSC', 'SSC CGL', 'Railways', 'Bank PO', 'IT Jobs'].map((tag) => (
                                    <button key={tag} onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                                          className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-xs font-medium text-white transition-colors">
                                          {tag}
                                    </button>
                              ))}
                        </div>
                  </div>
            </section>
      )
}

const SectionHeader = ({ icon: Icon, iconBg, iconColor, title, linkTo, linkLabel }) => (
      <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
                        <Icon size={18} className={iconColor} />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
            </div>
            {linkTo && (
                  <Link to={linkTo} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        {linkLabel} <ArrowRight size={13} />
                  </Link>
            )}
      </div>
)

const EmptyCard = ({ icon: Icon, title, desc }) => (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-14 h-14 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-600 text-sm font-semibold">{title}</p>
            <p className="text-slate-400 text-xs mt-1">{desc}</p>
      </div>
)

// ── Home page ─────────────────────────────────────────────────────────────────
const Home = () => {
      const [latestPosts, setLatestPosts] = useState([])
      const [recentPosts, setRecentPosts] = useState([])
      const [loadingLatest, setLoadingLatest] = useState(true)

      // Load latest 4 published posts from API
      useEffect(() => {
            setLoadingLatest(true)
            // Fetch across all types, sorted by createdAt desc, take 4
            fetchPostsByType('GOVERNMENT', { limit: 10, status: 'PUBLISHED' })
                  .then((res) => {
                        // Fetch a broad set and take the 4 most recent
                        const all = (res.data || []).map(normaliseJob)
                        setLatestPosts(all.slice(0, 4))
                  })
                  .catch(() => setLatestPosts([]))
                  .finally(() => setLoadingLatest(false))

            // Better: fetch all types and pick the 4 newest
            const types = ['GOVERNMENT', 'PRIVATE', 'INTERNSHIP', 'TIME_TABLE', 'RESULT', 'ADMIT_CARD']
            Promise.all(
                  types.map((t) => fetchPostsByType(t, { limit: 20, status: 'PUBLISHED' }).then((r) => r.data || []).catch(() => []))
            ).then((results) => {
                  const all = results.flat().map(normaliseJob)
                  all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                  setLatestPosts(all.slice(0, 4))
            }).finally(() => setLoadingLatest(false))
      }, [])

      // Recently viewed — load from API using stored ids
      useEffect(() => {
            const ids = (() => {
                  try { return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]') } catch { return [] }
            })()
            if (ids.length === 0) return

            Promise.all(
                  ids.slice(0, MAX_RECENT).map((id) =>
                        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs/${id}`)
                              .then((r) => r.json())
                              .then((r) => r.data && r.data.status === 'PUBLISHED' ? normaliseJob(r.data) : null)
                              .catch(() => null)
                  )
            ).then((posts) => setRecentPosts(posts.filter(Boolean)))
      }, [])

      return (
            <div className="space-y-8">
                  <HeroSearch />

                  {/* Browse Categories */}
                  <section>
                        <SectionHeader icon={Star} iconBg="bg-yellow-50" iconColor="text-yellow-500" title="Browse Categories" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                              {CATEGORIES.map((cat) => (
                                    <Link key={cat.to} to={cat.to}
                                          className={`group relative flex flex-col items-center text-center p-5 rounded-2xl border-2 bg-white ${cat.softBorder} hover:ring-2 ${cat.hoverRing} hover:shadow-lg card-hover transition-all duration-200 overflow-hidden`}>
                                          <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-200 p-3`}>
                                                <cat.icon className="w-6 h-6 text-white" />
                                          </div>
                                          <p className="font-bold text-sm text-slate-800 leading-tight mb-0.5">{cat.label}</p>
                                          <p className="text-xs text-slate-400 leading-snug hidden sm:block">{cat.desc}</p>
                                          <div className={`mt-2 flex items-center gap-0.5 text-xs font-semibold ${cat.softText} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                Explore <ChevronRight size={11} />
                                          </div>
                                    </Link>
                              ))}
                        </div>
                  </section>

                  {/* Latest Opportunities */}
                  <section>
                        <SectionHeader icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600"
                              title="Latest Opportunities" linkTo="/government-jobs" linkLabel="View all" />
                        {loadingLatest ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                          <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-40" />
                                    ))}
                              </div>
                        ) : latestPosts.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {latestPosts.map((post) => <PostCard key={post.id} post={post} />)}
                              </div>
                        ) : (
                              <EmptyCard icon={TrendingUp} title="No posts yet" desc="Published posts will appear here automatically." />
                        )}
                  </section>

                  {/* Recently Viewed */}
                  {recentPosts.length > 0 && (
                        <section>
                              <SectionHeader icon={Clock} iconBg="bg-slate-100" iconColor="text-slate-500" title="Recently Viewed" />
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {recentPosts.map((post) => <PostCard key={post.id} post={post} />)}
                              </div>
                        </section>
                  )}

                  {/* CTA Banner */}
                  <section className="rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                              <h3 className="text-xl font-extrabold mb-1">Stay Ahead of the Competition</h3>
                              <p className="text-slate-400 text-sm">Get notified about new jobs matching your profile. Never miss a deadline.</p>
                        </div>
                        <Link to="/government-jobs" className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors text-sm">
                              Browse Jobs <ArrowRight size={15} />
                        </Link>
                  </section>
            </div>
      )
}

export default Home
