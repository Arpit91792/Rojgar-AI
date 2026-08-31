import React from 'react'
import { useParams } from 'react-router-dom'
import AdminPostList from './AdminPostList'
import AdminPostForm from './AdminPostForm'

export const AdminAdmitCardsList = () => (
      <AdminPostList
            title="Admit Cards"
            category="ADMIT_CARD"
            addPath="/admin/admit-cards/add"
            editPathFn={(id) => `/admin/admit-cards/edit/${id}`}
      />
)
export const AdminAdmitCardsAdd = () => <AdminPostForm pathSegment="admit-cards" />
export const AdminAdmitCardsEdit = () => {
      const { id } = useParams()
      return <AdminPostForm pathSegment="admit-cards" postId={id} />
}
