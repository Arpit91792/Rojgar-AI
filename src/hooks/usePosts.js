// usePosts.js — API-backed hook (replaces localStorage version)

import { useState, useEffect, useCallback } from 'react'
import * as postService from '../services/postService'

/**
 * @param {string|null} category  - GOVERNMENT_JOB | PRIVATE_JOB | etc.
 * @param {string|null} status    - PUBLISHED | DRAFT | null (all)
 */
const usePosts = (category = null, status = null) => {
      const [posts, setPosts] = useState([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [errorType, setErrorType] = useState(null)

      const loadPosts = useCallback(async () => {
            try {
                  setLoading(true)
                  setError(null)
                  setErrorType(null)
                  const data = category
                        ? await postService.getPostsByCategory(category, status)
                        : await postService.getPosts()
                  setPosts(data || [])
            } catch (err) {
                  console.error('[usePosts] load error:', err)
                  const status = err?.status || err?.response?.status

                  if (status === 429 || err?.type === 'RATE_LIMITED' || err?.isRateLimit) {
                        setErrorType('RATE_LIMITED')
                        setError('Too many requests. Please wait a moment before trying again.')
                  } else if (status >= 500 || err?.type === 'SERVER_ERROR' || err?.isServerError) {
                        setErrorType('SERVER_ERROR')
                        setError('Server error occurred. Please try again later.')
                  } else if (err?.type === 'NETWORK_ERROR' || err?.isNetworkError || !err?.response) {
                        setErrorType('NETWORK_ERROR')
                        setError('Unable to connect to the server. Please check your connection.')
                  } else {
                        setErrorType('UNKNOWN')
                        setError(err?.message || 'Unable to load posts from server.')
                  }
                  setPosts([])
            } finally {
                  setLoading(false)
            }
      }, [category, status])

      useEffect(() => { loadPosts() }, [loadPosts])

      const createPost = useCallback(async (data) => {
            const created = await postService.createPost(data)
            await loadPosts()
            return created
      }, [loadPosts])

      const updatePost = useCallback(async (id, updates) => {
            const updated = await postService.updatePost(id, updates)
            await loadPosts()
            return updated
      }, [loadPosts])

      const deletePost = useCallback(async (id) => {
            await postService.deletePost(id)
            await loadPosts()
      }, [loadPosts])

      const publishPost = useCallback(async (id) => {
            await postService.publishPost(id)
            await loadPosts()
      }, [loadPosts])

      const unpublishPost = useCallback(async (id) => {
            await postService.unpublishPost(id)
            await loadPosts()
      }, [loadPosts])

      const archivePost = useCallback(async (id) => {
            await postService.archivePost(id)
            await loadPosts()
      }, [loadPosts])

      return {
            posts, loading, error, errorType,
            reload: loadPosts,
            createPost, updatePost, deletePost,
            publishPost, unpublishPost, archivePost,
      }
}

export default usePosts
