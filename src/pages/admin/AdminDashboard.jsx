import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import {
      Building2, Briefcase, GraduationCap, Calendar,
      FileText, FileCheck, BarChart3, FileEdit, Eye, Archive, Loader2,
} from 'lucide-react'

const colorMap = {
      blue: 'bg-blue-50   text-blue-600   border-blue-100',
      green: 'bg-green-50  text-green-600  border-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      red: 'bg-red-50    text-red-600    border-red-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100',
}

const SECTIONS = [
      { label: 'Government Jobs', icon: Building2, color: 'blue', to: '/admin/government-jobs', statKey: 'governmentJobs' },
      { label: 'Private Jobs', icon: Briefcase, color: 'green', to: '/admin/private-jobs', statKey: 'privateJobs' },
      { label: 'Internships', icon: GraduationCap, color: 'purple', to: '/admin/internships', statKey: 'internships' },
      { label: 'Time Table', icon: Calendar, color: 'yellow', to: '/admin/time-table', statKey: 'timeTables' },
      { label: 'Results', icon: FileText, color: 'red', to: '/admin/results', statKey: 'results' },
      { label: 'Admit Cards', icon: FileCheck, color: 'orange', to: '/admin/admit-cards', statKey: 'admitCards' },
]

const fmt = (d) =>
      d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const AdminDashboard = () => {
      const { admin } = useAuth()
      const { posts, loading, error, getStats } = useData()
      const stats = getStats()

      const recentPosts = [...posts]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)

      return (
            <div className="space-y-6 max-w-6xl">
                  {/* Header */}
                  <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-gray-500 mt-1 text-sm">Welcome back, {admin?.name || 'Admin'}</p>
                  </div>

                  {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                              Failed to load data: {error}
                        </div>
                  )}

                  {loading ? (
                        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                              <Loader2 size={20} className="animate-spin" /> Loading from server…
                        </div>
                  ) : (
                        <>
                              {/* Overview cards */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                          { label: 'Total Posts', value: stats.total, icon: BarChart3, color: 'bg-blue-600' },
                                          { label: 'Published', value: stats.published, icon: Eye, color: 'bg-green-600' },
                                          { label: 'Drafts', value: stats.drafts, icon: FileEdit, color: 'bg-yellow-500' },
                                          { label: 'Archived', value: stats.archived, icon: Archive, color: 'bg-gray-500' },
                                    ].map((card) => (
                                          <div key={card.label} className="bg-white rounded-xl border p-5">
                                                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                                                      <card.icon size={20} className="text-white" />
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                                <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                                          </div>
                                    ))}
                              </div>

                              {/* Section cards */}
                              <div>
                                    <h3 className="text-base font-semibold text-gray-700 mb-3">Manage Sections</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                          {SECTIONS.map((s) => {
                                                const cls = colorMap[s.color]
                                                return (
                                                      <Link
                                                            key={s.to}
                                                            to={s.to}
                                                            className={`bg-white border rounded-xl p-4 text-center hover:shadow-md transition-shadow ${cls}`}
                                                      >
                                                            <div className={`inline-flex p-2 rounded-lg mb-2 ${cls}`}>
                                                                  <s.icon size={20} />
                                                            </div>
                                                            <p className="text-xs font-medium text-gray-700 leading-tight">{s.label}</p>
                                                            <p className="text-lg font-bold mt-1">{stats[s.statKey]}</p>
                                                      </Link>
                                                )
                                          })}
                                    </div>
                              </div>

                              {/* Recent posts */}
                              {recentPosts.length > 0 && (
                                    <div>
                                          <h3 className="text-base font-semibold text-gray-700 mb-3">Recent Posts</h3>
                                          <div className="bg-white rounded-xl border overflow-hidden">
                                                <table className="w-full text-sm">
                                                      <thead className="bg-gray-50 text-gray-600">
                                                            <tr>
                                                                  <th className="px-4 py-3 text-left font-medium">Title</th>
                                                                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Category</th>
                                                                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Organization</th>
                                                                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Created</th>
                                                                  <th className="px-4 py-3 text-left font-medium">Status</th>
                                                            </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-gray-100">
                                                            {recentPosts.map((post) => (
                                                                  <tr key={post.id} className="hover:bg-gray-50">
                                                                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[180px]">{post.title}</td>
                                                                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{post.category?.replace(/_/g, ' ')}</td>
                                                                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{post.organization || '—'}</td>
                                                                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{fmt(post.createdAt)}</td>
                                                                        <td className="px-4 py-3">
                                                                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                                                                          post.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-500' :
                                                                                                'bg-yellow-100 text-yellow-700'
                                                                                    }`}>
                                                                                    {post.status}
                                                                              </span>
                                                                        </td>
                                                                  </tr>
                                                            ))}
                                                      </tbody>
                                                </table>
                                          </div>
                                    </div>
                              )}

                              {posts.length === 0 && (
                                    <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
                                          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                          <p className="text-sm">No posts yet. Start by adding a Government Job or Internship.</p>
                                    </div>
                              )}
                        </>
                  )}
            </div>
      )
}

export default AdminDashboard
