// DEVELOPMENT ONLY
// This local authentication is NOT secure for production.
// Replace with backend authentication + HTTP-only cookies
// before deploying the Admin Panel publicly.
//
// When connecting PostgreSQL + Express backend, replace the adminLogin function
// with a real API call: axios.post('/api/auth/admin/login', { email, password })

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// DEVELOPMENT ONLY — Hardcoded dev credentials for local testing
// Remove these before production and use backend authentication
const DEV_EMAIL = 'at0585969@gmail.com'
const DEV_PASSWORD = 'Arpit@9179'
const SESSION_KEY = 'rojgar_admin_authenticated'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
      const [isAuthenticated, setIsAuthenticated] = useState(false)
      const [loading, setLoading] = useState(true)

      // DEVELOPMENT ONLY — restore session from sessionStorage on mount
      useEffect(() => {
            const stored = sessionStorage.getItem(SESSION_KEY)
            if (stored === 'true') {
                  setIsAuthenticated(true)
            }
            setLoading(false)
      }, [])

      // DEVELOPMENT ONLY — local credential check, no network request
      // Replace this with: axios.post('/api/auth/admin/login', { email, password })
      const login = useCallback((email, password) => {
            return new Promise((resolve, reject) => {
                  if (
                        email.trim().toLowerCase() === DEV_EMAIL.toLowerCase() &&
                        password === DEV_PASSWORD
                  ) {
                        // DEVELOPMENT ONLY — Replace with backend token/cookie handling before production
                        sessionStorage.setItem(SESSION_KEY, 'true')
                        setIsAuthenticated(true)
                        resolve({ success: true })
                  } else {
                        reject(new Error('Invalid email or password.'))
                  }
            })
      }, [])

      const logout = useCallback(() => {
            // DEVELOPMENT ONLY — Replace with: axios.post('/api/auth/logout') before production
            sessionStorage.removeItem(SESSION_KEY)
            setIsAuthenticated(false)
      }, [])

      // Expose `admin` object so existing AdminLayout doesn't break
      const admin = isAuthenticated ? { name: 'Admin', email: DEV_EMAIL } : null

      return (
            <AuthContext.Provider value={{ admin, isAuthenticated, loading, login, logout }}>
                  {children}
            </AuthContext.Provider>
      )
}

export const useAuth = () => {
      const ctx = useContext(AuthContext)
      if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
      return ctx
}

export default AuthContext
