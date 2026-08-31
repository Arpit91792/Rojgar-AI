import React, { useState, useCallback, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
      LayoutDashboard, Building2, Briefcase, GraduationCap,
      Calendar, FileText, FileCheck, Bell, Settings,
      LogOut, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import logo from '../assets/logo.jpeg'

const NAV = [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
      { label: 'Government Jobs', icon: Building2, to: '/admin/government-jobs' },
      { label: 'Private Jobs', icon: Briefcase, to: '/admin/private-jobs' },
      { label: 'Internships', icon: GraduationCap, to: '/admin/internships' },
      { label: 'Time Table', icon: Calendar, to: '/admin/time-table' },
      { label: 'Results', icon: FileText, to: '/admin/results' },
      { label: 'Admit Cards', icon: FileCheck, to: '/admin/admit-cards' },
      { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
]

const NavItem = ({ icon: Icon, label, to, collapsed, onClick }) => (
      <NavLink
            to={to}
            onClick={onClick}
            end={to === '/admin/dashboard'}
            className={({ isActive }) =>
                  [
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative group',
                        isActive
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        collapsed ? 'justify-center' : '',
                  ].join(' ')
            }
      >
            <Icon size={19} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
            {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {label}
                  </span>
            )}
      </NavLink>
)

const AdminLayout = ({ children }) => {
      const { admin, logout } = useAuth()
      const navigate = useNavigate()
      const location = useLocation()
      const [collapsed, setCollapsed] = useState(false)
      const [mobileOpen, setMobileOpen] = useState(false)

      // Close mobile drawer on route change
      useEffect(() => { setMobileOpen(false) }, [location.pathname])

      // Prevent body scroll when mobile drawer open
      useEffect(() => {
            document.body.style.overflow = mobileOpen ? 'hidden' : ''
            return () => { document.body.style.overflow = '' }
      }, [mobileOpen])

      // Escape closes mobile drawer
      useEffect(() => {
            const h = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
            document.addEventListener('keydown', h)
            return () => document.removeEventListener('keydown', h)
      }, [])

      const handleLogout = useCallback(() => {
            logout()
            navigate('/admin')
      }, [logout, navigate])

      const sidebarContent = (isMobile = false) => (
            <>
                  {/* Logo */}
                  <div
                        className={`flex items-center border-b border-gray-700 h-16 px-3 flex-shrink-0 ${collapsed && !isMobile ? 'justify-center' : 'gap-2'
                              }`}
                  >
                        {/* Show mini icon when collapsed, full logo otherwise */}
                        {collapsed && !isMobile ? (
                              <img
                                    src={logo}
                                    alt="Rojgar AI"
                                    className="h-8 w-8 object-contain rounded"
                              />
                        ) : (
                              <img
                                    src={logo}
                                    alt="Rojgar AI"
                                    className="h-9 w-auto object-contain flex-shrink-0"
                              />
                        )}
                        {!isMobile && (
                              <button
                                    onClick={() => setCollapsed((c) => !c)}
                                    className="ml-auto p-1.5 text-gray-400 hover:text-white rounded transition-colors flex-shrink-0"
                                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                              >
                                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                              </button>
                        )}
                        {isMobile && (
                              <button
                                    onClick={() => setMobileOpen(false)}
                                    className="ml-auto p-1.5 text-gray-400 hover:text-white rounded"
                                    aria-label="Close menu"
                              >
                                    <X size={20} />
                              </button>
                        )}
                  </div>

                  {/* Nav items */}
                  <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                        {(!collapsed || isMobile) && (
                              <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Post Management
                              </p>
                        )}
                        {NAV.map((item) => (
                              <NavItem
                                    key={item.to}
                                    {...item}
                                    collapsed={collapsed && !isMobile}
                                    onClick={isMobile ? () => setMobileOpen(false) : undefined}
                              />
                        ))}
                  </nav>

                  {/* Footer */}
                  <div className="border-t border-gray-700 p-3 flex-shrink-0 space-y-1">
                        {(!collapsed || isMobile) && admin && (
                              <div className="px-3 py-2 mb-1">
                                    <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                              </div>
                        )}
                        <button
                              onClick={handleLogout}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-colors ${collapsed && !isMobile ? 'justify-center' : ''
                                    }`}
                        >
                              <LogOut size={18} className="flex-shrink-0" />
                              {(!collapsed || isMobile) && <span>Logout</span>}
                        </button>
                  </div>
            </>
      )

      return (
            <div className="min-h-screen bg-gray-100 flex">
                  {/* Desktop sidebar */}
                  <aside
                        style={{ width: collapsed ? 72 : 240 }}
                        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-gray-800 transition-[width] duration-300 ease-in-out overflow-hidden z-30"
                  >
                        {sidebarContent(false)}
                  </aside>

                  {/* Mobile overlay */}
                  <div
                        aria-hidden="true"
                        onClick={() => setMobileOpen(false)}
                        className={[
                              'lg:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300',
                              mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                        ].join(' ')}
                  />

                  {/* Mobile drawer */}
                  <aside
                        className={[
                              'lg:hidden fixed top-0 left-0 h-screen w-64 bg-gray-800 flex flex-col z-50',
                              'transition-transform duration-300 ease-in-out',
                              mobileOpen ? 'translate-x-0' : '-translate-x-full',
                        ].join(' ')}
                  >
                        {sidebarContent(true)}
                  </aside>

                  {/* Main area */}
                  <div
                        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300"
                        style={{ marginLeft: collapsed ? 72 : 240 }}
                  >
                        {/* Top bar */}
                        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 lg:px-6 gap-4">
                              <button
                                    onClick={() => setMobileOpen(true)}
                                    className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                                    aria-label="Open menu"
                              >
                                    <Menu size={22} />
                              </button>
                              <h1 className="font-semibold text-gray-800 text-lg flex-1">Admin Panel</h1>
                              {admin && (
                                    <div className="hidden sm:flex items-center gap-2">
                                          <img
                                                src={logo}
                                                alt="Rojgar AI"
                                                className="h-8 w-auto object-contain"
                                          />
                                    </div>
                              )}
                        </header>

                        {/* Page content */}
                        <main className="flex-1 p-4 sm:p-6">
                              {children}
                        </main>
                  </div>
            </div>
      )
}

export default AdminLayout
