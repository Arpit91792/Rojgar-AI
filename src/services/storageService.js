// ─────────────────────────────────────────────────────────────────────────────
// storageService.js
//
// DEVELOPMENT ONLY
// localStorage is browser-specific. Data is NOT shared between users/devices.
// Replace this service with a backend API + PostgreSQL before production.
//
// FUTURE MIGRATION:
//   Admin UI → postService → storageService   (current)
//   Admin UI → postService → Express API → Prisma → PostgreSQL  (future)
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'rojgar_ai_posts'

// ── Slug generator ────────────────────────────────────────────────────────────
export const generateSlug = (title, existingSlugs = []) => {
      const base = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')

      if (!existingSlugs.includes(base)) return base

      let counter = 2
      while (existingSlugs.includes(`${base}-${counter}`)) counter++
      return `${base}-${counter}`
}

// ── ID generator ──────────────────────────────────────────────────────────────
const genId = () =>
      `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// ── Safe localStorage read ────────────────────────────────────────────────────
const readStorage = () => {
      try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []
            return parsed
      } catch (err) {
            // DEVELOPMENT ONLY — If localStorage contains invalid JSON, reset safely
            console.warn('[storageService] Corrupted localStorage data, resetting.', err)
            try { localStorage.removeItem(STORAGE_KEY) } catch (_) { }
            return []
      }
}

// ── Safe localStorage write ───────────────────────────────────────────────────
const writeStorage = (posts) => {
      try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
            // Dispatch custom event so same-tab listeners can react immediately
            window.dispatchEvent(new Event('rojgar_storage_updated'))
      } catch (err) {
            console.error('[storageService] Failed to write localStorage:', err)
      }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Return all posts regardless of status */
export const getPosts = () => readStorage()

/** Return a single post by id */
export const getPostById = (id) => {
      const posts = readStorage()
      return posts.find((p) => p.id === id) || null
}

/** Return a single post by slug */
export const getPostBySlug = (slug) => {
      const posts = readStorage()
      return posts.find((p) => p.slug === slug) || null
}

/**
 * Return posts filtered by category.
 * Pass status to further filter (e.g. 'PUBLISHED' for public pages).
 */
export const getPostsByCategory = (category, status = null) => {
      const posts = readStorage()
      return posts.filter((p) => {
            const matchCat = p.category === category
            const matchStatus = status ? p.status === status : true
            return matchCat && matchStatus
      })
}

/** Create a new post and save to localStorage */
export const createPost = (postData) => {
      const posts = readStorage()
      const existingSlugs = posts.map((p) => p.slug).filter(Boolean)
      const now = new Date().toISOString()

      const newPost = {
            ...postData,
            id: genId(),
            slug: generateSlug(postData.title || 'untitled', existingSlugs),
            status: postData.status || 'DRAFT',
            createdAt: now,
            updatedAt: now,
            publishedAt: postData.status === 'PUBLISHED' ? now : null,
      }

      writeStorage([newPost, ...posts])
      return newPost
}

/** Update an existing post by id */
export const updatePost = (id, updates) => {
      const posts = readStorage()
      const idx = posts.findIndex((p) => p.id === id)
      if (idx === -1) return null

      const existing = posts[idx]
      const now = new Date().toISOString()

      // Regenerate slug if title changed
      const existingSlugs = posts
            .filter((p) => p.id !== id)
            .map((p) => p.slug)
            .filter(Boolean)

      const newSlug =
            updates.title && updates.title !== existing.title
                  ? generateSlug(updates.title, existingSlugs)
                  : existing.slug

      const updated = {
            ...existing,
            ...updates,
            id, // never allow id change
            slug: newSlug,
            updatedAt: now,
            publishedAt:
                  updates.status === 'PUBLISHED' && !existing.publishedAt
                        ? now
                        : existing.publishedAt,
      }

      posts[idx] = updated
      writeStorage(posts)
      return updated
}

/** Delete a post by id */
export const deletePost = (id) => {
      const posts = readStorage()
      const filtered = posts.filter((p) => p.id !== id)
      writeStorage(filtered)
      return true
}

/** Set status to PUBLISHED */
export const publishPost = (id) => {
      const posts = readStorage()
      const idx = posts.findIndex((p) => p.id === id)
      if (idx === -1) return null
      const now = new Date().toISOString()
      posts[idx] = {
            ...posts[idx],
            status: 'PUBLISHED',
            publishedAt: posts[idx].publishedAt || now,
            updatedAt: now,
      }
      writeStorage(posts)
      return posts[idx]
}

/** Set status back to DRAFT */
export const unpublishPost = (id) => {
      const posts = readStorage()
      const idx = posts.findIndex((p) => p.id === id)
      if (idx === -1) return null
      const now = new Date().toISOString()
      posts[idx] = { ...posts[idx], status: 'DRAFT', updatedAt: now }
      writeStorage(posts)
      return posts[idx]
}

/** Set status to ARCHIVED */
export const archivePost = (id) => {
      const posts = readStorage()
      const idx = posts.findIndex((p) => p.id === id)
      if (idx === -1) return null
      const now = new Date().toISOString()
      posts[idx] = { ...posts[idx], status: 'ARCHIVED', updatedAt: now }
      writeStorage(posts)
      return posts[idx]
}

/** Clear all posts — use with caution */
export const clearPosts = () => {
      writeStorage([])
}
