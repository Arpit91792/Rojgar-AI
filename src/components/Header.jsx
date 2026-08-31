import React, { useState, useEffect, useCallback, useRef } from 'react'
import { NavLink, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
      Menu, X, Search, Bell, User,
      Building2, Briefcase, GraduationCap,
      Calendar, FileText, FileCheck, Sparkles
} from 'lucide-react'
import logo from '../assets/logo.jpeg'

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
      { icon: Building2, label: 'Government Jobs', to: '/government-jobs', accent: 'text-blue-500', activeBg: 'bg-blue-50' },
      { icon: Briefcase, label: 'Private Jobs', to: '/private-jobs', accent: 'text-emerald-500', activeBg: 'bg-emerald-50' },
      { icon: GraduationCap, label: 'Internships', to: '/internships', accent: 'text-violet-500', activeBg: 'bg-violet-50' },
      { icon: Calendar, label: 'Time Table', to: '/time-table', accent: 'text-amber-500', activeBg: 'bg-amber-50' },
      { icon: FileText, label: 'Results', to: '/results', accent: 'text-teal-500', activeBg: 'bg-teal-50' },
      { icon: FileCheck, label: 'Admit Cards', to: '/admit-cards', accent: 'text-orange-500', activeBg: 'bg-orange-50' },
]

// ── Sidebar nav item ──────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, to, accent, activeBg, onClick }) => (
      <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                  [
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
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
                              isActive ? 'bg-white shadow-sm' : 'bg-transparent group-hover:bg-white group-hover:shadow-sm',
                        ].join(' ')}>
                              <Icon size={17} className={isActive ? accent : 'text-slate-500 group-hover:text-slate-700'} />
                        </span>
                        <span>{label}</span>
                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
                  </>
            )}
      </NavLink>
)

// ── Desktop sidebar ───────────────────────────────────────────────────────────
export const DesktopSidebar = () => (
      <aside className="hidden lg:flex flex-col fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-100 z-20 overflow-y-auto scrollbar-hide">
            {/* Browse label */}
            <div className="px-4 pt-5 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Browse</p>
            </div>
            <nav className="px-3 pb-4 space-y-0.5">
                  {NAV_ITEMS.map((item) => (
                        <NavItem key={item.to} {...item} />
                  ))}
            </nav>

            {/* Quick stats promo */}
            <div className="mx-3 mt-auto mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                  <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-yellow-300" />
                        <span className="text-xs font-bold">Rojgar AI</span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                        Find your dream job across India. Updated daily.
                  </p>
            </div>
      </aside>
)

// ── Header + Mobile Drawer ────────────────────────────────────────────────────
const Header = () => {
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
      const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
      const [searchValue, setSearchValue] = useState('')
      const location = useLocation()
      const navigate = useNavigate()
      const mobileSearchRef = useRef(null)
      const [searchParams] = useSearchParams()

      useEffect(() => {
            if (location.pathname === '/search') setSearchValue(searchParams.get('q') || '')
      }, [location.pathname, searchParams])

      const close = useCallback(() => setIsMobileMenuOpen(false), [])

      useEffect(() => { close(); setIsMobileSearchOpen(false) }, [location.pathname, close])

      useEffect(() => {
            const handler = (e) => { if (e.key === 'Escape') { close(); setIsMobileSearchOpen(false) } }
            document.addEventListener('keydown', handler)
            return () => document.removeEventListener('keydown', handler)
      }, [close])

      useEffect(() => {
            document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
            return () => { document.body.style.overflow = '' }
      }, [isMobileMenuOpen])

      useEffect(() => {
            if (isMobileSearchOpen && mobileSearchRef.current) mobileSearchRef.current.focus()
      }, [isMobileSearchOpen])

      const handleSearchSubmit = (e) => {
            e.preventDefault()
            const q = searchValue.trim()
            if (q) { navigate(`/search?q=${encodeURIComponent(q)}`); setIsMobileSearchOpen(false) }
      }

      return (
            <>
                  {/* ── Topbar ── */}
                  <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between h-16 w-full px-4 sm:px-6">

                              {/* Left: hamburger + logo */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                    <button
                                          onClick={() => setIsMobileMenuOpen((o) => !o)}
                                          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                                          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                          {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                                    </button>
                                    <Link to="/" className="flex items-center gap-2.5">
                                          <img src={logo} alt="Rojgar AI" className="h-9 w-auto object-contain" />
                                    </Link>
                              </div>

                              {/* Center: desktop search */}
                              <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-6">
                                    <div className="relative w-full group">
                                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                          <input
                                                type="search"
                                                placeholder="Search jobs, internships, results, admit cards…"
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                className="w-full pl-10 pr-28 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
                                          />
                                          <button
                                                type="submit"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                          >
                                                Search
                                          </button>
                                    </div>
                              </form>

                              {/* Right icons */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                          aria-label="Search"
                                          onClick={() => setIsMobileSearchOpen((o) => !o)}
                                          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    >
                                          {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
                                    </button>
                                    <button aria-label="Notifications" className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
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

                        {/* Mobile search slide-down */}
                        <div className={[
                              'md:hidden overflow-hidden transition-all duration-300 border-t border-slate-100',
                              isMobileSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0',
                        ].join(' ')}>
                              <form onSubmit={handleSearchSubmit} className="px-4 py-3">
                                    <div className="relative">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                          <input
                                                ref={mobileSearchRef}
                                                type="search"
                                                placeholder="Search jobs, internships…"
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                className="w-full pl-9 pr-20 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                                          />
                                          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                                Go
                                          </button>
                                    </div>
                              </form>
                        </div>
                  </header>

                  {/* Mobile overlay */}
                  <div
                        aria-hidden="true"
                        onClick={close}
                        className={[
                              'lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300',
                              isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                        ].join(' ')}
                  />

                  {/* Mobile drawer */}
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
                              <Link to="/" onClick={close} className="flex items-center gap-2">
                                    <img src={logo} alt="Rojgar AI" className="h-8 w-auto object-contain" />
                              </Link>
                              <button onClick={close} aria-label="Close" className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                              </button>
                        </div>

                        <div className="px-4 pt-4 pb-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Browse</p>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
                              {NAV_ITEMS.map((item) => (
                                    <NavItem key={item.to} {...item} onClick={close} />
                              ))}
                        </nav>

                        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex-shrink-0">
                              © 2026 Rojgar AI · All rights reserved
                        </div>
                  </div>
            </>
      )
}

export default Header
