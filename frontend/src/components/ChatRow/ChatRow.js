import React from 'react'
import './ChatRow.css'
import { useNavigate } from 'react-router-dom'

export default function ChatRow({name, chatID, members}) {
  const navigate = useNavigate()
  const moveToChat = () => {
    navigate(`chats/${chatID}`, { state: {chatName: name, members: members} })
  }

  const chatMemebers = members.join(", ")

  return (
    <div className="p-2 border-bottom" onClick={moveToChat}>
      <div className="d-flex flex-row">
        <div className="pt-1">
          <p className="fw-bold mb-0">{`Чат: ${name}`}</p>
          <p className="small text-muted">{`Участники: ${chatMemebers}`}</p>
        </div>
      </div>
    </div>
  )
}
