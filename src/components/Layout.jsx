import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
      return (
            <div className="min-h-screen bg-slate-50">
                  <Header />
                  {/* pt-16 clears the fixed header */}
                  <div className="pt-16 min-h-screen flex flex-col">
                        <main className="flex-1 w-[95%] sm:w-[94%] lg:w-[95%] mx-auto py-4 sm:py-6 lg:py-8">
                              <Outlet />
                        </main>
                        <Footer />
                  </div>
            </div>
      )
}

export default Layout
