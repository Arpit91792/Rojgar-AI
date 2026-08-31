import React from 'react'
import { Outlet } from 'react-router-dom'
import Header, { DesktopSidebar } from './Header'
import Footer from './Footer'

const Layout = () => {
      return (
            <div className="min-h-screen bg-slate-50">
                  <Header />
                  <DesktopSidebar />
                  {/* pt-16 clears header, lg:pl-64 clears sidebar (w-64) */}
                  <div className="pt-16 lg:pl-64 min-h-screen flex flex-col">
                        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto lg:mx-0">
                              <Outlet />
                        </main>
                        <Footer />
                  </div>
            </div>
      )
}

export default Layout
