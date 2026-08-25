import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Friend, FriendRequest, User } from './types'

export const friendsApi = createApi({
  reducerPath: 'friendsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/friends',
    credentials: 'include',
  }),
  tagTypes: ['Friend', 'FriendRequest'],
  endpoints: (builder) => ({
    getFriends: builder.query<Friend[], void>({
      query: () => '/',
      providesTags: ['Friend'],
    }),
    getIncomingRequests: builder.query<FriendRequest[], void>({
      query: () => '/requests',
      providesTags: ['FriendRequest'],
    }),
    getSentRequests: builder.query<FriendRequest[], void>({
      query: () => '/requests/sent',
      providesTags: ['FriendRequest'],
    }),
    sendRequest: builder.mutation<FriendRequest, { username: string }>({
      query: (body) => ({ url: '/request', method: 'POST', body }),
      invalidatesTags: ['FriendRequest'],
    }),
    acceptRequest: builder.mutation<void, string>({
      query: (id) => ({ url: `/requests/${id}/accept`, method: 'POST' }),
      invalidatesTags: ['Friend', 'FriendRequest'],
    }),
    declineRequest: builder.mutation<void, string>({
      query: (id) => ({ url: `/requests/${id}/decline`, method: 'POST' }),
      invalidatesTags: ['FriendRequest'],
    }),
    cancelRequest: builder.mutation<void, string>({
      query: (id) => ({ url: `/requests/${id}`, method: 'DELETE' }),
      invalidatesTags: ['FriendRequest'],
    }),
    removeFriend: builder.mutation<void, string>({
      query: (friendId) => ({ url: `/${friendId}`, method: 'DELETE' }),
      invalidatesTags: ['Friend'],
    }),
    searchUsers: builder.query<User[], string>({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
      providesTags: (_result, _error, q) => [{ type: 'FriendRequest', id: `search-${q}` }],
    }),
  }),
})

export const {
  useGetFriendsQuery,
  useGetIncomingRequestsQuery,
  useGetSentRequestsQuery,
  useSendRequestMutation,
  useAcceptRequestMutation,
  useDeclineRequestMutation,
  useCancelRequestMutation,
  useRemoveFriendMutation,
  useSearchUsersQuery,
} = friendsApi