import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Public API instance ───────────────────────────────────────────────────────
const api = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
})

// ── Admin API instance ────────────────────────────────────────────────────────
export const adminApi = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every admin request
adminApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
})

// On 401 → clear token + redirect to admin login
// IMPORTANT: Only trigger logout on an explicit HTTP 401 from the server.
// Network errors, 500/502/503/504 (Render cold-start), and timeouts must
// NOT clear the token — the admin should stay logged in.
adminApi.interceptors.response.use(
      (res) => res,
      (err) => {
            // err.response is undefined for network errors / timeouts
            if (err.response?.status === 401) {
                  localStorage.removeItem('admin_token')
                  window.location.href = '/admin'
            }
            return Promise.reject(err)
      }
)

// ── Category ↔ Type mapping ───────────────────────────────────────────────────
// Frontend uses GOVERNMENT_JOB etc.; backend uses GOVERNMENT etc.
export const CATEGORY_TO_TYPE = {
      GOVERNMENT_JOB: 'GOVERNMENT',
      PRIVATE_JOB: 'PRIVATE',
      INTERNSHIP: 'INTERNSHIP',
      TIME_TABLE: 'TIME_TABLE',
      RESULT: 'RESULT',
      ADMIT_CARD: 'ADMIT_CARD',
}

export const TYPE_TO_CATEGORY = Object.fromEntries(
      Object.entries(CATEGORY_TO_TYPE).map(([k, v]) => [v, k])
)

// ── Status mapping ────────────────────────────────────────────────────────────
// Frontend: DRAFT | PUBLISHED | ARCHIVED
// Backend:  DRAFT | PUBLISHED | UNPUBLISHED | EXPIRED
export const statusToBackend = (s) => {
      if (s === 'ARCHIVED') return 'UNPUBLISHED'
      return s || 'DRAFT'
}
export const statusToFrontend = (s) => {
      if (s === 'UNPUBLISHED' || s === 'EXPIRED') return 'ARCHIVED'
      return s || 'DRAFT'
}

// ── Normalise a backend job to the shape the frontend expects ─────────────────
export const normaliseJob = (job) => {
      if (!job) return null
      return {
            // Identity
            id: job.id,
            slug: job.slug || job.id,   // prefer real slug, fall back to id for old posts
            // Display fields
            title: job.title,
            category: TYPE_TO_CATEGORY[job.type] || job.type,
            organization: job.organization,
            department: job.department || '',
            location: job.location || '',
            qualification: job.qualification || '',
            ageLimit: job.ageLimit || '',
            salary: job.salary || '',
            vacancies: job.vacancies || '',
            description: job.description || '',
            selectionProcess: job.selectionProcess || '',
            officialWebsite: job.officialWebsite || '',
            applyLink: job.applyLink || '',
            // Dates
            applicationStartDate: job.applicationStart || '',
            lastDate: job.lastDate ? job.lastDate.slice(0, 10) : '',
            examDate: job.examDate ? job.examDate.slice(0, 10) : '',
            // Content blocks (new flexible content system)
            contentBlocks: job.contentBlocks || '{"blocks":[]}',
            // Status
            status: statusToFrontend(job.status),
            // Meta
            isFeatured: job.isFeatured || false,
            views: job.views || 0,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            publishedAt: job.publishedAt,
            // Author
            createdByName: job.createdByName || null,
            // SEO
            seoTitle: job.seoTitle || '',
            metaDescription: job.metaDescription || '',
            primaryKeyword: job.primaryKeyword || '',
            secondaryKeywords: job.secondaryKeywords || '',
      }
}

// ── Build backend payload from frontend form data ────────────────────────────
export const buildJobPayload = (formData, category, status) => {
      const type = CATEGORY_TO_TYPE[category] || category
      // Merge extra fields not in schema into description
      const extraFields = []
      if (formData.skills) extraFields.push(`Skills: ${formData.skills}`)
      if (formData.jobType) extraFields.push(`Job Type: ${formData.jobType}`)
      if (formData.workMode) extraFields.push(`Work Mode: ${formData.workMode}`)
      if (formData.experience) extraFields.push(`Experience: ${formData.experience}`)
      if (formData.stipend) extraFields.push(`Stipend: ${formData.stipend}`)
      if (formData.duration) extraFields.push(`Duration: ${formData.duration}`)
      if (formData.eligibility) extraFields.push(`Eligibility: ${formData.eligibility}`)
      if (formData.course) extraFields.push(`Course: ${formData.course}`)
      if (formData.semester) extraFields.push(`Semester: ${formData.semester}`)
      if (formData.subject) extraFields.push(`Subject: ${formData.subject}`)
      if (formData.examName) extraFields.push(`Exam Name: ${formData.examName}`)
      if (formData.startTime) extraFields.push(`Start Time: ${formData.startTime}`)
      if (formData.endTime) extraFields.push(`End Time: ${formData.endTime}`)
      if (formData.resultDate) extraFields.push(`Result Date: ${formData.resultDate}`)
      if (formData.releaseDate) extraFields.push(`Release Date: ${formData.releaseDate}`)
      if (formData.resultLink) extraFields.push(`Result Link: ${formData.resultLink}`)
      if (formData.downloadLink) extraFields.push(`Download Link: ${formData.downloadLink}`)
      if (formData.notificationUrl) extraFields.push(`Notification URL: ${formData.notificationUrl}`)
      if (formData.logoUrl) extraFields.push(`Logo URL: ${formData.logoUrl}`)

      const baseDescription = formData.description || ''
      const fullDescription = extraFields.length > 0
            ? baseDescription
                  ? `${baseDescription}\n\n--- Additional Info ---\n${extraFields.join('\n')}`
                  : `--- Additional Info ---\n${extraFields.join('\n')}`
            : baseDescription

      return {
            title: formData.title,
            slug: formData.slug || undefined,
            type,
            organization: formData.organization || '',
            department: formData.department || undefined,
            location: formData.location || '',
            qualification: formData.qualification || '',
            ageLimit: formData.ageLimit || undefined,
            salary: formData.salary || undefined,
            vacancies: formData.vacancies || undefined,
            selectionProcess: formData.selectionProcess || undefined,
            applicationStart: formData.applicationStartDate || undefined,
            lastDate: formData.lastDate || undefined,
            examDate: formData.examDate || undefined,
            description: fullDescription || undefined,
            officialWebsite: formData.officialWebsite || undefined,
            notificationPdf: formData.notificationUrl || undefined,
            applyLink: formData.applyLink || undefined,
            status: statusToBackend(status),
            isFeatured: formData.isFeatured || false,
            contentBlocks: formData.contentBlocks || '{"blocks":[]}',
            // SEO fields
            seoTitle: formData.seoTitle || undefined,
            metaDescription: formData.metaDescription || undefined,
            primaryKeyword: formData.primaryKeyword || undefined,
            secondaryKeywords: formData.secondaryKeywords || undefined,
      }
}

// ── Parse extra fields stored in description back to form fields ──────────────
export const parseJobToForm = (job) => {
      const base = normaliseJob(job)
      // Try to extract extra fields from description
      const extra = {}
      const desc = job.description || ''
      const marker = '--- Additional Info ---'
      const markerIdx = desc.indexOf(marker)

      let cleanDesc = desc
      if (markerIdx !== -1) {
            cleanDesc = desc.slice(0, markerIdx).trim()
            const extraSection = desc.slice(markerIdx + marker.length).trim()
            extraSection.split('\n').forEach((line) => {
                  const colonIdx = line.indexOf(':')
                  if (colonIdx === -1) return
                  const key = line.slice(0, colonIdx).trim()
                  const val = line.slice(colonIdx + 1).trim()
                  const fieldMap = {
                        'Skills': 'skills',
                        'Job Type': 'jobType',
                        'Work Mode': 'workMode',
                        'Experience': 'experience',
                        'Stipend': 'stipend',
                        'Duration': 'duration',
                        'Eligibility': 'eligibility',
                        'Course': 'course',
                        'Semester': 'semester',
                        'Subject': 'subject',
                        'Exam Name': 'examName',
                        'Start Time': 'startTime',
                        'End Time': 'endTime',
                        'Result Date': 'resultDate',
                        'Release Date': 'releaseDate',
                        'Result Link': 'resultLink',
                        'Download Link': 'downloadLink',
                        'Notification URL': 'notificationUrl',
                        'Logo URL': 'logoUrl',
                  }
                  if (fieldMap[key]) extra[fieldMap[key]] = val
            })
      }

      return {
            ...base,
            description: cleanDesc,
            applicationStartDate: job.applicationStart ? job.applicationStart.slice(0, 10) : '',
            lastDate: job.lastDate ? job.lastDate.slice(0, 10) : '',
            examDate: job.examDate ? job.examDate.slice(0, 10) : '',
            contentBlocks: job.contentBlocks || '{"blocks":[]}',
            slug: job.slug || '',
            seoTitle: job.seoTitle || '',
            metaDescription: job.metaDescription || '',
            primaryKeyword: job.primaryKeyword || '',
            secondaryKeywords: job.secondaryKeywords || '',
            ...extra,
      }
}

// ── In-Flight Request Deduplication & In-Memory TTL Cache ─────────────────────
const inFlightRequests = new Map()
const apiCache = new Map()
const DEFAULT_TTL_MS = 60 * 1000 // 60 seconds

export const clearApiCache = () => {
      apiCache.clear()
}

/**
 * Structured error parser to clearly distinguish:
 * - 429 Rate Limit
 * - 500+ Server Error
 * - Network / CORS / Offline
 * - 404 Not Found
 */
export const parseApiError = (err) => {
      if (err?.isCustomApiError) return err

      const status = err?.response?.status || 0
      const data = err?.response?.data

      let type = 'UNKNOWN'
      let message = 'An unexpected error occurred.'

      if (status === 429) {
            type = 'RATE_LIMITED'
            message = data?.message || 'Too many requests. Please wait a moment and try again.'
      } else if (status >= 500) {
            type = 'SERVER_ERROR'
            message = data?.message || 'Server error occurred. Please try again later.'
      } else if (status === 404) {
            type = 'NOT_FOUND'
            message = data?.message || 'The requested post was not found.'
      } else if (!err?.response && (err?.message?.includes('Network Error') || err?.code === 'ERR_NETWORK')) {
            type = 'NETWORK_ERROR'
            message = 'Unable to connect to the server. Please check your internet connection.'
      } else if (data?.message) {
            message = data.message
      }

      const parsedError = new Error(message)
      parsedError.isCustomApiError = true
      parsedError.status = status
      parsedError.type = type
      parsedError.isRateLimit = status === 429
      parsedError.isServerError = status >= 500
      parsedError.isNetworkError = type === 'NETWORK_ERROR'
      parsedError.retryAfter = parseInt(err?.response?.headers?.['retry-after']) || null
      parsedError.originalError = err

      return parsedError
}

/**
 * Cached & deduplicated GET request
 */
export const cachedGet = async (url, params = {}, options = {}) => {
      const { ttl = DEFAULT_TTL_MS, bypassCache = false } = options

      // Generate consistent cache key from URL and sorted query params
      const sortedEntries = Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .sort(([a], [b]) => a.localeCompare(b))
      const paramStr = new URLSearchParams(sortedEntries).toString()
      const cacheKey = `GET:${url}?${paramStr}`

      // 1. Check TTL cache
      if (!bypassCache) {
            const cached = apiCache.get(cacheKey)
            if (cached && cached.expiresAt > Date.now()) {
                  return cached.data
            }
      }

      // 2. Check pending in-flight promise (deduplication)
      if (inFlightRequests.has(cacheKey)) {
            return inFlightRequests.get(cacheKey)
      }

      // 3. Dispatch request and record in-flight promise
      const requestPromise = api.get(url, { params })
            .then((res) => {
                  apiCache.set(cacheKey, {
                        data: res.data,
                        timestamp: Date.now(),
                        expiresAt: Date.now() + ttl,
                  })
                  return res.data
            })
            .catch((err) => {
                  throw parseApiError(err)
            })
            .finally(() => {
                  inFlightRequests.delete(cacheKey)
            })

      inFlightRequests.set(cacheKey, requestPromise)
      return requestPromise
}

// ── Public helpers ────────────────────────────────────────────────────────────
export const fetchPosts = (params = {}, options = {}) =>
      cachedGet('/api/jobs', params, options)

export const fetchPost = (id, options = {}) =>
      cachedGet(`/api/jobs/${id}`, {}, options)

/** Fetch a published post by its SEO slug */
export const fetchPostBySlug = (slug, options = {}) =>
      cachedGet(`/api/jobs/slug/${slug}`, {}, options)

export const fetchPostsByType = (type, params = {}, options = {}) =>
      cachedGet('/api/jobs', { type, status: 'PUBLISHED', ...params }, options)

// ── Admin auth helpers ────────────────────────────────────────────────────────
export const adminLogin = (email, password) =>
      api.post('/api/auth/admin/login', { email, password }).then((r) => r.data).catch((err) => { throw parseApiError(err) })

export const adminLogout = () => {
      clearApiCache()
      return api.post('/api/auth/logout').then((r) => r.data).catch((err) => { throw parseApiError(err) })
}

export const getMe = () =>
      adminApi.get('/api/auth/me').then((r) => r.data).catch((err) => { throw parseApiError(err) })

// ── Admin CRUD helpers ────────────────────────────────────────────────────────
export const adminGetPosts = (params = {}, options = {}) =>
      adminApi.get('/api/jobs', { params }).then((r) => r.data).catch((err) => { throw parseApiError(err) })

export const adminGetPost = (id) =>
      adminApi.get(`/api/jobs/${id}`).then((r) => r.data).catch((err) => { throw parseApiError(err) })

export const adminCreatePost = (data) => {
      clearApiCache()
      return adminApi.post('/api/jobs', data).then((r) => r.data).catch((err) => { throw parseApiError(err) })
}

export const adminUpdatePost = (id, data) => {
      clearApiCache()
      return adminApi.put(`/api/jobs/${id}`, data).then((r) => r.data).catch((err) => { throw parseApiError(err) })
}

export const adminDeletePost = (id) => {
      clearApiCache()
      return adminApi.delete(`/api/jobs/${id}`).then((r) => r.data).catch((err) => { throw parseApiError(err) })
}

export const adminGetStats = () =>
      adminApi.get('/api/admin/stats').then((r) => r.data).catch((err) => { throw parseApiError(err) })

export default api
