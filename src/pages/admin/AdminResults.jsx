import React from 'react'
import { useParams } from 'react-router-dom'
import AdminPostList from './AdminPostList'
import AdminPostForm from './AdminPostForm'

export const AdminResultsList = () => (
      <AdminPostList
            title="Results"
            category="RESULT"
            addPath="/admin/results/add"
            editPathFn={(id) => `/admin/results/edit/${id}`}
      />
)
export const AdminResultsAdd = () => <AdminPostForm pathSegment="results" />
export const AdminResultsEdit = () => {
      const { id } = useParams()
      return <AdminPostForm pathSegment="results" postId={id} />
}
