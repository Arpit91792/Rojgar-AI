import React from 'react'
import { useParams } from 'react-router-dom'
import AdminPostList from './AdminPostList'
import AdminPostForm from './AdminPostForm'

export const AdminGovernmentJobsList = () => (
      <AdminPostList
            title="Government Jobs"
            category="GOVERNMENT_JOB"
            addPath="/admin/government-jobs/add"
            editPathFn={(id) => `/admin/government-jobs/edit/${id}`}
      />
)
export const AdminGovernmentJobsAdd = () => <AdminPostForm pathSegment="government-jobs" />
export const AdminGovernmentJobsEdit = () => {
      const { id } = useParams()
      return <AdminPostForm pathSegment="government-jobs" postId={id} />
}
