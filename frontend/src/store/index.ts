import { configureStore } from '@reduxjs/toolkit'
import { friendsApi } from './api/friendsApi'

export const store = configureStore({
  reducer: {
    [friendsApi.reducerPath]: friendsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(friendsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch