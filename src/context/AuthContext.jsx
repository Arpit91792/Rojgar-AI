import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { adminLogin as apiAdminLogin, adminLogout as apiAdminLogout, getMe } from '../services/api.js'

const SESSION_KEY = 'admin_token'
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
      const [admin, setAdmin] = useState(null)
      const [isAuthenticated, setIsAuthenticated] = useState(false)
      const [loading, setLoading] = useState(true)

      // Restore session on mount — verify token with backend
      useEffect(() => {
            const token = localStorage.getItem(SESSION_KEY)
            if (!token) { setLoading(false); return }

            getMe()
                  .then((res) => {
                        const user = res.data
                        setAdmin({ name: user.name, email: user.email, id: user.id, role: user.role })
                        setIsAuthenticated(true)
                  })
                  .catch(() => {
                        localStorage.removeItem(SESSION_KEY)
                  })
                  .finally(() => setLoading(false))
      }, [])

      const login = useCallback(async (email, password) => {
            const res = await apiAdminLogin(email, password)
            const { accessToken, user } = res.data
            localStorage.setItem(SESSION_KEY, accessToken)
            setAdmin({ name: user.name, email: user.email, id: user.id, role: user.role })
            setIsAuthenticated(true)
            return res
      }, [])

      const logout = useCallback(async () => {
            try { await apiAdminLogout() } catch (_) { }
            localStorage.removeItem(SESSION_KEY)
            setAdmin(null)
            setIsAuthenticated(false)
      }, [])

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
