// postService.js — API-backed service layer
// All job/post data now comes from the backend API (Render + PostgreSQL).
// localStorage is NO longer used for job data.

import {
  fetchPosts,
  fetchPost,
  fetchPostsByType,
  adminGetPosts,
  adminGetPost,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  normaliseJob,
  parseJobToForm,
  buildJobPayload,
  CATEGORY_TO_TYPE,
  TYPE_TO_CATEGORY,
  statusToBackend,
  adminGetStats,
} from './api.js'

export const CATEGORIES = {
  GOVERNMENT_JOB: 'GOVERNMENT_JOB',
  PRIVATE_JOB: 'PRIVATE_JOB',
  INTERNSHIP: 'INTERNSHIP',
  TIME_TABLE: 'TIME_TABLE',
  RESULT: 'RESULT',
  ADMIT_CARD: 'ADMIT_CARD',
}

export const STATUSES = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
}

// ── Read (all return Promises) ────────────────────────────────────────────────

/** All posts — admin use (all statuses) */
export const getPosts = async () => {
  const res = await adminGetPosts({ limit: 100 })
  return (res.data || []).map(normaliseJob)
}

/** Single post by id */
export const getPostById = async (id) => {
  try {
    const res = await adminGetPost(id)
    return parseJobToForm(res.data)
  } catch {
    return null
  }
}

/** Single post by slug — backend uses id as slug */
export const getPostBySlug = async (slug) => {
  try {
    const res = await fetchPost(slug)
    if (!res.data || res.data.status !== 'PUBLISHED') return null
    return normaliseJob(res.data)
  } catch {
    return null
  }
}

/** Posts by category + optional status filter */
export const getPostsByCategory = async (category, status = null) => {
  const type = CATEGORY_TO_TYPE[category] || category
  const params = { type, limit: 100 }
  if (status) params.status = statusToBackend(status)
  else params.status = 'PUBLISHED'
  const res = await fetchPostsByType(type, params)
  return (res.data || []).map(normaliseJob)
}

/** Stats for admin dashboard */
export const getStats = async () => {
  try {
    const res = await adminGetStats()
    const d = res.data?.overview || {}
    // Also get per-type breakdown
    const breakdown = res.data?.jobDistribution || []
    const byType = {}
    breakdown.forEach((b) => { byType[b.type] = b._count })
    return {
      total: d.totalJobs || 0,
      published: d.publishedJobs || 0,
      drafts: d.draftJobs || 0,
      archived: 0,
      governmentJobs: byType['GOVERNMENT'] || 0,
      privateJobs: byType['PRIVATE'] || 0,
      internships: byType['INTERNSHIP'] || 0,
      timeTables: byType['TIME_TABLE'] || 0,
      results: byType['RESULT'] || 0,
      admitCards: byType['ADMIT_CARD'] || 0,
    }
  } catch {
    return {
      total: 0, published: 0, drafts: 0, archived: 0,
      governmentJobs: 0, privateJobs: 0, internships: 0,
      timeTables: 0, results: 0, admitCards: 0
    }
  }
}

// ── Write (all return Promises) ───────────────────────────────────────────────

export const createPost = async (formData) => {
  const payload = buildJobPayload(formData, formData.category, formData.status)
  const res = await adminCreatePost(payload)
  return normaliseJob(res.data)
}

export const updatePost = async (id, formData) => {
  const payload = buildJobPayload(formData, formData.category, formData.status)
  const res = await adminUpdatePost(id, payload)
  return normaliseJob(res.data)
}

export const deletePost = async (id) => {
  await adminDeletePost(id)
  return true
}

export const publishPost = async (id) => {
  const res = await adminUpdatePost(id, { status: 'PUBLISHED' })
  return normaliseJob(res.data)
}

export const unpublishPost = async (id) => {
  const res = await adminUpdatePost(id, { status: 'DRAFT' })
  return normaliseJob(res.data)
}

export const archivePost = async (id) => {
  const res = await adminUpdatePost(id, { status: 'UNPUBLISHED' })
  return normaliseJob(res.data)
}
