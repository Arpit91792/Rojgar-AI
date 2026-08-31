import React from 'react'
import { useParams } from 'react-router-dom'
import AdminPostList from './AdminPostList'
import AdminPostForm from './AdminPostForm'

export const AdminTimeTableList = () => (
      <AdminPostList
            title="Time Table"
            category="TIME_TABLE"
            addPath="/admin/time-table/add"
            editPathFn={(id) => `/admin/time-table/edit/${id}`}
      />
)
export const AdminTimeTableAdd = () => <AdminPostForm pathSegment="time-table" />
export const AdminTimeTableEdit = () => {
      const { id } = useParams()
      return <AdminPostForm pathSegment="time-table" postId={id} />
}
