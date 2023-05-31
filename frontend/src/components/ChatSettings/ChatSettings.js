import React, { useEffect, useRef, useState } from 'react'
import { useAddUserToChatMutation, useDeleteChatMutation, useDeleteUserFromChatMutation, useGetUsersListMutation } from '../../api/api'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

export default function ChatSettings({close, members}) {
  const {id} = useParams()
  const [fetchUsers] = useGetUsersListMutation()
  const [addUser, {isSuccess: addUserSuccess}] = useAddUserToChatMutation()
  const [removeUser, {isSuccess: removeUserSuccess}] = useDeleteUserFromChatMutation()
  const [deleteChat, {isSuccess: deleteChatSuccess}] = useDeleteChatMutation()
  const usersInputRef = useRef()
  const [userSuggestions, setUserSuggestion] = useState([])
  const username = useSelector(state => state.user.username)
  const navigate = useNavigate()

  const handleUsernameFieldChange = () => {
    fetchUsers({prefix: usersInputRef.current.value}).then((response) => {
      setUserSuggestion(response.data.usernames)
    })
  }

  const handleRemoveUser = (event, username) => {
    event.stopPropagation()

    removeUser({
      chatID: id,
      username: username,
    })
  }

  const handleDeleteChat = (event) => {
    event.stopPropagation()

    deleteChat({
      id: id
    })
  }

  const handleAddUser = (event, value) => {
    event.stopPropagation()

    addUser({
      chatID: id,
      username: value,
    })
  }

  useEffect(() => {
    if (removeUserSuccess || addUserSuccess || deleteChatSuccess) {
      navigate("/")
    }
  }, [removeUserSuccess, addUserSuccess, deleteChatSuccess, navigate])
  
  return (
    <div className='chat-dialog-alert'>
      <div style={{backgroundColor: "#fff", opacity: 1}} className='p-5'>

        <div className="form-outline mb-4">
          <p>Пользователи чата:</p>
          {members !== undefined && <ul className="list-group">
            {members.map((value, index) => {
              return <li className="list-group-item d-flex" key={index}>
                <p className="p-0 m-0 flex-grow-1">{value}</p> 
                <button className="btn btn-outline-danger" onClick={(event) => {handleRemoveUser(event, value)}}>
                  {value === username ? 'Выйти': 'Удалить'}
                </button>
              </li>
            })}
          </ul>}
        </div>

        <div className="form-outline mb-4">
          <p>Выберите пользователей</p>
          <input type="email" id="form4Example2" className="form-control" onChange={handleUsernameFieldChange} ref={usersInputRef}/>
          <label className="form-label" htmlFor="form4Example2">Имя пользователя</label>
          <ul className="list-group">
            {userSuggestions.filter((value) => value !== username).filter(value => !members.includes(value)).slice(0, 4).map((value, index) => {
              return <li className="list-group-item d-flex" key={index}>
                <p className="p-0 m-0 flex-grow-1">{value}</p> 
                <button className="btn btn-outline-success" onClick={(event) => {handleAddUser(event, value)}}>
                  Добавить
                </button>
              </li>
            })}
          </ul>
        </div>
        
        <div className='row mt-4'>
          <button className="btn col-5 btn-danger btn-block mb-2" onClick={(event) => {
            handleDeleteChat(event)
          }}>Удалить чат</button>
          <div className='col-2'></div>
          <button className="btn col-5 btn-primary btn-block mb-2" onClick={(event) => {
            event.stopPropagation()
            close()
          }}>Отмена</button>
        </div>
      </div>
    </div>
  )
}
