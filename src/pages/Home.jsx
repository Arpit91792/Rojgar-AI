import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
      Building2, GraduationCap, Briefcase, Calendar,
      FileText, FileCheck, ChevronRight, Clock, MapPin,
      Search, TrendingUp, Star, ArrowRight, Sparkles,
      IndianRupee, Users
} from 'lucide-react'
import logo from '../assets/logo.jpeg'
import * as postService from '../services/postService'

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
      {
            icon: Building2, label: 'Government Jobs', desc: 'UPSC, SSC, Railways & more',
            to: '/government-jobs',
            gradient: 'from-blue-500 to-blue-600',
            softBg: 'bg-blue-50', softText: 'text-blue-600', softBorder: 'border-blue-100',
            hoverRing: 'hover:ring-blue-300',
      },
      {
            icon: Briefcase, label: 'Private Jobs', desc: 'Top companies hiring now',
            to: '/private-jobs',
            gradient: 'from-emerald-500 to-emerald-600',
            softBg: 'bg-emerald-50', softText: 'text-emerald-600', softBorder: 'border-emerald-100',
            hoverRing: 'hover:ring-emerald-300',
      },
      {
            icon: GraduationCap, label: 'Internships', desc: 'Launch your career early',
            to: '/internships',
            gradient: 'from-violet-500 to-violet-600',
            softBg: 'bg-violet-50', softText: 'text-violet-600', softBorder: 'border-violet-100',
            hoverRing: 'hover:ring-violet-300',
      },
      {
            icon: Calendar, label: 'Time Table', desc: 'Exam schedules & dates',
            to: '/time-table',
            gradient: 'from-amber-500 to-amber-600',
            softBg: 'bg-amber-50', softText: 'text-amber-600', softBorder: 'border-amber-100',
            hoverRing: 'hover:ring-amber-300',
      },
      {
            icon: FileText, label: 'Results', desc: 'Check latest results',
            to: '/results',
            gradient: 'from-teal-500 to-teal-600',
            softBg: 'bg-teal-50', softText: 'text-teal-600', softBorder: 'border-teal-100',
            hoverRing: 'hover:ring-teal-300',
      },
      {
            icon: FileCheck, label: 'Admit Cards', desc: 'Hall tickets & download',
            to: '/admit-cards',
            gradient: 'from-orange-500 to-orange-600',
            softBg: 'bg-orange-50', softText: 'text-orange-600', softBorder: 'border-orange-100',
            hoverRing: 'hover:ring-orange-300',
      },
]

// ── Category badge map ────────────────────────────────────────────────────────
const CAT_BADGE = {
      GOVERNMENT_JOB: { label: 'Govt Job', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
      PRIVATE_JOB: { label: 'Private', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      INTERNSHIP: { label: 'Internship', bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
      TIME_TABLE: { label: 'Time Table', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
      RESULT: { label: 'Result', bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
      ADMIT_CARD: { label: 'Admit Card', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
}

// ── Recently viewed ───────────────────────────────────────────────────────────
const RECENTLY_VIEWED_KEY = 'rojgar_recently_viewed'
const MAX_RECENT = 4

export const recordView = (postId) => {
      try {
            const existing = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
            const updated = [postId, ...existing.filter((id) => id !== postId)].slice(0, MAX_RECENT)
            localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
            window.dispatchEvent(new Event('rojgar_storage_updated'))
      } catch (_) { }
}

const fmt = (d) =>
      d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null

// ── Post card ─────────────────────────────────────────────────────────────────
const PostCard = ({ post }) => {
      const cat = CAT_BADGE[post.category] || { label: post.category, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
      const lastDate = post.lastDate || post.examDate || post.resultDate || post.releaseDate

      return (
            <Link
                  to={`/posts/${post.slug}`}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl card-hover p-5 flex flex-col gap-3"
            >
                  {/* Badge + new tag */}
                  <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                              {cat.label}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">NEW</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                  </h3>

                  {/* Org */}
                  {post.organization && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <Building2 size={11} className="text-slate-400" />
                              </div>
                              <span className="truncate">{post.organization}</span>
                        </div>
                  )}

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                        {post.location && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-xs text-slate-500 border border-slate-100">
                                    <MapPin size={10} />
                                    {post.location}
                              </span>
                        )}
                        {(post.salary || post.stipend) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-xs text-emerald-600 border border-emerald-100 font-medium">
                                    <IndianRupee size={10} />
                                    {post.salary || post.stipend}
                              </span>
                        )}
                        {lastDate && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-xs text-red-500 border border-red-100">
                                    <Clock size={10} />
                                    {fmt(lastDate)}
                              </span>
                        )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-200 -mb-1">
                        View Details <ChevronRight size={13} />
                  </div>
            </Link>
      )
}

// ── Hero search (rotating words) ──────────────────────────────────────────────
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
                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                  <div className="relative px-5 py-6 sm:px-8 sm:py-8 text-center">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-semibold text-blue-100 mb-3">
                              <Sparkles size={11} className="text-yellow-300" />
                              India's #1 Job Portal
                        </div>

                        {/* Headline */}
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight mb-2">
                              Find Your Dream{' '}
                              <span
                                    className={`transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} inline-block text-yellow-300`}
                              >
                                    {WORDS[idx]}
                              </span>
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm mb-4 max-w-md mx-auto">
                              Thousands of opportunities updated daily across government, private & more.
                        </p>

                        {/* Search bar */}
                        <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg mx-auto">
                              <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                          type="text"
                                          value={query}
                                          onChange={(e) => setQuery(e.target.value)}
                                          placeholder="Job title, company, keyword…"
                                          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-slate-800 text-sm bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300/60 placeholder:text-slate-400"
                                    />
                              </div>
                              <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl shadow-lg transition-colors text-sm whitespace-nowrap"
                              >
                                    Search
                              </button>
                        </form>

                        {/* Quick links */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                              <span className="text-blue-200 text-xs">Trending:</span>
                              {['UPSC', 'SSC CGL', 'Railways', 'Bank PO', 'IT Jobs'].map((tag) => (
                                    <button
                                          key={tag}
                                          onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                                          className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-medium text-white transition-colors"
                                    >
                                          {tag}
                                    </button>
                              ))}
                        </div>
                  </div>
            </section>
      )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
const STATS = [
      { icon: Briefcase, value: '10,000+', label: 'Active Jobs' },
      { icon: Building2, value: '500+', label: 'Organizations' },
      { icon: Users, value: '1 Lakh+', label: 'Job Seekers' },
      { icon: TrendingUp, value: 'Daily', label: 'Updates' },
]

const StatsBar = () => (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Icon size={18} className="text-blue-600" />
                        </div>
                        <div>
                              <p className="font-extrabold text-slate-800 text-base leading-none">{value}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                        </div>
                  </div>
            ))}
      </div>
)

// ── Section header ────────────────────────────────────────────────────────────
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

// ── Home page ─────────────────────────────────────────────────────────────────
const Home = () => {
      const [recentPosts, setRecentPosts] = useState([])
      const [latestPosts, setLatestPosts] = useState([])

      const loadRecent = () => {
            try {
                  const ids = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
                  const posts = ids
                        .map((id) => postService.getPostById(id))
                        .filter((p) => p && p.status === 'PUBLISHED')
                        .slice(0, MAX_RECENT)
                  setRecentPosts(posts)
            } catch (_) { setRecentPosts([]) }
      }

      const loadLatest = () => {
            try {
                  const all = postService.getPosts()
                  const published = all
                        .filter((p) => p.status === 'PUBLISHED')
                        .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
                        .slice(0, 4)
                  setLatestPosts(published)
            } catch (_) { setLatestPosts([]) }
      }

      useEffect(() => {
            loadRecent()
            loadLatest()
            const handler = () => { loadRecent(); loadLatest() }
            window.addEventListener('rojgar_storage_updated', handler)
            window.addEventListener('storage', handler)
            return () => {
                  window.removeEventListener('rojgar_storage_updated', handler)
                  window.removeEventListener('storage', handler)
            }
      }, [])

      return (
            <div className="space-y-8">

                  {/* ── Hero ── */}
                  <HeroSearch />

                  {/* ── Stats ── */}
                  <StatsBar />

                  {/* ── Browse Categories ── */}
                  <section>
                        <SectionHeader
                              icon={Star} iconBg="bg-yellow-50" iconColor="text-yellow-500"
                              title="Browse Categories"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                              {CATEGORIES.map((cat) => (
                                    <Link
                                          key={cat.to}
                                          to={cat.to}
                                          className={`group relative flex flex-col items-center text-center p-5 rounded-2xl border-2 bg-white ${cat.softBorder} hover:ring-2 ${cat.hoverRing} hover:shadow-lg card-hover transition-all duration-200 overflow-hidden`}
                                    >
                                          {/* Gradient icon */}
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

                  {/* ── Latest Posts ── */}
                  <section>
                        <SectionHeader
                              icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600"
                              title="Latest Opportunities"
                              linkTo="/government-jobs" linkLabel="View all"
                        />
                        {latestPosts.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {latestPosts.map((post) => (
                                          <PostCard key={post.id} post={post} />
                                    ))}
                              </div>
                        ) : (
                              <EmptyCard
                                    icon={TrendingUp}
                                    title="No posts yet"
                                    desc="Published posts will appear here automatically."
                              />
                        )}
                  </section>

                  {/* ── Recently Viewed ── */}
                  {recentPosts.length > 0 && (
                        <section>
                              <SectionHeader
                                    icon={Clock} iconBg="bg-slate-100" iconColor="text-slate-500"
                                    title="Recently Viewed"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {recentPosts.map((post) => (
                                          <PostCard key={post.id} post={post} />
                                    ))}
                              </div>
                        </section>
                  )}

                  {/* ── CTA Banner ── */}
                  <section className="rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                              <h3 className="text-xl font-extrabold mb-1">Stay Ahead of the Competition</h3>
                              <p className="text-slate-400 text-sm">Get notified about new jobs matching your profile. Never miss a deadline.</p>
                        </div>
                        <Link
                              to="/government-jobs"
                              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors text-sm"
                        >
                              Browse Jobs <ArrowRight size={15} />
                        </Link>
                  </section>

            </div>
      )
}

// ── Empty state card ──────────────────────────────────────────────────────────
const EmptyCard = ({ icon: Icon, title, desc }) => (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-14 h-14 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-600 text-sm font-semibold">{title}</p>
            <p className="text-slate-400 text-xs mt-1">{desc}</p>
      </div>
)

export default Home
