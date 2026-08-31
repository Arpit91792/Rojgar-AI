// ─────────────────────────────────────────────────────────────────────────────
// usePosts.js  — Custom React hook for localStorage-backed post CRUD
//
// DEVELOPMENT ONLY — uses postService which wraps localStorage.
// Replace postService internals with API calls when backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as postService from '../services/postService'

/**
 * @param {string|null} category  - Filter by category (null = all)
 * @param {string|null} status    - Filter by status   (null = all)
 */
const usePosts = (category = null, status = null) => {
      const [posts, setPosts] = useState([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)

      // Load posts from localStorage
      const loadPosts = useCallback(() => {
            try {
                  setLoading(true)
                  setError(null)
                  const data = category
                        ? postService.getPostsByCategory(category, status)
                        : postService.getPosts()
                  setPosts(data)
            } catch (err) {
                  console.error('[usePosts] load error:', err)
                  setError('Unable to load saved posts.')
                  setPosts([])
            } finally {
                  setLoading(false)
            }
      }, [category, status])

      // Initial load
      useEffect(() => { loadPosts() }, [loadPosts])

      // Sync with localStorage changes (same-tab custom event + cross-tab storage event)
      useEffect(() => {
            const handleUpdate = () => loadPosts()
            window.addEventListener('rojgar_storage_updated', handleUpdate)
            window.addEventListener('storage', handleUpdate) // cross-tab sync
            return () => {
                  window.removeEventListener('rojgar_storage_updated', handleUpdate)
                  window.removeEventListener('storage', handleUpdate)
            }
      }, [loadPosts])

      // ── CRUD wrappers (update state immediately after localStorage write) ────────

      const createPost = useCallback((data) => {
            const created = postService.createPost(data)
            loadPosts()
            return created
      }, [loadPosts])

      const updatePost = useCallback((id, updates) => {
            const updated = postService.updatePost(id, updates)
            loadPosts()
            return updated
      }, [loadPosts])

      const deletePost = useCallback((id) => {
            postService.deletePost(id)
            loadPosts()
      }, [loadPosts])

      const publishPost = useCallback((id) => {
            postService.publishPost(id)
            loadPosts()
      }, [loadPosts])

      const unpublishPost = useCallback((id) => {
            postService.unpublishPost(id)
            loadPosts()
      }, [loadPosts])

      const archivePost = useCallback((id) => {
            postService.archivePost(id)
            loadPosts()
      }, [loadPosts])

      const getPostsByCategory = useCallback((cat, st = null) =>
            postService.getPostsByCategory(cat, st), [])

      return {
            posts,
            loading,
            error,
            reload: loadPosts,
            createPost,
            updatePost,
            deletePost,
            publishPost,
            unpublishPost,
            archivePost,
            getPostsByCategory,
      }
}

export default usePosts
