import React from 'react'
import { useSelector } from 'react-redux'
import './SingleMessage.css'
import moment from 'moment'

export default function SingleMessage({createdAt, userID, username, body}) {
  const currentUserID = useSelector(state => state.user.userID)

  const createdAtDate = new Date(Date.parse(createdAt))
  const dateString = moment(createdAtDate).format("yyyy/mm/DD hh:mm")

  return (
    <div className="d-flex justify-content-between mt-2">
      <div className={`card ${currentUserID === userID ? 'message-mine' : ''}`}>
        <div className="card-header d-flex justify-content-between">
          <p className="fw-bold mb-0 col-sm-6">{username}</p>
        </div>
        <div className="card-body">
          <p className="mb-0">{body}</p>
          <p className="small mb-0 rounded-3 text-muted d-flex justify-content-end">{dateString}</p>
        </div>
      </div>
    </div>
  )
}
