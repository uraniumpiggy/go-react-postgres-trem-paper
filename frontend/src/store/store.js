import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import userReducer from './userSlice'
import { userApi } from '../api/api'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    userApi.reducerPath
  ]
}

const persistedReducer = persistReducer(persistConfig, userReducer)

export const store = configureStore({
  reducer: {
    user: persistedReducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(userApi.middleware),
})

export const persistor = persistStore(store)