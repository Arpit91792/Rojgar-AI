// ─────────────────────────────────────────────────────────────────────────────
// DataContext.jsx
//
// DEVELOPMENT ONLY — localStorage is browser-specific.
// Data persists across page refreshes but NOT across devices/users.
// Replace postService internals with backend API calls before production.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as postService from '../services/postService'

const DataContext = createContext(null)

export const DataProvider = ({ children }) => {
      const [posts, setPosts] = useState([])
      const [loading, setLoading] = useState(true)

      // ── Load all posts from localStorage ─────────────────────────────────────
      const loadAll = useCallback(() => {
            try {
                  setLoading(true)
                  setPosts(postService.getPosts())
            } catch (err) {
                  console.error('[DataContext] load error:', err)
                  setPosts([])
            } finally {
                  setLoading(false)
            }
      }, [])

      useEffect(() => { loadAll() }, [loadAll])

      // ── React to localStorage changes (same-tab + cross-tab) ─────────────────
      useEffect(() => {
            const handler = () => {
                  try { setPosts(postService.getPosts()) } catch (_) { }
            }
            window.addEventListener('rojgar_storage_updated', handler)
            window.addEventListener('storage', handler)
            return () => {
                  window.removeEventListener('rojgar_storage_updated', handler)
                  window.removeEventListener('storage', handler)
            }
      }, [])

      // ── Derived slices (by category) ─────────────────────────────────────────
      const byCategory = (cat) => posts.filter((p) => p.category === cat)

      const governmentJobs = byCategory(postService.CATEGORIES.GOVERNMENT_JOB)
      const privateJobs = byCategory(postService.CATEGORIES.PRIVATE_JOB)
      const internships = byCategory(postService.CATEGORIES.INTERNSHIP)
      const timeTables = byCategory(postService.CATEGORIES.TIME_TABLE)
      const results = byCategory(postService.CATEGORIES.RESULT)
      const admitCards = byCategory(postService.CATEGORIES.ADMIT_CARD)

      // ── Stats ─────────────────────────────────────────────────────────────────
      const getStats = useCallback(() => postService.getStats(), [posts])

      // ── CRUD actions (write → reload) ─────────────────────────────────────────
      const createPost = (data) => { const r = postService.createPost(data); loadAll(); return r }
      const updatePost = (id, upd) => { const r = postService.updatePost(id, upd); loadAll(); return r }
      const deletePost = (id) => { postService.deletePost(id); loadAll() }
      const publishPost = (id) => { postService.publishPost(id); loadAll() }
      const unpublishPost = (id) => { postService.unpublishPost(id); loadAll() }
      const archivePost = (id) => { postService.archivePost(id); loadAll() }

      return (
            <DataContext.Provider
                  value={{
                        // All raw posts
                        posts,
                        loading,
                        // Slices per category
                        governmentJobs,
                        privateJobs,
                        internships,
                        timeTables,
                        results,
                        admitCards,
                        // Stats
                        getStats,
                        // CRUD
                        createPost,
                        updatePost,
                        deletePost,
                        publishPost,
                        unpublishPost,
                        archivePost,
                        reload: loadAll,
                        // Category constants
                        CATEGORIES: postService.CATEGORIES,
                        STATUSES: postService.STATUSES,
                  }}
            >
                  {children}
            </DataContext.Provider>
      )
}

export const useData = () => {
      const ctx = useContext(DataContext)
      if (!ctx) throw new Error('useData must be used inside DataProvider')
      return ctx
}

export default DataContext
