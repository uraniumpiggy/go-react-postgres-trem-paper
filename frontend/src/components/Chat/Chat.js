import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetChatMessagesMutation } from '../../api/api';
import SingleMessage from '../SingleMessage/SingleMessage';
import ChatSettings from '../ChatSettings/ChatSettings';
import './Chat.css'
import { BaseURL } from '../../api/const';

export default function Chat({}) {
  const {id} = useParams()
  const {state} = useLocation();
  const { chatName, members } = state;

  const navigate = useNavigate()

  const token = useSelector(state => state.user.token)

  const [execute] = useGetChatMessagesMutation()

  const [messages, setMessages] = useState([])

  const pageRef = useRef(1)
  const inputRef = useRef(null)
  const messagesFieldRef = useRef(null)
  const observerTarget = useRef(null);
  
  const socket = new WebSocket(`ws://localhost:8089/ws`)

  const [showSettings, setShowSettings] = useState(false)


  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [ entry ] = entries
        if (entry.isIntersecting) {
          fetchData()
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
  
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget])

  socket.onopen = () => {
    socket.send(id + " " + token)
    socket.onmessage = (msg) => {
      const getMessage = JSON.parse(msg.data)
      setMessages(prev => [<SingleMessage 
        key={Math.random()} 
        userID={getMessage.user_id} 
        username={getMessage.username} 
        body={getMessage.body} 
        createdAt={getMessage.created_at}
      />, ...prev])
      
      messagesFieldRef.current.scrollTop = 0
    };
  };

  const handleSendMessage = () => {
    socket.send(inputRef.current.value)
    inputRef.current.value = ""
  }

  const fetchData = () => {
    execute({
      id: id,
      limit: 5,
      page: pageRef.current,
    }).then((response) => {
      if (response === undefined) {
        return
      }
      if (response.error?.status === 401) {
        navigate("/login")
      }
      const data = response.data
      const currentMessages = []
      if (data.length !== 0) {
        pageRef.current += 1
      }
      for (let i = 0; i < data.length; i++) {
        currentMessages.push(<SingleMessage 
          key={Math.random()} 
          userID={data[i].user_id} 
          username={data[i].username} 
          body={data[i].body} 
          createdAt={data[i].created_at}
        />)
      }
      
      setMessages(prev => [...prev, ...currentMessages])
    })
  }

  useEffect(() => {
    return () => {
      socket.close()
    }
  }, [])

  return (
    <div>
      <div className="row justify-content-md-center">
        <div style={{backgroundColor: "#eee"}} className="col-md-6">
          <div className="row d-flex justify-content-center">
            <div className="card vh-100 p-0" id="chat2">
              <div className="card-header d-flex justify-content-between adivgn-items-center p-3">
                <h5 className="mb-0">{chatName}</h5>
                <button type="button" className="btn btn-primary btn-sm" data-mdb-ripple-color="dark" onClick={() => {setShowSettings(true)}}>Настройки чата</button>
              </div>

              <div className="card-body d-flex flex-column-reverse" data-mdb-perfect-scrollbar="true" style={{position: "relative", overflowX: "scroll", height: "400px"}} ref={messagesFieldRef}>
                {messages}
                <div ref={observerTarget}></div>
              </div>

              <div className="p-3">
                <div className="bg-white">
                  <div className="form-outdivne">
                    <textarea className="form-control" id="textAreaExample2" rows="4" ref={inputRef}></textarea>
                    <label className="form-label" htmlFor="textAreaExample2">Сообщение</label>
                  </div>
                </div>
                <button type="button" className="btn btn-info btn-rounded float-end" onClick={handleSendMessage}>Отправить</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    {showSettings && <ChatSettings close={() => setShowSettings(false)} members={members}/>}
    </div>
  )
}
