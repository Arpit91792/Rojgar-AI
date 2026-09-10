import React, { useState, useEffect, useCallback, useRef } from 'react'
import { NavLink, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
      Menu, X, Bell, User,
      Building2, Briefcase, GraduationCap,
      Calendar, FileText, FileCheck,
} from 'lucide-react'
import logo from '../assets/logo.png'

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
      { icon: Building2, label: 'Government Jobs', to: '/government-jobs', accent: 'text-blue-600', activeBg: 'bg-blue-50', border: 'border-blue-200' },
      { icon: Briefcase, label: 'Private Jobs', to: '/private-jobs', accent: 'text-emerald-600', activeBg: 'bg-emerald-50', border: 'border-emerald-200' },
      { icon: GraduationCap, label: 'Internships', to: '/internships', accent: 'text-violet-600', activeBg: 'bg-violet-50', border: 'border-violet-200' },
      { icon: Calendar, label: 'Time Table', to: '/time-table', accent: 'text-amber-600', activeBg: 'bg-amber-50', border: 'border-amber-200' },
      { icon: FileText, label: 'Results', to: '/results', accent: 'text-teal-600', activeBg: 'bg-teal-50', border: 'border-teal-200' },
      { icon: FileCheck, label: 'Admit Cards', to: '/admit-cards', accent: 'text-orange-600', activeBg: 'bg-orange-50', border: 'border-orange-200' },
]

// ── Inline topbar nav link (desktop) ─────────────────────────────────────────
const TopNavLink = ({ icon: Icon, label, to, accent, activeBg, border }) => (
      <NavLink
            to={to}
            className={({ isActive }) =>
                  [
                        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 border',
                        isActive
                              ? `${activeBg} ${accent} ${border} shadow-sm`
                              : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
            }
      >
            {({ isActive }) => (
                  <>
                        <Icon size={13} className={isActive ? accent : 'text-slate-400'} />
                        <span>{label}</span>
                  </>
            )}
      </NavLink>
)

// ── Mobile drawer nav item ────────────────────────────────────────────────────
const DrawerNavItem = ({ icon: Icon, label, to, accent, activeBg, onClick }) => (
      <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                  [
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        isActive
                              ? `${activeBg} ${accent} shadow-sm`
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')
            }
      >
            {({ isActive }) => (
                  <>
                        <span className={[
                              'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-150',
                              isActive ? 'bg-white shadow-sm' : 'bg-transparent',
                        ].join(' ')}>
                              <Icon size={17} className={isActive ? accent : 'text-slate-500'} />
                        </span>
                        <span>{label}</span>
                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
                  </>
            )}
      </NavLink>
)

// ── Header ────────────────────────────────────────────────────────────────────
const Header = () => {
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
      const location = useLocation()

      const close = useCallback(() => setIsMobileMenuOpen(false), [])

      // Close drawer on route change
      useEffect(() => { close() }, [location.pathname, close])

      // Close on Escape
      useEffect(() => {
            const handler = (e) => { if (e.key === 'Escape') close() }
            document.addEventListener('keydown', handler)
            return () => document.removeEventListener('keydown', handler)
      }, [close])

      // Lock body scroll when drawer open
      useEffect(() => {
            document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
            return () => { document.body.style.overflow = '' }
      }, [isMobileMenuOpen])

      return (
            <>
                  {/* ── Topbar ── */}
                  <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-slate-200/80 shadow-sm">
                        <div className="flex items-center h-16 w-[95%] sm:w-[94%] lg:w-[95%] mx-auto gap-4 overflow-hidden">

                              {/* Hamburger (mobile only) */}
                              <button
                                    onClick={() => setIsMobileMenuOpen((o) => !o)}
                                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                                    className="lg:hidden flex-shrink-0 p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                    {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                              </button>

                              {/* Logo */}
                              <Link to="/" className="flex items-center flex-shrink-0">
                                    <img src={logo} alt="RozgarGrid AI" className="h-9 w-auto object-contain" />
                              </Link>

                              {/* ── Desktop category nav — fills available space ── */}
                              {/* Scrollable so it never causes page-level overflow */}
                              <nav
                                    className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide"
                                    aria-label="Category navigation"
                              >
                                    {NAV_ITEMS.map((item) => (
                                          <TopNavLink key={item.to} {...item} />
                                    ))}
                              </nav>

                              {/* Right icons — pushed to the right on all screen sizes */}
                              <div className="flex items-center gap-1 flex-shrink-0 ml-auto lg:ml-0">
                                    <button
                                          aria-label="Notifications"
                                          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    >
                                          <Bell size={20} />
                                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                                    </button>
                                    <button
                                          aria-label="Profile"
                                          className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    >
                                          <User size={15} />
                                    </button>
                              </div>

                        </div>
                  </header>

                  {/* ── Mobile overlay ── */}
                  <div
                        aria-hidden="true"
                        onClick={close}
                        className={[
                              'lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300',
                              isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                        ].join(' ')}
                  />

                  {/* ── Mobile drawer ── */}
                  <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        className={[
                              'lg:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw]',
                              'bg-white shadow-2xl z-50 flex flex-col',
                              'transition-transform duration-300 ease-in-out',
                              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                        ].join(' ')}
                  >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 flex-shrink-0">
                              <Link to="/" onClick={close} className="flex items-center">
                                    <img src={logo} alt="RozgarGrid AI" className="h-8 w-auto object-contain" />
                              </Link>
                              <button
                                    onClick={close}
                                    aria-label="Close menu"
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              >
                                    <X size={20} />
                              </button>
                        </div>

                        <div className="px-4 pt-4 pb-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Browse</p>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
                              {NAV_ITEMS.map((item) => (
                                    <DrawerNavItem key={item.to} {...item} onClick={close} />
                              ))}
                        </nav>

                        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex-shrink-0">
                              © 2026 RozgarGrid AI · All rights reserved
                        </div>
                  </div>
            </>
      )
}

export default Header
