import React, { useEffect, useState } from 'react'
import { useGetUserChatsMutation } from '../../api/api'
import ChatRow from '../ChatRow/ChatRow'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logOut } from '../../store/userSlice' 
import CreateChat from '../CreateChat/CreateChat'

export default function ChatsList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuth = useSelector(state => state.user.isAuth)
  const [execute, {data, isSuccess}] = useGetUserChatsMutation()
  const [chats, setChats] = useState([])
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false)

  useEffect(() => {
    execute()
  }, [])

  useEffect(() => {
    if (!isAuth) {
      navigate("/login")
    }
  }, [isAuth])

  useEffect(() => {
    if (isSuccess) {
      const chatRows = []

      for (let i = 0; i < data.length; i++) {
        chatRows.push(<ChatRow key={i} name={data[i].chat_name} chatID={data[i].chat_id} members={data[i].memeber_names} />)
      }

      setChats(chatRows)
    }

    if (data?.error?.status === 401) {
      navigate("/login")
    }
  }, [isSuccess, data])

  const handleLogOut = () => {
    dispatch(logOut())
    navigate("/login")
  }

  return (
    <div>
      <div className="row justify-content-md-center">
        <div style={{backgroundColor: "#eee"}} className="col-md-6">
          <div className="row d-flex justify-content-center">
            <div className="card vh-100 p-0" id="chat2">
              <div className="card-header d-flex justify-content-between adivgn-items-center p-3">
                <h5 className="mb-0 ">Мессенджер</h5>
                <div>
                  <button type="button" className="btn btn-primary btn-sm" data-mdb-ripple-color="dark" onClick={() => {setIsCreateChatOpen(true)}}>Добавить чат</button>
                  <button type="button" className="btn ms-3 btn-primary btn-sm" data-mdb-ripple-color="dark" onClick={handleLogOut}>Выйти</button>
                </div>
              </div>

              <div className="card-body d-flex flex-column" data-mdb-perfect-scrollbar="true" style={{position: "relative", overflowX: "scroll", height: "400px"}}>
                {chats}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCreateChatOpen && <CreateChat close={() => {setIsCreateChatOpen(false)}}/>}
    </div>
  )
}
