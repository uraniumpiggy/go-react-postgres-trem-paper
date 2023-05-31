import React, { useEffect, useRef, useState } from 'react'
import { useCreateChatMutation, useGetUsersListMutation } from '../../api/api'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

export default function CreateChat({close}) {
  const [executeCreateChat, {isSuccess}] = useCreateChatMutation()
  const [fetchUsers] = useGetUsersListMutation()
  const nameInputRef = useRef()
  const usersInputRef = useRef()
  const [usersToAdd, setUsersToAdd] = useState([])
  const [userSuggestions, setUserSuggestion] = useState([])
  const username = useSelector(state => state.user.username)

  const navigate = useNavigate()

  const handleChatCreate = () => {
    const name = nameInputRef.current.value

    if (name === undefined || name === "" || usersToAdd.length === 0) {
      return
    }

    executeCreateChat({
      chat_member_names: usersToAdd,
      name: name,
    }).then(() => {
      navigate(0)
    })
  }

  useEffect(() => {
    if (isSuccess) {
      nameInputRef.current.value = ""
      usersInputRef.current.value = ""
    }
  }, [isSuccess])

  const handleUsernameFieldChange = () => {
    fetchUsers({prefix: usersInputRef.current.value}).then((response) => {
      setUserSuggestion(response.data.usernames)
    })
  }

  const handleRemoveUser = (event, value) => {
    event.stopPropagation()

    let index = usersToAdd.indexOf(value);
    if (index !== -1) {
      setUsersToAdd(items => [
        ...items.slice(0, index),
        ...items.slice(index + 1)
      ])
    }
  }

  const handleAddUser = (event, value) => {
    event.stopPropagation()

    if (usersToAdd.includes(value)) {
      return
    }

    if (value === username) {
      return
    }

    setUsersToAdd(prev => [...prev, value])
  }
  
  return (
    <div className='chat-dialog-alert'>
      <div style={{backgroundColor: "#fff", opacity: 1}} className='p-5'>

        <div className="form-outline mb-4">
          <input type="text" id="form4Example1" className="form-control" ref={nameInputRef}/>
          <label className="form-label" htmlFor="form4Example1">Название чата</label>
        </div>

        <div className="form-outline mb-4">
          <p>Выберите пользователей</p>
          <input type="email" id="form4Example2" className="form-control" onChange={handleUsernameFieldChange} ref={usersInputRef}/>
          <label className="form-label" htmlFor="form4Example2">Имя пользователя</label>
          <ul className="list-group">
            {userSuggestions.filter((value) => value !== username).slice(0, 4).map((value, index) => {
              return <li className="list-group-item" key={index} onClick={(event) => {handleAddUser(event, value)}}>{value}</li>
            })}
          </ul>
        </div>

        <ul className="nav nav-pills nav-fill">
          {usersToAdd.map((value, index) => {
            return <li className='nav-item m-2' key={index} onClick={(event) => {handleRemoveUser(event, value)}}><p className='nav-link active'>{value}</p></li>
          })}
        </ul>
        
        <div className='row mt-4'>
          <button className="btn col-5 btn-primary btn-block mb-2" onClick={handleChatCreate}>Создать</button>
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
