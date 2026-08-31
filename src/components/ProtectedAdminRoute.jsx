// Redirects unauthenticated users to /admin login.
// DEVELOPMENT: Uses sessionStorage-based auth from AuthContext.
// PRODUCTION: Replace with real token/session validation.

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingState from './LoadingState'

const ProtectedAdminRoute = ({ children }) => {
      const { isAuthenticated, loading } = useAuth()

      if (loading) return <LoadingState message="Checking authentication…" />
      if (!isAuthenticated) return <Navigate to="/admin" replace />

      return children
}

export default ProtectedAdminRoute
