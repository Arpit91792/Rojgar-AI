import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

const NotFound = () => (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                  <p className="text-gray-500 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                  </p>
                  <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                        <Home size={18} />
                        Back to Home
                  </Link>
            </div>
      </div>
)

export default NotFound
