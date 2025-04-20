// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../api/authService';

// Función auxiliar para verificar si un usuario es staff (admin, vendedor o reponedor)
const isUserStaff = (user) => {
  return user?.is_staff === true;
};

// Función para verificar si un usuario tiene un rol específico
const hasUserRole = (user, roleName) => {
  return user?.groups?.some(group => group.name === roleName) || false;
};

// Función para verificar si un usuario tiene un permiso específico
const hasUserPermission = (user, permission) => {
  if (!user) return false;

  const userPermissions = [];

  // Verificar permisos en grupos
  if (user.groups && Array.isArray(user.groups)) {
    user.groups.forEach(group => {
      if (group.permissions && Array.isArray(group.permissions)) {
        userPermissions.push(...group.permissions);
      }
    });
  }

  // Verificar permisos directos del usuario
  if (user.user_permissions && Array.isArray(user.user_permissions)) {
    userPermissions.push(...user.user_permissions);
  }
  // Verificar si el permiso existe en el array de permisos
  if (Array.isArray(permission)) {
    return permission.some(perm => userPermissions.includes(perm));
  }
  return userPermissions.includes(permission);
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { access, refresh } = await authService.login({ username, password });
      const userProfile = await authService.getProfile(access);
      return {
        tokens: { access, refresh },
        user: userProfile // <- Perfil completo (incluye id, username, is_staff, groups, etc.)
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al iniciar sesión');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await authService.getUserProfile(auth.tokens.access);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al obtener perfil de usuario');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    tokens: {
      access: localStorage.getItem('accessToken') || null,
      refresh: localStorage.getItem('refreshToken') || null,
    },
    isAuthenticated: localStorage.getItem('accessToken') ? true : false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.isAuthenticated = false;
    },
    setCredentials: (state, action) => {
      const { user, tokens } = action.payload;

      if (tokens?.access) localStorage.setItem('accessToken', tokens.access);
      if (tokens?.refresh) localStorage.setItem('refreshToken', tokens.refresh);

      state.user = user;
      state.tokens = tokens;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        // const { user_id, username, is_staff, access, refresh } = action.payload;
        const { tokens, user } = action.payload;

        // Guardar tokens en localStorage
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);

        // localStorage.setItem('accessToken', access);
        // localStorage.setItem('refreshToken', refresh);

        state.loading = false;
        state.isAuthenticated = true;
        state.tokens = tokens;
        state.user = user; // <- ¡Ahora con TODOS los datos del perfil!
        // state.tokens = { access, refresh };
        // // Ahora incluimos is_staff en la información del usuario
        // state.user = { id: user_id, username, is_staff,access };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al iniciar sesión';
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al obtener perfil de usuario';
      });
  }
});

export const { logout, setCredentials } = authSlice.actions;

// Selectores
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsStaff = (state) => isUserStaff(state.auth.user);
export const selectIsAdmin = (state) => hasUserRole(state.auth.user, "Administrador");
export const selectIsVendedor = (state) => hasUserRole(state.auth.user, "Vendedor");
export const selectIsReponedor = (state) => hasUserRole(state.auth.user, "Reponedor");
export const selectHasPermission = (state, permission) => hasUserPermission(state.auth.user, permission);
export const selectAuthTokens = (state) => state.auth.tokens;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;