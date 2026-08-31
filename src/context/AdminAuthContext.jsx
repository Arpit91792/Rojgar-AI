// DEVELOPMENT ONLY
// This local authentication is NOT secure for production.
// Replace with backend authentication + HTTP-only cookies
// before deploying the Admin Panel publicly.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Dev-only credentials — replace with backend auth before production
const DEV_EMAIL = 'at0585969@gmail.com'
const DEV_PASSWORD = 'Arpit@9179'
const SESSION_KEY = 'rojgar_admin_authenticated'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
      const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
      const [loading, setLoading] = useState(true)

      // DEVELOPMENT ONLY — Check sessionStorage on mount
      useEffect(() => {
            const stored = sessionStorage.getItem(SESSION_KEY)
            if (stored === 'true') {
                  setIsAdminAuthenticated(true)
            }
            setLoading(false)
      }, [])

      // DEVELOPMENT ONLY — Replace with real API call before production
      const adminLogin = useCallback((email, password) => {
            return new Promise((resolve, reject) => {
                  if (email === DEV_EMAIL && password === DEV_PASSWORD) {
                        // DEVELOPMENT ONLY — Replace with backend authentication before production
                        sessionStorage.setItem(SESSION_KEY, 'true')
                        setIsAdminAuthenticated(true)
                        resolve({ success: true })
                  } else {
                        reject(new Error('Invalid email or password.'))
                  }
            })
      }, [])

      const adminLogout = useCallback(() => {
            // DEVELOPMENT ONLY — Replace with backend logout before production
            sessionStorage.removeItem(SESSION_KEY)
            setIsAdminAuthenticated(false)
      }, [])

      return (
            <AdminAuthContext.Provider value={{ isAdminAuthenticated, loading, adminLogin, adminLogout }}>
                  {children}
            </AdminAuthContext.Provider>
      )
}

export const useAdminAuth = () => {
      const ctx = useContext(AdminAuthContext)
      if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
      return ctx
}

export default AdminAuthContext
