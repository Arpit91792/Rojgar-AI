/**
 * AdminPostForm — Clean post editor with live preview + SEO slug + SEO settings.
 * Includes Render free-tier cold-start handling via wakeServer().
 */
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { adminGetPost, parseJobToForm } from '../../services/api.js'
import * as postService from '../../services/postService'
import { wakeServer } from '../../services/wakeServer.js'
import ContentBuilder from '../../components/admin/ContentBuilder.jsx'
import ContentRenderer from '../../components/ContentRenderer.jsx'
import { AlertCircle, Loader2, Eye, EyeOff, Link2, Search, X, Wifi } from 'lucide-react'

// ── Category derived from URL path ─────────────────────────────────────────
const PATH_TO_CATEGORY = {
      'government-jobs': postService.CATEGORIES?.GOVERNMENT_JOB || 'GOVERNMENT_JOB',
      'private-jobs': postService.CATEGORIES?.PRIVATE_JOB || 'PRIVATE_JOB',
      'internships': postService.CATEGORIES?.INTERNSHIP || 'INTERNSHIP',
      'time-table': postService.CATEGORIES?.TIME_TABLE || 'TIME_TABLE',
      'results': postService.CATEGORIES?.RESULT || 'RESULT',
      'admit-cards': postService.CATEGORIES?.ADMIT_CARD || 'ADMIT_CARD',
}

/** Mirror of server-side slug generator */
function generateSlug(title) {
      return title
            .toString()
            .toLowerCase()
            .trim()
            .replace(/&/g, 'and')
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-{2,}/g, '-')
            .replace(/^-+|-+$/g, '')
}

// ── Character counter ───────────────────────────────────────────────────────
const CharCount = ({ value, max }) => {
      const len = (value || '').length
      const pct = len / max
      const color =
            pct >= 1 ? 'text-red-600' :
                  pct >= 0.85 ? 'text-amber-500' :
                        'text-gray-400'
      return (
            <span className={`text-xs tabular-nums ${color}`}>
                  {len} / {max}
            </span>
      )
}

// ── Tag-style secondary-keywords input ─────────────────────────────────────
const TagInput = ({ value, onChange }) => {
      const [input, setInput] = useState('')

      // Parse comma-separated string → array of tags
      const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []

      const addTag = (raw) => {
            const newTag = raw.trim()
            if (!newTag) return
            if (!tags.includes(newTag)) {
                  const updated = [...tags, newTag].join(', ')
                  onChange(updated)
            }
            setInput('')
      }

      const removeTag = (tag) => {
            const updated = tags.filter(t => t !== tag).join(', ')
            onChange(updated)
      }

      const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(input)
            } else if (e.key === 'Backspace' && !input && tags.length) {
                  removeTag(tags[tags.length - 1])
            }
      }

      return (
            <div className="flex flex-wrap gap-1.5 items-center min-h-[38px] bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                  {tags.map(tag => (
                        <span
                              key={tag}
                              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-md"
                        >
                              {tag}
                              <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-blue-900 transition-colors"
                                    aria-label={`Remove keyword ${tag}`}
                              >
                                    <X size={11} />
                              </button>
                        </span>
                  ))}
                  <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => addTag(input)}
                        placeholder={tags.length === 0 ? 'Type keyword and press Enter or comma…' : ''}
                        className="flex-1 min-w-[160px] text-sm text-gray-700 bg-transparent outline-none border-none py-0.5"
                  />
            </div>
      )
}

// ── SEO score preview pill ──────────────────────────────────────────────────
const SeoScorePill = ({ seoTitle, metaDescription, primaryKeyword, slug }) => {
      let score = 0
      if (seoTitle?.trim()) score += 25
      if (metaDescription?.trim()) score += 25
      if (primaryKeyword?.trim()) score += 25
      if (slug?.trim()) score += 25

      const label =
            score >= 100 ? 'Great' :
                  score >= 75 ? 'Good' :
                        score >= 50 ? 'Okay' :
                              score >= 25 ? 'Basic' : 'Missing'

      const color =
            score >= 100 ? 'bg-green-100 text-green-700 border-green-200' :
                  score >= 75 ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        score >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-red-100 text-red-600 border-red-200'

      return (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
                  <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: 'currentColor', opacity: 0.7 }}
                  />
                  SEO: {label} ({score}%)
            </span>
      )
}

// ═══════════════════════════════════════════════════════════════════════════
const AdminPostForm = ({ pathSegment, postId }) => {
      const navigate = useNavigate()
      const { createPost, updatePost } = useData()

      const category = PATH_TO_CATEGORY[pathSegment] || 'GOVERNMENT_JOB'
      const isEdit = !!postId

      // ── core fields
      const [title, setTitle] = useState('')
      const [slug, setSlug] = useState('')
      const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
      const [contentHtml, setContent] = useState('')

      // ── SEO fields
      const [seoTitle, setSeoTitle] = useState('')
      const [metaDescription, setMetaDescription] = useState('')
      const [primaryKeyword, setPrimaryKeyword] = useState('')
      const [secondaryKeywords, setSecondaryKeywords] = useState('')

      // ── UI state
      const [showPreview, setShowPreview] = useState(false)
      const [seoOpen, setSeoOpen] = useState(true)
      const [submitting, setSubmitting] = useState(false)
      const [waking, setWaking] = useState(false)        // true while pinging /health
      const [wakingMsg, setWakingMsg] = useState('')     // "Waking server…" status text
      const [loadingPost, setLoadingPost] = useState(false)
      const [error, setError] = useState('')
      const [success, setSuccess] = useState('')

      const originalSlugRef = useRef(null)

      // ── Load existing post when editing ───────────────────────────────────
      useEffect(() => {
            if (!isEdit) return
            setLoadingPost(true)
            adminGetPost(postId)
                  .then((res) => {
                        const parsed = parseJobToForm(res.data)
                        setTitle(parsed.title || '')

                        const existingSlug = res.data?.slug || ''
                        setSlug(existingSlug)
                        originalSlugRef.current = existingSlug
                        if (existingSlug) setSlugManuallyEdited(true)

                        const raw = parsed.contentBlocks || ''
                        try {
                              const obj = JSON.parse(raw)
                              setContent(obj?.rawHtml || '')
                        } catch {
                              setContent(raw)
                        }

                        // SEO fields
                        setSeoTitle(res.data?.seoTitle || '')
                        setMetaDescription(res.data?.metaDescription || '')
                        setPrimaryKeyword(res.data?.primaryKeyword || '')
                        setSecondaryKeywords(res.data?.secondaryKeywords || '')
                  })
                  .catch(() => setError('Post not found or failed to load.'))
                  .finally(() => setLoadingPost(false))
      }, [postId, isEdit])

      // ── Title → auto-slug ─────────────────────────────────────────────────
      const handleTitleChange = (e) => {
            const v = e.target.value
            setTitle(v)
            if (!slugManuallyEdited) setSlug(generateSlug(v))
      }

      const handleSlugChange = (e) => {
            setSlug(e.target.value)
            setSlugManuallyEdited(true)
      }
      const handleSlugBlur = () => setSlug(generateSlug(slug))
      const handleResetSlug = () => {
            setSlug(generateSlug(title))
            setSlugManuallyEdited(false)
      }

      // ── Submit ────────────────────────────────────────────────────────────
      const handleSubmit = async (status) => {
            setError('')
            setSuccess('')
            if (!title.trim()) { setError('Title is required.'); return }
            if (!slug.trim()) { setError('Slug is required — it is auto-generated from the title.'); return }

            // Prevent duplicate clicks while waking or submitting
            if (submitting || waking) return

            setSubmitting(true)
            setWaking(false)
            setWakingMsg('')

            try {
                  // ── Step 1: Wake the Render backend ──────────────────────
                  // No-op when server is already up (responds in <1 s).
                  // When sleeping, retries up to 6× every 10 s (60 s max).
                  await wakeServer({
                        onWaking: (attempt, max) => {
                              setWaking(true)
                              setWakingMsg(`Waking server, please wait… (${attempt}/${max})`)
                        },
                        onAwake: () => {
                              setWaking(false)
                              setWakingMsg('')
                        },
                  })

                  // ── Step 2: Save / publish the post ──────────────────────
                  const payload = {
                        title: title.trim(),
                        slug: slug.trim(),
                        category,
                        status,
                        contentBlocks: JSON.stringify({ rawHtml: contentHtml }),
                        // SEO
                        seoTitle: seoTitle.trim() || undefined,
                        metaDescription: metaDescription.trim() || undefined,
                        primaryKeyword: primaryKeyword.trim() || undefined,
                        secondaryKeywords: secondaryKeywords.trim() || undefined,
                  }
                  if (isEdit) {
                        await updatePost(postId, payload)
                  } else {
                        await createPost(payload)
                  }
                  setSuccess(status === 'PUBLISHED' ? 'Post published!' : 'Draft saved!')
                  setTimeout(() => navigate(`/admin/${pathSegment}`), 1000)
            } catch (err) {
                  // Never logout on network/timeout/5xx errors.
                  // The adminApi interceptor already handles 401 only.
                  const msg = err?.response?.data?.message || err?.message || 'Save failed. Please try again.'
                  setError(msg)
            } finally {
                  setSubmitting(false)
                  setWaking(false)
                  setWakingMsg('')
            }
      }

      if (loadingPost) {
            return (
                  <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                  </div>
            )
      }

      const previewBlocks = JSON.stringify({ rawHtml: contentHtml })

      return (
            <div className="max-w-7xl mx-auto space-y-4 pb-10">

                  {/* ── Top bar ── */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h2 className="text-xl font-bold text-gray-900">
                              {isEdit ? 'Edit Post' : 'New Post'}
                              <span className="ml-2 text-sm font-normal text-gray-400">
                                    {category.replace(/_/g, ' ')}
                              </span>
                        </h2>
                        <button
                              type="button"
                              onClick={() => setShowPreview(p => !p)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${showPreview
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                        >
                              {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                              {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                  </div>

                  {/* Alerts */}
                  {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                              <span>{error}</span>
                        </div>
                  )}
                  {success && (
                        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                              <span>✅ {success}</span>
                        </div>
                  )}

                  {/* ── Render cold-start waking banner ── */}
                  {waking && (
                        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
                              <Wifi size={16} className="flex-shrink-0 animate-pulse text-amber-600" />
                              <span className="font-medium">{wakingMsg || 'Waking server, please wait…'}</span>
                              <Loader2 size={14} className="ml-auto animate-spin text-amber-600 flex-shrink-0" />
                        </div>
                  )}

                  {/* ── Editor + Preview layout ── */}
                  <div className={`grid gap-6 ${showPreview ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>

                        {/* ── EDITOR COLUMN ── */}
                        <div className="space-y-4">

                              {/* Title */}
                              <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Post title..."
                                    className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent py-2"
                              />

                              {/* Slug field */}
                              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                    <Link2 size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-400 whitespace-nowrap">rozgargrid-ai.vercel.app/posts/</span>
                                    <input
                                          type="text"
                                          value={slug}
                                          onChange={handleSlugChange}
                                          onBlur={handleSlugBlur}
                                          placeholder="post-slug"
                                          className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none font-mono min-w-0"
                                          aria-label="SEO URL slug"
                                    />
                                    {slugManuallyEdited && (
                                          <button
                                                type="button"
                                                onClick={handleResetSlug}
                                                className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap flex-shrink-0"
                                                title="Reset slug from title"
                                          >
                                                Reset
                                          </button>
                                    )}
                              </div>
                              <p className="text-xs text-gray-400 -mt-2 pl-1">
                                    URL slug — auto-generated from title. You can edit it manually.
                              </p>

                              <div className="border-t border-gray-100" />

                              {/* Rich text editor */}
                              <ContentBuilder value={contentHtml} onChange={setContent} />

                              {/* ══════════════════════════════════════════════════════
                                  SEO SETTINGS — sits between editor and action bar
                              ══════════════════════════════════════════════════════ */}
                              <div className="border border-gray-200 rounded-xl overflow-hidden">

                                    {/* Collapsible header */}
                                    <button
                                          type="button"
                                          onClick={() => setSeoOpen(o => !o)}
                                          className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                          aria-expanded={seoOpen}
                                    >
                                          <div className="flex items-center gap-2.5">
                                                <Search size={15} className="text-gray-500" />
                                                <span className="text-sm font-semibold text-gray-700">SEO Settings</span>
                                                <SeoScorePill
                                                      seoTitle={seoTitle}
                                                      metaDescription={metaDescription}
                                                      primaryKeyword={primaryKeyword}
                                                      slug={slug}
                                                />
                                          </div>
                                          <span className="text-gray-400 text-lg leading-none select-none">
                                                {seoOpen ? '−' : '+'}
                                          </span>
                                    </button>

                                    {seoOpen && (
                                          <div className="px-5 py-5 space-y-5 bg-white">

                                                {/* ── SEO Title ── */}
                                                <div>
                                                      <div className="flex items-center justify-between mb-1.5">
                                                            <label className="text-sm font-medium text-gray-700">
                                                                  SEO Title
                                                            </label>
                                                            <CharCount value={seoTitle} max={60} />
                                                      </div>
                                                      <input
                                                            type="text"
                                                            value={seoTitle}
                                                            onChange={e => setSeoTitle(e.target.value)}
                                                            maxLength={60}
                                                            placeholder="India Post GDS Recruitment 2026 – 23,757 Posts, Apply Online"
                                                            className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-300"
                                                      />
                                                      <p className="mt-1 text-xs text-gray-400">
                                                            Used as the browser tab title and Google search headline. Keep it under 60 characters.
                                                      </p>

                                                      {/* Google SERP preview */}
                                                      {(seoTitle || title) && (
                                                            <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                                                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                                                                        Search result preview
                                                                  </p>
                                                                  <p className="text-[#1a0dab] text-base font-medium leading-snug truncate hover:underline cursor-pointer">
                                                                        {seoTitle || title}
                                                                  </p>
                                                                  <p className="text-[#006621] text-xs mt-0.5 truncate">
                                                                        rozgargrid-ai.vercel.app/posts/{slug || 'post-slug'}
                                                                  </p>
                                                                  {metaDescription && (
                                                                        <p className="text-[#545454] text-sm mt-1 leading-snug line-clamp-2">
                                                                              {metaDescription}
                                                                        </p>
                                                                  )}
                                                            </div>
                                                      )}
                                                </div>

                                                <div className="border-t border-gray-100" />

                                                {/* ── Meta Description ── */}
                                                <div>
                                                      <div className="flex items-center justify-between mb-1.5">
                                                            <label className="text-sm font-medium text-gray-700">
                                                                  Meta Description
                                                            </label>
                                                            <CharCount value={metaDescription} max={160} />
                                                      </div>
                                                      <textarea
                                                            value={metaDescription}
                                                            onChange={e => setMetaDescription(e.target.value)}
                                                            maxLength={160}
                                                            rows={3}
                                                            placeholder="India Post GDS Recruitment 2026 for 23,757 posts. Check eligibility, age limit, application fee, important dates, vacancy details, selection process and apply online."
                                                            className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none placeholder-gray-300"
                                                      />
                                                      <p className="mt-1 text-xs text-gray-400">
                                                            Shown below the title in search results. Keep it under 160 characters.
                                                      </p>
                                                </div>

                                                <div className="border-t border-gray-100" />

                                                {/* ── Primary Keyword ── */}
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                            Primary Keyword
                                                      </label>
                                                      <input
                                                            type="text"
                                                            value={primaryKeyword}
                                                            onChange={e => setPrimaryKeyword(e.target.value)}
                                                            placeholder="India Post GDS Recruitment 2026"
                                                            className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-300"
                                                      />
                                                      <p className="mt-1 text-xs text-gray-400">
                                                            The main keyword this post targets. Used for internal SEO tracking only — not added to the page HTML.
                                                      </p>
                                                </div>

                                                <div className="border-t border-gray-100" />

                                                {/* ── Secondary Keywords ── */}
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                            Secondary Keywords
                                                      </label>
                                                      <TagInput
                                                            value={secondaryKeywords}
                                                            onChange={setSecondaryKeywords}
                                                      />
                                                      <p className="mt-1.5 text-xs text-gray-400">
                                                            Type a keyword and press <kbd className="bg-gray-100 border border-gray-200 px-1 rounded text-[10px]">Enter</kbd> or <kbd className="bg-gray-100 border border-gray-200 px-1 rounded text-[10px]">,</kbd> to add. Click × to remove. Stored comma-separated; used for SEO analysis only.
                                                      </p>
                                                </div>

                                          </div>
                                    )}
                              </div>
                              {/* ══ end SEO settings ══ */}

                              {/* Action bar */}
                              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                          type="button"
                                          onClick={() => handleSubmit('DRAFT')}
                                          disabled={submitting || waking}
                                          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                          {(submitting || waking) && <Loader2 size={14} className="animate-spin" />}
                                          Save Draft
                                    </button>
                                    <button
                                          type="button"
                                          onClick={() => handleSubmit('PUBLISHED')}
                                          disabled={submitting || waking}
                                          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                          {(submitting || waking) && <Loader2 size={14} className="animate-spin" />}
                                          {waking
                                                ? 'Waking server…'
                                                : isEdit ? 'Update & Publish' : 'Publish Post'
                                          }
                                    </button>
                                    <button
                                          type="button"
                                          onClick={() => navigate(`/admin/${pathSegment}`)}
                                          disabled={submitting || waking}
                                          className="px-4 py-2.5 text-gray-500 hover:text-gray-800 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                          Cancel
                                    </button>
                              </div>
                        </div>

                        {/* ── PREVIEW COLUMN ── */}
                        {showPreview && (
                              <div className="xl:sticky xl:top-20 xl:self-start">
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                          {/* Preview header */}
                                          <div className="bg-blue-600 px-5 py-4 text-white">
                                                <p className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wide">
                                                      Live Preview — exactly what users will see
                                                </p>
                                                <h1 className="text-lg font-bold leading-tight">
                                                      {title || <span className="text-white/40 italic">Post title…</span>}
                                                </h1>
                                                {slug && (
                                                      <p className="text-xs text-blue-200 mt-1 font-mono truncate">
                                                            /posts/{slug}
                                                      </p>
                                                )}
                                          </div>

                                          {/* Preview body — uses the SAME ContentRenderer as PostDetail */}
                                          <div className="p-5 min-h-[200px]">
                                                {contentHtml ? (
                                                      <ContentRenderer contentBlocks={previewBlocks} />
                                                ) : (
                                                      <p className="text-gray-400 text-sm italic text-center py-10">
                                                            Start writing to see preview…
                                                      </p>
                                                )}
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>

            </div>
      )
}

export default AdminPostForm
