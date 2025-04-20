// Modificación de src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import authReducer from './authSlice';

// Configuración de persistencia para el reducer de autenticación
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'user'] // solo persiste estos campos del estado
};

// Crear el reducer persistente
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Configurar la store con el reducer persistente
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Crear el persistor
export const persistor = persistStore(store);

export default store;