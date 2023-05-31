import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuth: false,
  userID: 0,
  username: "",
  chatIDs: [],
  chatNames: [],
  token: "",
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.isAuth = action.payload.isAuth
      state.userID = action.payload.userID
      state.username = action.payload.username
      state.chatIDs = action.payload.chatIDs
      state.chatNames = action.payload.chatNames
      state.token = action.payload.token
    },
    logOut: (state) => {
      state = initialState
    }
  },
})
  
export const { setUserInfo, logOut } = userSlice.actions
  
export default userSlice.reducer