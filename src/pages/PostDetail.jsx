// PostDetail.jsx — SEO-friendly slug URLs with ID backward compatibility
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchPost, fetchPostBySlug, fetchPostsByType, normaliseJob, CATEGORY_TO_TYPE } from '../services/api.js'
import { recordView } from './Home'
import ContentRenderer from '../components/ContentRenderer.jsx'
import { AlertCircle, ArrowLeft, Loader2, Share2, Check, UserCircle2, Sparkles, ArrowRight } from 'lucide-react'

const CAT_BACK = {
      GOVERNMENT_JOB: '/government-jobs',
      PRIVATE_JOB: '/private-jobs',
      INTERNSHIP: '/internships',
      TIME_TABLE: '/time-table',
      RESULT: '/results',
      ADMIT_CARD: '/admit-cards',
}

const CAT_NAMES = {
      GOVERNMENT_JOB: 'Government Jobs',
      PRIVATE_JOB: 'Private Jobs',
      INTERNSHIP: 'Internships',
      TIME_TABLE: 'Time Table',
      RESULT: 'Results',
      ADMIT_CARD: 'Admit Cards',
}

/** A cuid looks like: c + 24 alphanumeric chars, no hyphens in specific positions */
const isCuid = (s) => /^c[a-z0-9]{20,30}$/.test(s)

const PostDetail = () => {
      const { slug } = useParams()
      const navigate = useNavigate()
      const [post, setPost] = useState(null)
      const [notFound, setNotFound] = useState(false)
      const [loading, setLoading] = useState(true)
      const [copied, setCopied] = useState(false)
      const [latestJobs, setLatestJobs] = useState([])

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
                                    // Redirect to canonical slug URL
                                    navigate(`/posts/${job.slug}`, { replace: true })
                                    return
                              }
                        } else {
                              // New-style slug URL — load by slug
                              const res = await fetchPostBySlug(slug)
                              job = res?.data
                        }

                        if (!job || job.status !== 'PUBLISHED') {
                              setNotFound(true)
                              return
                        }

                        const normalised = normaliseJob(job)
                        setPost(normalised)
                        recordView(normalised.id)

                        // ── SEO head tags ────────────────────────────────────
                        const canonical = `${window.location.origin}/posts/${normalised.slug}`

                        // <title>
                        document.title = normalised.seoTitle?.trim()
                              ? normalised.seoTitle.trim()
                              : `${normalised.title} | RozgarGrid AI`

                        // <link rel="canonical">
                        let linkEl = document.querySelector('link[rel="canonical"]')
                        if (!linkEl) {
                              linkEl = document.createElement('link')
                              linkEl.rel = 'canonical'
                              document.head.appendChild(linkEl)
                        }
                        linkEl.href = canonical

                        // <meta name="description">
                        let metaDesc = document.querySelector('meta[name="description"]')
                        if (!metaDesc) {
                              metaDesc = document.createElement('meta')
                              metaDesc.name = 'description'
                              document.head.appendChild(metaDesc)
                        }
                        metaDesc.content = normalised.metaDescription?.trim() || ''

                        // Open Graph tags (bonus — same data)
                        const setMeta = (prop, content, attr = 'property') => {
                              let el = document.querySelector(`meta[${attr}="${prop}"]`)
                              if (!el) {
                                    el = document.createElement('meta')
                                    el.setAttribute(attr, prop)
                                    document.head.appendChild(el)
                              }
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

      // Fetch latest jobs for the sidebar
      useEffect(() => {
            const type = post?.category ? (CATEGORY_TO_TYPE[post.category] || 'GOVERNMENT') : 'GOVERNMENT'
            fetchPostsByType(type, { limit: 8, status: 'PUBLISHED' })
                  .then((res) => {
                        const items = (res.data || [])
                              .map(normaliseJob)
                              .filter((j) => j.id !== post?.id)
                              .slice(0, 5)
                        setLatestJobs(items)
                  })
                  .catch(() => setLatestJobs([]))
      }, [post?.category, post?.id])

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

      if (loading) {
            return (
                  <div className="min-h-[50vh] flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                  </div>
            )
      }

      if (notFound) {
            return (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Post Not Found</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                              This post may have been removed or unpublished.
                        </p>
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

      const fmtDate = (d) =>
            d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null

      return (
            /* Outer wrapper uses wide layout with responsive 2-column article + sidebar.
               Main article has comfortable reading width, sidebar fills the right side. */
            <div className="w-full pb-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* ── Main Article Column ── */}
                        <article className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-6">
                              {/* Back link */}
                              <Link
                                    to={back}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                              >
                                    <ArrowLeft size={16} /> Back to {CAT_NAMES[post.category] || 'Jobs'}
                              </Link>

                              {/* Title & Metadata Header */}
                              <div className="space-y-3">
                                    {post.category && (
                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                {CAT_NAMES[post.category] || post.category}
                                          </span>
                                    )}
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                                          {post.title}
                                    </h1>
                                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 flex-wrap">
                                          <span className="flex items-center gap-1.5">
                                                <UserCircle2 size={16} className="text-slate-400" />
                                                {post.createdByName || 'Admin'}
                                          </span>
                                          {post.createdAt && (
                                                <span>· {fmtDate(post.createdAt)}</span>
                                          )}
                                    </div>
                              </div>

                              <div className="border-t border-slate-200/80" />

                              {/* Content */}
                              {hasContent && (
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                                          <ContentRenderer contentBlocks={post.contentBlocks} />
                                    </div>
                              )}

                              {hasLegacyDesc && (
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                                          <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                                {post.description}
                                          </p>
                                    </div>
                              )}

                              {!hasContent && !hasLegacyDesc && (
                                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                          <p className="text-slate-400 text-sm italic">No content available for this post.</p>
                                    </div>
                              )}

                              {/* ── Footer bar: Share + Posted by ── */}
                              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                          <UserCircle2 size={18} className="text-slate-400 flex-shrink-0" />
                                          <span>
                                                Posted by{' '}
                                                <span className="font-semibold text-slate-800">
                                                      {post.createdByName || 'Admin'}
                                                </span>
                                                {post.createdAt && (
                                                      <span className="text-slate-400 ml-1 font-normal">
                                                            · {fmtDate(post.createdAt)}
                                                      </span>
                                                )}
                                          </span>
                                    </div>

                                    <button
                                          onClick={handleShare}
                                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${copied
                                                ? 'bg-green-50 border-green-300 text-green-700'
                                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                                                }`}
                                    >
                                          {copied ? (
                                                <>
                                                      <Check size={16} className="text-green-600" />
                                                      Link Copied!
                                                </>
                                          ) : (
                                                <>
                                                      <Share2 size={16} />
                                                      Share Post
                                                </>
                                          )}
                                    </button>
                              </div>
                        </article>

                        {/* ── Sidebar Column ── */}
                        <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-6">
                              {/* Latest Opportunities Sidebar Card */}
                              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                                          <div className="flex items-center gap-2">
                                                <Sparkles size={16} className="text-blue-600" />
                                                <h2 className="font-bold text-slate-800 text-sm">Latest Jobs</h2>
                                          </div>
                                          <Link
                                                to={back}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                          >
                                                View all
                                          </Link>
                                    </div>
                                    {latestJobs.length > 0 ? (
                                          <div className="space-y-3">
                                                {latestJobs.map((item) => (
                                                      <Link
                                                            key={item.id}
                                                            to={`/posts/${item.slug || item.id}`}
                                                            className="block p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-150 group"
                                                      >
                                                            <h3 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                  {item.title}
                                                            </h3>
                                                            {item.organization && (
                                                                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                                                                        {item.organization}
                                                                  </p>
                                                            )}
                                                      </Link>
                                                ))}
                                          </div>
                                    ) : (
                                          <p className="text-xs text-slate-400 py-2">Check back soon for new opportunities.</p>
                                    )}
                              </div>

                              {/* Explore Categories Sidebar Card */}
                              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                                    <h2 className="font-bold text-slate-800 text-sm mb-3">Explore Categories</h2>
                                    <div className="space-y-1">
                                          {Object.entries(CAT_BACK).map(([catKey, path]) => (
                                                <Link
                                                      key={catKey}
                                                      to={path}
                                                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                                                >
                                                      <span>{CAT_NAMES[catKey] || catKey}</span>
                                                      <ArrowRight size={13} className="text-slate-400" />
                                                </Link>
                                          ))}
                                    </div>
                              </div>
                        </aside>

                  </div>
            </div>
      )
}

export default PostDetail
