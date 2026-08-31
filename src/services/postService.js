// ─────────────────────────────────────────────────────────────────────────────
// postService.js  — Service abstraction layer
//
// DEVELOPMENT ONLY
// Currently delegates to storageService (localStorage).
//
// FUTURE MIGRATION — to connect PostgreSQL, replace each function body with
// the corresponding API call, e.g.:
//
//   export const getPosts = (category) =>
//     adminApi.get('/api/jobs', { params: { category } }).then(r => r.data)
//
// The UI never imports storageService directly — only postService.
// ─────────────────────────────────────────────────────────────────────────────

import * as storage from './storageService'

export const CATEGORIES = {
  GOVERNMENT_JOB: 'GOVERNMENT_JOB',
  PRIVATE_JOB:    'PRIVATE_JOB',
  INTERNSHIP:     'INTERNSHIP',
  TIME_TABLE:     'TIME_TABLE',
  RESULT:         'RESULT',
  ADMIT_CARD:     'ADMIT_CARD',
}

export const STATUSES = {
  DRAFT:     'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED:  'ARCHIVED',
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** All posts (admin use) */
export const getPosts = () => storage.getPosts()

/** Single post by id */
export const getPostById = (id) => storage.getPostById(id)

/** Single post by slug */
export const getPostBySlug = (slug) => storage.getPostBySlug(slug)

/**
 * Posts by category.
 * Public pages pass status='PUBLISHED'; admin passes null to get all.
 */
export const getPostsByCategory = (category, status = null) =>
  storage.getPostsByCategory(category, status)

// ── Stats (admin dashboard) ────────────────────────────────────────────────────
export const getStats = () => {
  const all = storage.getPosts()
  return {
    total:          all.length,
    published:      all.filter((p) => p.status === 'PUBLISHED').length,
    drafts:         all.filter((p) => p.status === 'DRAFT').length,
    archived:       all.filter((p) => p.status === 'ARCHIVED').length,
    governmentJobs: all.filter((p) => p.category === CATEGORIES.GOVERNMENT_JOB).length,
    privateJobs:    all.filter((p) => p.category === CATEGORIES.PRIVATE_JOB).length,
    internships:    all.filter((p) => p.category === CATEGORIES.INTERNSHIP).length,
    timeTables:     all.filter((p) => p.category === CATEGORIES.TIME_TABLE).length,
    results:        all.filter((p) => p.category === CATEGORIES.RESULT).length,
    admitCards:     all.filter((p) => p.category === CATEGORIES.ADMIT_CARD).length,
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

export const createPost    = (data)        => storage.createPost(data)
export const updatePost    = (id, updates) => storage.updatePost(id, updates)
export const deletePost    = (id)          => storage.deletePost(id)
export const publishPost   = (id)          => storage.publishPost(id)
export const unpublishPost = (id)          => storage.unpublishPost(id)
export const archivePost   = (id)          => storage.archivePost(id)
