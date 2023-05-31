import axios from "axios"
import { BaseURL } from "./const"
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const login = (credentials) => {
  return axios.post(BaseURL + "/login", credentials)
}

export const register = (credentials) => {
  return axios.post(BaseURL + "/register", credentials)
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BaseURL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState()).user.token
      headers.set('Token', token)

      return headers
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({id, ...credentials}) => ({
        url:'/login',
        method: 'POST',
        body: credentials
      })
    }),
    register: builder.mutation({
      query: ({id, ...credentials}) => ({
        url:'/register',
        method: 'POST',
        body: credentials
      })
    }),
    createChat: builder.mutation({
      query: ({id, ...body}) => ({
        url:'/chats/create',
        method: 'POST',
        body: body
      })
    }),
    getUserChats: builder.mutation({
      query: () => ({
        url:'/chats/get',
        method: 'GET',
      })
    }),
    getChatMessages: builder.mutation({
      query: (args) => {
        const { id, limit, page } = args;
        return {
          url: `/chats/${id}/history?limit=${limit}&page=${page}`,
          method: "GET",
        };
      }
    }),
    deleteChat: builder.mutation({
      query: (args) => {
        const { id } = args;
        return {
          url: `/chats/${id}`,
          method: "DELETE",
        };
      }
    }),
    addUserToChat: builder.mutation({
      query: (args) => {
        const { chatID, username } = args;
        return {
          url: `/chats/${chatID}/${username}`,
          method: "POST",
        };
      }
    }),
    deleteUserFromChat: builder.mutation({
      query: (args) => {
        const { chatID, username } = args;
        return {
          url: `/chats/${chatID}/${username}`,
          method: "DELETE",
        };
      }
    }),
    getUsersList: builder.mutation({
      query: (args) => {
        const { prefix } = args;
        return {
          url:`/users?prefix=${prefix}`,
          method: 'GET',
        };        
      }
    }),
  }),
})

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useCreateChatMutation, 
  useGetUserChatsMutation, 
  useGetChatMessagesMutation,
  useDeleteChatMutation,
  useAddUserToChatMutation,
  useDeleteUserFromChatMutation, 
  useGetUsersListMutation,
} = userApi