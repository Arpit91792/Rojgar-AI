import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import EmptyState from '../../components/EmptyState'
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, Search, ExternalLink, Loader2 } from 'lucide-react'

const STATUS_STYLES = {
      PUBLISHED: 'bg-green-100 text-green-700',
      DRAFT: 'bg-yellow-100 text-yellow-700',
      ARCHIVED: 'bg-gray-100 text-gray-500',
}

const StatusBadge = ({ status }) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
      </span>
)

const CAT_TO_SLICE = {
      GOVERNMENT_JOB: 'governmentJobs',
      PRIVATE_JOB: 'privateJobs',
      INTERNSHIP: 'internships',
      TIME_TABLE: 'timeTables',
      RESULT: 'results',
      ADMIT_CARD: 'admitCards',
}

const fmt = (d) =>
      d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const AdminPostList = ({ title, category, addPath, editPathFn }) => {
      const { publishPost, unpublishPost, archivePost, deletePost, loading, ...data } = useData()
      const posts = data[CAT_TO_SLICE[category]] || []

      const [search, setSearch] = useState('')
      const [statusFilter, setStatusFilter] = useState('')
      const [confirmDelete, setConfirmDelete] = useState(null)
      const [actionLoading, setActionLoading] = useState(null) // id of row being actioned

      const filtered = useMemo(() =>
            posts.filter((p) => {
                  const q = search.toLowerCase()
                  const matchSearch = !search ||
                        p.title?.toLowerCase().includes(q) ||
                        p.organization?.toLowerCase().includes(q)
                  const matchStatus = !statusFilter || p.status === statusFilter
                  return matchSearch && matchStatus
            }),
            [posts, search, statusFilter]
      )

      const withLoading = async (id, fn) => {
            setActionLoading(id)
            try { await fn() } catch (e) { console.error(e) }
            finally { setActionLoading(null) }
      }

      const handleToggle = (post) => {
            withLoading(post.id, () =>
                  post.status === 'PUBLISHED' ? unpublishPost(post.id) : publishPost(post.id)
            )
      }

      const handleArchive = (id) => withLoading(id, () => archivePost(id))

      const handleDelete = async (id) => {
            setActionLoading(id)
            try { await deletePost(id) } catch (e) { console.error(e) }
            finally { setActionLoading(null); setConfirmDelete(null) }
      }

      return (
            <div className="space-y-5 max-w-6xl">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                              <p className="text-sm text-gray-500 mt-0.5">
                                    {loading ? 'Loading…' : `${filtered.length} of ${posts.length} posts`}
                              </p>
                        </div>
                        <Link
                              to={addPath}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                              <Plus size={16} /> Add {title}
                        </Link>
                  </div>

                  {/* Search + filter */}
                  <div className="bg-white rounded-xl border p-4 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                    type="text"
                                    placeholder="Search by title or organization…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                        </div>
                        <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                              <option value="">All Status</option>
                              <option value="PUBLISHED">Published</option>
                              <option value="DRAFT">Draft</option>
                              <option value="ARCHIVED">Archived</option>
                        </select>
                  </div>

                  {/* Loading skeleton */}
                  {loading && (
                        <div className="bg-white rounded-xl border p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                              <Loader2 size={18} className="animate-spin" /> Loading from server…
                        </div>
                  )}

                  {/* List */}
                  {!loading && filtered.length === 0 && (
                        <EmptyState
                              message={`No ${title.toLowerCase()} found.`}
                              action={
                                    <Link to={addPath} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                          + Add New
                                    </Link>
                              }
                        />
                  )}

                  {!loading && filtered.length > 0 && (
                        <div className="bg-white rounded-xl border overflow-hidden">
                              <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                                                <tr>
                                                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                                                      <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Organization</th>
                                                      <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Last Date</th>
                                                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                                                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                                </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                                {filtered.map((post) => (
                                                      <tr key={post.id} className={`hover:bg-gray-50 ${actionLoading === post.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            <td className="px-4 py-3">
                                                                  <p className="font-medium text-gray-900 truncate max-w-[220px]">{post.title}</p>
                                                                  <p className="text-xs text-gray-400 mt-0.5">{fmt(post.createdAt)}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-[150px]">
                                                                  {post.organization || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                                                                  {fmt(post.lastDate || post.resultDate || post.examDate)}
                                                            </td>
                                                            <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                                                            <td className="px-4 py-3">
                                                                  <div className="flex items-center justify-end gap-1">
                                                                        {/* Preview */}
                                                                        {post.status === 'PUBLISHED' && (
                                                                              <Link
                                                                                    to={`/posts/${post.id}`}
                                                                                    target="_blank"
                                                                                    title="Preview on public site"
                                                                                    className="p-1.5 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                                                              >
                                                                                    <ExternalLink size={15} />
                                                                              </Link>
                                                                        )}
                                                                        {/* Publish / Unpublish */}
                                                                        <button
                                                                              onClick={() => handleToggle(post)}
                                                                              title={post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                                                              className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                        >
                                                                              {actionLoading === post.id
                                                                                    ? <Loader2 size={15} className="animate-spin" />
                                                                                    : post.status === 'PUBLISHED' ? <EyeOff size={15} /> : <Eye size={15} />
                                                                              }
                                                                        </button>
                                                                        {/* Archive */}
                                                                        <button
                                                                              onClick={() => handleArchive(post.id)}
                                                                              title="Archive"
                                                                              className="p-1.5 rounded-md text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                                                                        >
                                                                              <Archive size={15} />
                                                                        </button>
                                                                        {/* Edit */}
                                                                        <Link
                                                                              to={editPathFn(post.id)}
                                                                              className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                                              title="Edit"
                                                                        >
                                                                              <Pencil size={15} />
                                                                        </Link>
                                                                        {/* Delete */}
                                                                        <button
                                                                              onClick={() => setConfirmDelete(post.id)}
                                                                              title="Delete"
                                                                              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                        >
                                                                              <Trash2 size={15} />
                                                                        </button>
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        </div>
                  )}

                  {/* Delete confirmation modal */}
                  {confirmDelete && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Post?</h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                          This will permanently remove it from the database and the public website.
                                    </p>
                                    <div className="flex gap-3">
                                          <button
                                                onClick={() => setConfirmDelete(null)}
                                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                                          >
                                                Cancel
                                          </button>
                                          <button
                                                onClick={() => handleDelete(confirmDelete)}
                                                disabled={!!actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                                          >
                                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                                Delete
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      )
}

export default AdminPostList
