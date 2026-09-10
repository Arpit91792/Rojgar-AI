import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
      return (
            <div className="min-h-screen bg-slate-50">
                  <Header />
                  {/* pt-16 clears the fixed header — no sidebar offset needed any more */}
                  <div className="pt-16 min-h-screen flex flex-col">
                        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
                              <Outlet />
                        </main>
                        <Footer />
                  </div>
            </div>
      )
}

export default Layout
