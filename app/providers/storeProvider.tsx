'use client'
import { AppStore, getOrCreatePersistor, getOrCreateStore } from '@/redux/store'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    storeRef.current = getOrCreateStore()
  }

  const persistorRef = useRef(getOrCreatePersistor(storeRef.current))

   return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  )
}
