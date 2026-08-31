import React from 'react'
import { Bell } from 'lucide-react'

const AdminNotifications = () => (
      <div className="max-w-3xl space-y-5">
            <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Manage and publish notifications for users</p>
            </div>
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Notification management coming soon.</p>
            </div>
      </div>
)

export default AdminNotifications
