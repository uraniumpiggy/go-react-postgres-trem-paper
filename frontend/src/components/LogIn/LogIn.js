import React, { useEffect, useRef } from 'react'
import { useLoginMutation } from '../../api/api'
import { useDispatch } from 'react-redux'
import { setUserInfo } from '../../store/userSlice'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

export default function LogIn() {
  const loginInputRef = useRef()
  const passwordInputRef = useRef()

  const [execute, {data, isSuccess, isError}] = useLoginMutation()
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const handleLogin = () => {
    execute({
      login: loginInputRef.current.value,
      password: passwordInputRef.current.value
    })
  }

  useEffect(() => {

    if (isSuccess) {
      dispatch(setUserInfo({
        isAuth: true,
        userID: data.user_id,
        username: data.username,
        chatIDs: data.chat_ids,
        chatNames: data.chat_names,
        token: data.token
      }))

      loginInputRef.current.value = ""
      passwordInputRef.current.value = ""

      navigate("/")
    }

  }, [isSuccess, isError])

  return (
    <div className="vh-100">
      <div className={`container-fluid h-custom`}>
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-9 col-lg-6 col-xl-5">
            <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="img-fluid" alt="image"/>
          </div>
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <div>  
              <div className="form-outline mb-4">
                <input type="email" id="form1" className={`form-control form-control-lg ${isError ? 'form-error' : ''}`}
                  placeholder="Введите почту" ref={loginInputRef}/>
                <label className="form-label" htmlFor="form1">Почта</label>
              </div>

              <div className="form-outline mb-3">
                <input type="password" id="form2" className={`form-control form-control-lg ${isError ? 'form-error' : ''}`}
                  placeholder="Введите пароль" ref={passwordInputRef}/>
                <label className="form-label" htmlFor="form2">Пароль</label>
              </div>

              <div className="text-center text-lg-start mt-4 pt-2">
                <button type="button" className="btn btn-primary btn-lg"
                  style={{paddingLeft: "2.5rem", paddingRight: "2.5rem"}} onClick={handleLogin}>Войти</button>
                <p className="small fw-bold mt-2 pt-1 mb-0">Нет аккаунта? <Link to={"/register"}
                    className="link-danger">Зарегистрироваться</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
