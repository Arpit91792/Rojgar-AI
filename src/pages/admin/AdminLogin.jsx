// DEVELOPMENT ONLY
// This login page uses local credential validation — no network request is made.
// Replace with backend API authentication before production.

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import logo from '../../assets/logo.jpeg'

// DEVELOPMENT ONLY — default credentials pre-filled for convenience
const DEV_EMAIL = ''
const DEV_PASSWORD = ''

const AdminLogin = () => {
      const { login, isAuthenticated, loading } = useAuth()
      const navigate = useNavigate()

      // DEVELOPMENT ONLY — pre-fill credentials so login is one click
      const [email, setEmail] = useState(DEV_EMAIL)
      const [password, setPassword] = useState(DEV_PASSWORD)
      const [showPw, setShowPw] = useState(false)
      const [error, setError] = useState('')
      const [submitting, setSubmitting] = useState(false)

      // Already logged in — go to dashboard
      useEffect(() => {
            if (!loading && isAuthenticated) {
                  navigate('/admin/dashboard', { replace: true })
            }
      }, [isAuthenticated, loading, navigate])

      const handleSubmit = async (e) => {
            e.preventDefault()
            setError('')

            if (!email.trim() || !password) {
                  setError('Please enter email and password.')
                  return
            }

            setSubmitting(true)
            try {
                  // DEVELOPMENT ONLY — no network request, purely local validation
                  await login(email.trim(), password)
                  navigate('/admin/dashboard', { replace: true })
            } catch (err) {
                  // Display the error from AuthContext — never "Network Error"
                  setError(err?.message || 'Invalid email or password.')
            } finally {
                  setSubmitting(false)
            }
      }

      if (loading) {
            return (
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
            )
      }

      return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-md">
                        {/* Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                              {/* Logo */}
                              <div className="text-center mb-8">
                                    <img
                                          src={logo}
                                          alt="Rojgar AI"
                                          className="h-16 w-auto object-contain mx-auto mb-3"
                                    />
                                    <p className="text-gray-500 mt-1 text-sm font-medium">Admin Panel</p>
                              </div>

                              {/* Error — never shows "Network Error" */}
                              {error && (
                                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                                          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                          <span>{error}</span>
                                    </div>
                              )}

                              {/* Form */}
                              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                    <div>
                                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Email address
                                          </label>
                                          <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter email or username"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Password
                                          </label>
                                          <div className="relative">
                                                <input
                                                      id="password"
                                                      type={showPw ? 'text' : 'password'}
                                                      autoComplete="current-password"
                                                      value={password}
                                                      onChange={(e) => setPassword(e.target.value)}
                                                      placeholder="••••••••"
                                                      className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                      required
                                                />
                                                <button
                                                      type="button"
                                                      onClick={() => setShowPw((s) => !s)}
                                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                      aria-label={showPw ? 'Hide password' : 'Show password'}
                                                >
                                                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                          </div>
                                    </div>

                                    <button
                                          type="submit"
                                          disabled={submitting}
                                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors text-sm"
                                    >
                                          {submitting ? (
                                                <>
                                                      <Loader2 size={16} className="animate-spin" />
                                                      Signing in…
                                                </>
                                          ) : (
                                                'Sign In'
                                          )}
                                    </button>
                              </form>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-6">
                              © 2024 Rojgar AI. Admin access only.
                        </p>
                  </div>
            </div>
      )
}

export default AdminLogin
