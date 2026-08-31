import React from 'react'
import { useParams } from 'react-router-dom'
import AdminPostList from './AdminPostList'
import AdminPostForm from './AdminPostForm'

export const AdminPrivateJobsList = () => (
      <AdminPostList
            title="Private Jobs"
            category="PRIVATE_JOB"
            addPath="/admin/private-jobs/add"
            editPathFn={(id) => `/admin/private-jobs/edit/${id}`}
      />
)
export const AdminPrivateJobsAdd = () => <AdminPostForm pathSegment="private-jobs" />
export const AdminPrivateJobsEdit = () => {
      const { id } = useParams()
      return <AdminPostForm pathSegment="private-jobs" postId={id} />
}
