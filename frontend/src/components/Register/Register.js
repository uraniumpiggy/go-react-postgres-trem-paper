import React, { useEffect, useRef, useState } from 'react'
import { useRegisterMutation } from '../../api/api'
import { useNavigate } from 'react-router-dom'
import './Register.css'

export default function Register() {
  const usernameInputRef = useRef()
  const loginInputRef = useRef()
  const passwordInputRef = useRef()
  const [apiError, setApiError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const navigate = useNavigate()

  const [executeRegister, {isSuccess, isError}] = useRegisterMutation()

  const handleRegister = () => {
    if (passwordInputRef.current.value.length < 8) {
      setPasswordError(true)

      setTimeout(() => {
        setPasswordError(false)
      }, 2000)

      return
    }

    executeRegister({
      username: usernameInputRef.current.value,
      login: loginInputRef.current.value,
      password: passwordInputRef.current.value
    })
  }

  useEffect(() => {
    if (isSuccess) {
      navigate("/login")
    }

    if (isError) {
      setApiError(true)

      setTimeout(() => {
        setApiError(false)
      }, 2000)
    }
  }, [isSuccess, isError])

  return (
    <div className="text-center">
      <div className="p-5 bg-image background"></div>

      <div className="card mx-4 mx-md-5 shadow register-card">
        <div className="card-body py-5 px-md-5">

          <div className="row d-flex justify-content-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-5">Зарегистрироваться</h2>
              <div>
                <div className="form-outline mb-4">
                  <input type="text" id="form1" className={`form-control ${apiError ? 'form-error' : ''}`} ref={usernameInputRef}/>
                  <label className="form-label" htmlFor="form1">Имя пользователя</label>
                </div>

                <div className="form-outline mb-4">
                  <input type="email" id="form2" className={`form-control ${apiError ? 'form-error' : ''}`} ref={loginInputRef}/>
                  <label className="form-label" htmlFor="form2">Почта</label>
                </div>

                <div className="form-outline mb-4">
                  <p>Пароль не менее 8 символов</p>
                  <input type="password" id="form3" className={`form-control ${apiError || passwordError ? 'form-error' : ''}`} ref={passwordInputRef}/>
                  <label className="form-label" htmlFor="form3">Пароль</label>
                </div>

                <button type="submit" className="btn btn-primary btn-block mb-4" onClick={handleRegister}>
                  Зарегистрироваться
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
  )
}
