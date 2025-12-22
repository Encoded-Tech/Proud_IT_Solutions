import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import cartReducer from './cart/cartSlice'
import userReducer from './user/userSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'],
}

const persistedCartReducer = persistReducer(persistConfig, cartReducer)


export const makeStore = () =>
  configureStore({
    reducer: {
      cart: persistedCartReducer,
      auth: userReducer,
    }, middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore redux-persist actions
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
        },
      }),
  })

export const persistor = persistStore(makeStore())

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']