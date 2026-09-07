/**
 * AdminPostForm — Clean post editor with live preview.
 * Title field + rich-text editor + side-by-side live preview.
 */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { adminGetPost, parseJobToForm } from '../../services/api.js'
import * as postService from '../../services/postService'
import ContentBuilder from '../../components/admin/ContentBuilder.jsx'
import ContentRenderer from '../../components/ContentRenderer.jsx'
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

// ── Category derived from URL path ─────────────────────────────────────────
const PATH_TO_CATEGORY = {
      'government-jobs': postService.CATEGORIES?.GOVERNMENT_JOB || 'GOVERNMENT_JOB',
      'private-jobs': postService.CATEGORIES?.PRIVATE_JOB || 'PRIVATE_JOB',
      'internships': postService.CATEGORIES?.INTERNSHIP || 'INTERNSHIP',
      'time-table': postService.CATEGORIES?.TIME_TABLE || 'TIME_TABLE',
      'results': postService.CATEGORIES?.RESULT || 'RESULT',
      'admit-cards': postService.CATEGORIES?.ADMIT_CARD || 'ADMIT_CARD',
}

const AdminPostForm = ({ pathSegment, postId }) => {
      const navigate = useNavigate()
      const { createPost, updatePost } = useData()

      const category = PATH_TO_CATEGORY[pathSegment] || 'GOVERNMENT_JOB'
      const isEdit = !!postId

      const [title, setTitle] = useState('')
      const [contentHtml, setContent] = useState('')
      const [showPreview, setShowPreview] = useState(false)
      const [submitting, setSubmitting] = useState(false)
      const [loadingPost, setLoadingPost] = useState(false)
      const [error, setError] = useState('')
      const [success, setSuccess] = useState('')

      // Load existing post when editing
      useEffect(() => {
            if (!isEdit) return
            setLoadingPost(true)
            adminGetPost(postId)
                  .then((res) => {
                        const parsed = parseJobToForm(res.data)
                        setTitle(parsed.title || '')
                        // Support both old block JSON and raw HTML
                        const raw = parsed.contentBlocks || ''
                        try {
                              const obj = JSON.parse(raw)
                              setContent(obj?.rawHtml || '')
                        } catch {
                              setContent(raw)
                        }
                  })
                  .catch(() => setError('Post not found or failed to load.'))
                  .finally(() => setLoadingPost(false))
      }, [postId, isEdit])

      const handleSubmit = async (status) => {
            setError('')
            setSuccess('')
            if (!title.trim()) { setError('Title is required.'); return }

            setSubmitting(true)
            try {
                  const payload = {
                        title: title.trim(),
                        category,
                        status,
                        contentBlocks: JSON.stringify({ rawHtml: contentHtml }),
                  }
                  if (isEdit) {
                        await updatePost(postId, payload)
                  } else {
                        await createPost(payload)
                  }
                  setSuccess(status === 'PUBLISHED' ? 'Post published!' : 'Draft saved!')
                  setTimeout(() => navigate(`/admin/${pathSegment}`), 1000)
            } catch (err) {
                  const msg = err?.response?.data?.message || err?.message || 'Save failed. Please try again.'
                  setError(msg)
            } finally {
                  setSubmitting(false)
            }
      }

      if (loadingPost) {
            return (
                  <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                  </div>
            )
      }

      // The preview content JSON — same format stored in DB and shown to users
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

                  {/* ── Editor + Preview layout ── */}
                  <div className={`grid gap-6 ${showPreview ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>

                        {/* ── EDITOR COLUMN ── */}
                        <div className="space-y-4">
                              {/* Title */}
                              <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Post title..."
                                    className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent py-2"
                              />
                              <div className="border-t border-gray-100" />

                              {/* Rich text editor */}
                              <ContentBuilder value={contentHtml} onChange={setContent} />

                              {/* Action bar */}
                              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                          type="button"
                                          onClick={() => handleSubmit('DRAFT')}
                                          disabled={submitting}
                                          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                                    >
                                          {submitting && <Loader2 size={14} className="animate-spin" />}
                                          Save Draft
                                    </button>
                                    <button
                                          type="button"
                                          onClick={() => handleSubmit('PUBLISHED')}
                                          disabled={submitting}
                                          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                                    >
                                          {submitting && <Loader2 size={14} className="animate-spin" />}
                                          {isEdit ? 'Update & Publish' : 'Publish Post'}
                                    </button>
                                    <button
                                          type="button"
                                          onClick={() => navigate(`/admin/${pathSegment}`)}
                                          className="px-4 py-2.5 text-gray-500 hover:text-gray-800 text-sm font-medium"
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
