// PostDetail.jsx — SEO-friendly slug URLs with ID backward compatibility
// Two-column layout: main article (left) + Latest Jobs sidebar (right)
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchPost, fetchPostBySlug, fetchPostsByType, normaliseJob } from '../services/api.js'
import { recordView } from './Home'
import ContentRenderer from '../components/ContentRenderer.jsx'
import {
      AlertCircle, ArrowLeft, Loader2, Share2, Check,
      UserCircle2, TrendingUp, ChevronRight
} from 'lucide-react'

// ── Back-link mapping ─────────────────────────────────────────────────────────
const CAT_BACK = {
      GOVERNMENT_JOB: '/government-jobs',
      PRIVATE_JOB: '/private-jobs',
      INTERNSHIP: '/internships',
      TIME_TABLE: '/time-table',
      RESULT: '/results',
      ADMIT_CARD: '/admit-cards',
}

// ── Category display labels ───────────────────────────────────────────────────
const CAT_LABEL = {
      GOVERNMENT_JOB: 'Govt Job',
      PRIVATE_JOB: 'Private',
      INTERNSHIP: 'Internship',
      TIME_TABLE: 'Time Table',
      RESULT: 'Result',
      ADMIT_CARD: 'Admit Card',
      SCHOLARSHIP: 'Scholarship',
      HACKATHON: 'Hackathon',
      PLACEMENT_DRIVE: 'Placement',
      COURSE: 'Course',
}

const CAT_COLOR = {
      GOVERNMENT_JOB: 'bg-blue-50 text-blue-700',
      PRIVATE_JOB: 'bg-emerald-50 text-emerald-700',
      INTERNSHIP: 'bg-violet-50 text-violet-700',
      TIME_TABLE: 'bg-amber-50 text-amber-700',
      RESULT: 'bg-teal-50 text-teal-700',
      ADMIT_CARD: 'bg-orange-50 text-orange-700',
      SCHOLARSHIP: 'bg-pink-50 text-pink-700',
      HACKATHON: 'bg-red-50 text-red-700',
      PLACEMENT_DRIVE: 'bg-cyan-50 text-cyan-700',
      COURSE: 'bg-indigo-50 text-indigo-700',
}

// ── Types to fetch for the sidebar ───────────────────────────────────────────
const SIDEBAR_TYPES = [
      'GOVERNMENT', 'PRIVATE', 'INTERNSHIP', 'TIME_TABLE',
      'RESULT', 'ADMIT_CARD', 'SCHOLARSHIP', 'HACKATHON', 'PLACEMENT_DRIVE', 'COURSE',
]

// ── CUID detection ────────────────────────────────────────────────────────────
const isCuid = (s) => /^c[a-z0-9]{20,30}$/.test(s)

// ── Latest Jobs sidebar ───────────────────────────────────────────────────────
const LatestJobsSidebar = ({ currentPostId }) => {
      const [posts, setPosts] = useState([])
      const [loading, setLoading] = useState(true)
      const [failed, setFailed] = useState(false)

      useEffect(() => {
            let cancelled = false
            setLoading(true)
            setFailed(false)

            Promise.all(
                  SIDEBAR_TYPES.map(t =>
                        fetchPostsByType(t, { limit: 20, status: 'PUBLISHED' })
                              .then(r => (r.data || []).map(normaliseJob))
                              .catch(() => [])
                  )
            ).then(results => {
                  if (cancelled) return
                  const all = results.flat()
                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                        .filter(p => p.id !== currentPostId)   // exclude current post
                        .slice(0, 8)
                  setPosts(all)
            }).catch(() => {
                  if (!cancelled) setFailed(true)
            }).finally(() => {
                  if (!cancelled) setLoading(false)
            })

            return () => { cancelled = true }
      }, [currentPostId])

      const fmtDate = (d) =>
            d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null

      return (
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-20">

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
                              <div className="flex items-center gap-2 text-white">
                                    <TrendingUp size={15} />
                                    <span className="text-sm font-bold">Latest Jobs &amp; Posts</span>
                              </div>
                              <Link
                                    to="/all-posts"
                                    className="text-blue-200 hover:text-white text-xs font-medium flex items-center gap-0.5 transition-colors"
                              >
                                    View all <ChevronRight size={12} />
                              </Link>
                        </div>

                        {/* Body */}
                        <div className="divide-y divide-gray-50">
                              {loading && (
                                    <div className="flex items-center justify-center py-8">
                                          <Loader2 size={20} className="animate-spin text-blue-500" />
                                    </div>
                              )}

                              {failed && !loading && (
                                    <p className="text-xs text-gray-400 text-center py-6 px-4">
                                          Latest posts unavailable
                                    </p>
                              )}

                              {!loading && !failed && posts.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-6 px-4">
                                          No other posts available
                                    </p>
                              )}

                              {!loading && !failed && posts.map(post => (
                                    <Link
                                          key={post.id}
                                          to={`/posts/${post.slug || post.id}`}
                                          className="flex flex-col gap-1 px-4 py-3 hover:bg-gray-50 transition-colors group"
                                    >
                                          {/* Category badge */}
                                          <span className={`self-start inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${CAT_COLOR[post.category] || 'bg-gray-100 text-gray-600'}`}>
                                                {CAT_LABEL[post.category] || post.category}
                                          </span>

                                          {/* Title */}
                                          <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                                                {post.title}
                                          </p>

                                          {/* Date */}
                                          {post.createdAt && (
                                                <p className="text-[10px] text-gray-400">{fmtDate(post.createdAt)}</p>
                                          )}
                                    </Link>
                              ))}
                        </div>
                  </div>
            </aside>
      )
}

// ═════════════════════════════════════════════════════════════════════════════

const PostDetail = () => {
      const { slug } = useParams()
      const navigate = useNavigate()
      const [post, setPost] = useState(null)
      const [notFound, setNotFound] = useState(false)
      const [loading, setLoading] = useState(true)
      const [copied, setCopied] = useState(false)

      useEffect(() => {
            setLoading(true)
            setNotFound(false)
            setPost(null)

            const load = async () => {
                  try {
                        let job = null

                        if (isCuid(slug)) {
                              // Old-style ID URL — load by ID then redirect to slug URL
                              const res = await fetchPost(slug)
                              job = res?.data
                              if (job && job.status === 'PUBLISHED' && job.slug && job.slug !== slug) {
                                    navigate(`/posts/${job.slug}`, { replace: true })
                                    return
                              }
                        } else {
                              // New-style slug URL — load by slug
                              const res = await fetchPostBySlug(slug)
                              job = res?.data
                        }

                        if (!job || job.status !== 'PUBLISHED') { setNotFound(true); return }

                        const normalised = normaliseJob(job)
                        setPost(normalised)
                        recordView(normalised.id)

                        // ── SEO head tags ────────────────────────────────────────────────
                        const canonical = `${window.location.origin}/posts/${normalised.slug}`

                        document.title = normalised.seoTitle?.trim()
                              ? normalised.seoTitle.trim()
                              : `${normalised.title} | RozgarGrid AI`

                        let linkEl = document.querySelector('link[rel="canonical"]')
                        if (!linkEl) { linkEl = document.createElement('link'); linkEl.rel = 'canonical'; document.head.appendChild(linkEl) }
                        linkEl.href = canonical

                        let metaDesc = document.querySelector('meta[name="description"]')
                        if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc) }
                        metaDesc.content = normalised.metaDescription?.trim() || ''

                        const setMeta = (prop, content, attr = 'property') => {
                              let el = document.querySelector(`meta[${attr}="${prop}"]`)
                              if (!el) { el = document.createElement('meta'); el.setAttribute(attr, prop); document.head.appendChild(el) }
                              el.content = content
                        }
                        setMeta('og:title', document.title)
                        setMeta('og:description', normalised.metaDescription?.trim() || '')
                        setMeta('og:url', canonical)
                        setMeta('og:type', 'article')

                  } catch {
                        setNotFound(true)
                  } finally {
                        setLoading(false)
                  }
            }

            load()
      }, [slug, navigate])

      const handleShare = () => {
            const url = window.location.href
            if (navigator.share) {
                  navigator.share({ title: post?.title || 'Post', url })
            } else {
                  navigator.clipboard?.writeText(url).then(() => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2500)
                  })
            }
      }

      const fmtDate = (d) =>
            d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null

      // ── Loading ───────────────────────────────────────────────────────────────
      if (loading) {
            return (
                  <div className="min-h-[50vh] flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                  </div>
            )
      }

      // ── Not found ─────────────────────────────────────────────────────────────
      if (notFound) {
            return (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Post Not Found</h2>
                        <p className="text-gray-500 mb-6 text-sm">This post may have been removed or unpublished.</p>
                        <button
                              onClick={() => navigate(-1)}
                              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                              ← Go Back
                        </button>
                  </div>
            )
      }

      if (!post) return null

      const back = CAT_BACK[post.category] || '/'

      const hasContent = (() => {
            if (!post.contentBlocks) return false
            try {
                  const p = JSON.parse(post.contentBlocks)
                  if (p.rawHtml) return p.rawHtml.trim().length > 0
                  return (p.blocks || []).length > 0
            } catch { return false }
      })()

      const hasLegacyDesc = !hasContent && !!post.description?.trim()

      return (
            // Two-column layout: article + sidebar
            // On mobile: stacked (article first, sidebar below)
            // On desktop: side-by-side (article takes remaining space, sidebar fixed width)
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start pb-12">

                  {/* ── MAIN ARTICLE ─────────────────────────────────────────────────── */}
                  <article className="flex-1 min-w-0 space-y-6">

                        {/* Back link */}
                        <Link
                              to={back}
                              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                              <ArrowLeft size={15} /> Back
                        </Link>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                              {post.title}
                        </h1>

                        <div className="border-t border-gray-100" />

                        {/* Content */}
                        {hasContent && (
                              <div className="bg-white rounded-xl border border-gray-100 p-6">
                                    <ContentRenderer contentBlocks={post.contentBlocks} />
                              </div>
                        )}

                        {hasLegacyDesc && (
                              <div className="bg-white rounded-xl border border-gray-100 p-6">
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                          {post.description}
                                    </p>
                              </div>
                        )}

                        {!hasContent && !hasLegacyDesc && (
                              <p className="text-gray-400 text-sm italic">No content available for this post.</p>
                        )}

                        {/* Footer bar: Share + Posted by */}
                        <div className="border-t border-gray-100 pt-5 flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <UserCircle2 size={18} className="text-gray-400 flex-shrink-0" />
                                    <span>
                                          Posted by{' '}
                                          <span className="font-semibold text-gray-700">{post.createdByName || 'Admin'}</span>
                                          {post.createdAt && (
                                                <span className="text-gray-400 ml-1 font-normal">· {fmtDate(post.createdAt)}</span>
                                          )}
                                    </span>
                              </div>

                              <button
                                    onClick={handleShare}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${copied
                                                ? 'bg-green-50 border-green-300 text-green-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                          }`}
                              >
                                    {copied
                                          ? <><Check size={15} className="text-green-600" /> Link Copied!</>
                                          : <><Share2 size={15} /> Share</>
                                    }
                              </button>
                        </div>

                        {/* Latest Jobs — mobile only (appears below article on small screens) */}
                        <div className="lg:hidden">
                              <LatestJobsSidebar currentPostId={post.id} />
                        </div>

                  </article>

                  {/* ── SIDEBAR — desktop only ────────────────────────────────────────── */}
                  <div className="hidden lg:block">
                        <LatestJobsSidebar currentPostId={post.id} />
                  </div>

            </div>
      )
}

export default PostDetail
