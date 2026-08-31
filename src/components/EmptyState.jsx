import React from 'react'
import { Inbox } from 'lucide-react'

const EmptyState = ({ message = 'No data found.', action }) => (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Inbox className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm mb-4">{message}</p>
            {action}
      </div>
)

export default EmptyState
