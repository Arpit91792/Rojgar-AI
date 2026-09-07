/**
 * AdminPostForm — Minimal post editor.
 * Just a title field and a full rich-text editor.
 * No category/status/structured fields — clean writing experience.
 */
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { adminGetPost, parseJobToForm } from '../../services/api.js'
import * as postService from '../../services/postService'
import ContentBuilder from '../../components/admin/ContentBuilder.jsx'
import { AlertCircle, Loader2 } from 'lucide-react'

// ── Category derived from URL path ─────────────────────────────────────────
const PATH_TO_CATEGORY = {
      'government-jobs': postService.CATEGORIES?.GOVERNMENT_JOB || 'GOVERNMENT_JOB',
      'private-jobs': postService.CATEGORIES?.PRIVATE_JOB || 'PRIVATE_JOB',
      'internships': postService.CATEGORIES?.INTERNSHIP || 'INTERNSHIP',
      'time-table': postService.CATEGORIES?.TIME_TABLE || 'TIME_TABLE',
      'results': postService.CATEGORIES?.RESULT || 'RESULT',
      'admit-cards': postService.CATEGORIES?.ADMIT_CARD || 'ADMIT_CARD',
}

// ══════════════════════════════════════════════════════════════════════════════
// AdminPostForm
// ══════════════════════════════════════════════════════════════════════════════
const AdminPostForm = ({ pathSegment, postId }) => {
      const navigate = useNavigate()
      const { createPost, updatePost } = useData()

      const category = PATH_TO_CATEGORY[pathSegment] || 'GOVERNMENT_JOB'
      const isEdit = !!postId

      const [title, setTitle] = useState('')
      const [contentBlocks, setContent] = useState('')
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
                              // If it's the old blocks format, flatten to empty so editor is blank
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
                        // Store raw HTML in contentBlocks as JSON wrapper for compatibility
                        contentBlocks: JSON.stringify({ rawHtml: contentBlocks }),
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

      return (
            <div className="max-w-4xl mx-auto space-y-5 pb-10">

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
                  <ContentBuilder
                        value={contentBlocks}
                        onChange={setContent}
                  />

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
      )
}

export default AdminPostForm
