import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import type { Persistor } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import cartReducer from './features/cart/cartSlice'
import userReducer from './features/auth/userSlice'
import wishlistReducer from './features/wishlist/wishListSlice'
import reviewReducer from './features/review/reviewSlice'


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
      wishlist: wishlistReducer,
      review: reviewReducer,

    }, middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore redux-persist actions
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
        },
      }),
  })

let clientStore: AppStore | undefined
let clientPersistor: Persistor | undefined

export const getOrCreateStore = () => {
  if (!clientStore) {
    clientStore = makeStore()
  }

  return clientStore
}

export const getOrCreatePersistor = (store: AppStore = getOrCreateStore()) => {
  if (!clientPersistor) {
    clientPersistor = persistStore(store)
  }

  return clientPersistor
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
