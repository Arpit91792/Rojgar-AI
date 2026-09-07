import React from 'react'
import { Link } from 'react-router-dom'

const JobCard = ({ job }) => {
      if (!job) return null

      return (
            <Link
                  to={`/posts/${job.slug || job.id}`}
                  className="block w-full bg-white border-2 border-green-500 rounded-xl px-5 py-4 hover:shadow-md hover:border-green-600 transition-all duration-200 group"
            >
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                        {job.title}
                  </h3>
            </Link>
      )
}

export default JobCard
