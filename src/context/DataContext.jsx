// DataContext.jsx — API-backed data context
// All job/post data now comes from the backend API.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as postService from '../services/postService'

const DataContext = createContext(null)

export const DataProvider = ({ children }) => {
      const [posts, setPosts] = useState([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)

      const loadAll = useCallback(async () => {
            try {
                  setLoading(true)
                  setError(null)
                  const data = await postService.getPosts()
                  setPosts(data)
            } catch (err) {
                  console.error('[DataContext] load error:', err)
                  setError('Failed to load posts from server.')
                  setPosts([])
            } finally {
                  setLoading(false)
            }
      }, [])

      useEffect(() => { loadAll() }, [loadAll])

      // Derived slices by category
      const byCategory = (cat) => posts.filter((p) => p.category === cat)
      const governmentJobs = byCategory(postService.CATEGORIES.GOVERNMENT_JOB)
      const privateJobs = byCategory(postService.CATEGORIES.PRIVATE_JOB)
      const internships = byCategory(postService.CATEGORIES.INTERNSHIP)
      const timeTables = byCategory(postService.CATEGORIES.TIME_TABLE)
      const results = byCategory(postService.CATEGORIES.RESULT)
      const admitCards = byCategory(postService.CATEGORIES.ADMIT_CARD)

      // Sync stats from posts array (dashboard uses this)
      const getStats = useCallback(() => {
            return {
                  total: posts.length,
                  published: posts.filter((p) => p.status === 'PUBLISHED').length,
                  drafts: posts.filter((p) => p.status === 'DRAFT').length,
                  archived: posts.filter((p) => p.status === 'ARCHIVED').length,
                  governmentJobs: governmentJobs.length,
                  privateJobs: privateJobs.length,
                  internships: internships.length,
                  timeTables: timeTables.length,
                  results: results.length,
                  admitCards: admitCards.length,
            }
      }, [posts])

      // CRUD — all async, reload after each mutation
      const createPost = async (data) => {
            const r = await postService.createPost(data)
            await loadAll()
            return r
      }
      const updatePost = async (id, upd) => {
            const r = await postService.updatePost(id, upd)
            await loadAll()
            return r
      }
      const deletePost = async (id) => {
            await postService.deletePost(id)
            await loadAll()
      }
      const publishPost = async (id) => {
            await postService.publishPost(id)
            await loadAll()
      }
      const unpublishPost = async (id) => {
            await postService.unpublishPost(id)
            await loadAll()
      }
      const archivePost = async (id) => {
            await postService.archivePost(id)
            await loadAll()
      }

      return (
            <DataContext.Provider value={{
                  posts, loading, error,
                  governmentJobs, privateJobs, internships,
                  timeTables, results, admitCards,
                  getStats,
                  createPost, updatePost, deletePost,
                  publishPost, unpublishPost, archivePost,
                  reload: loadAll,
                  CATEGORIES: postService.CATEGORIES,
                  STATUSES: postService.STATUSES,
            }}>
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
