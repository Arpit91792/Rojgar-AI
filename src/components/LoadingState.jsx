import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingState = ({ message = 'Loading…' }) => (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">{message}</p>
      </div>
)

export default LoadingState
