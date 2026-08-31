import React from 'react'
import { useParams } from 'react-router-dom'
import AdminPostList from './AdminPostList'
import AdminPostForm from './AdminPostForm'

export const AdminInternshipsList = () => (
      <AdminPostList
            title="Internships"
            category="INTERNSHIP"
            addPath="/admin/internships/add"
            editPathFn={(id) => `/admin/internships/edit/${id}`}
      />
)
export const AdminInternshipsAdd = () => <AdminPostForm pathSegment="internships" />
export const AdminInternshipsEdit = () => {
      const { id } = useParams()
      return <AdminPostForm pathSegment="internships" postId={id} />
}
