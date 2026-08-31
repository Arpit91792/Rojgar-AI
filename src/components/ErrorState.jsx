import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <AlertTriangle className="w-12 h-12 mb-3 text-red-400" />
            <p className="text-sm mb-4 text-center max-w-xs">{message}</p>
            {onRetry && (
                  <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                        <RefreshCw size={15} />
                        Try Again
                  </button>
            )}
      </div>
)

export default ErrorState
