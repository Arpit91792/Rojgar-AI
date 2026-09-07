// PostDetail.jsx — shows only title + admin-written content
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchPost, normaliseJob } from '../services/api.js'
import { recordView } from './Home'
import ContentRenderer from '../components/ContentRenderer.jsx'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'

const CAT_BACK = {
      GOVERNMENT_JOB: '/government-jobs',
      PRIVATE_JOB: '/private-jobs',
      INTERNSHIP: '/internships',
      TIME_TABLE: '/time-table',
      RESULT: '/results',
      ADMIT_CARD: '/admit-cards',
}

const PostDetail = () => {
      const { slug } = useParams()
      const navigate = useNavigate()
      const [post, setPost] = useState(null)
      const [notFound, setNotFound] = useState(false)
      const [loading, setLoading] = useState(true)

      useEffect(() => {
            setLoading(true)
            setNotFound(false)
            setPost(null)

            fetchPost(slug)
                  .then((res) => {
                        const job = res.data
                        if (!job || job.status !== 'PUBLISHED') {
                              setNotFound(true)
                        } else {
                              const normalised = normaliseJob(job)
                              setPost(normalised)
                              recordView(normalised.id)
                        }
                  })
                  .catch(() => setNotFound(true))
                  .finally(() => setLoading(false))
      }, [slug])

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

      // Determine if there is actual content to render
      const hasContent = (() => {
            if (!post.contentBlocks) return false
            try {
                  const p = JSON.parse(post.contentBlocks)
                  if (p.rawHtml) return p.rawHtml.trim().length > 0
                  return (p.blocks || []).length > 0
            } catch {
                  return false
            }
      })()

      const hasLegacyDesc = !hasContent && !!post.description?.trim()

      return (
            <div className="max-w-3xl mx-auto pb-12 space-y-6">

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

                  {/* Admin-written content — exactly what was typed */}
                  {hasContent && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                              <ContentRenderer contentBlocks={post.contentBlocks} />
                        </div>
                  )}

                  {/* Legacy plain-text description fallback */}
                  {hasLegacyDesc && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                    {post.description}
                              </p>
                        </div>
                  )}

                  {/* Nothing written yet */}
                  {!hasContent && !hasLegacyDesc && (
                        <p className="text-gray-400 text-sm italic">No content available for this post.</p>
                  )}

            </div>
      )
}

export default PostDetail
