import apiClient from './axiosConfig';

export const userService = {
  // Clientes
  getClientes: async (params = {}) => {
    try {
      const response = await apiClient.get('/usuarios/clientes/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  getClienteById: async (id) => {
    try {
      const response = await apiClient.get(`/usuarios/clientes/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener cliente ${id}:`, error);
      throw error;
    }
  },

  createCliente: async (clienteData) => {
    try {
      const response = await apiClient.post('/usuarios/clientes/', clienteData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  updateCliente: async (id, clienteData) => {
    try {
      const response = await apiClient.put(`/usuarios/clientes/${id}/`, clienteData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar cliente ${id}:`, error);
      throw error;
    }
  },

  deleteCliente: async (id) => {
    try {
      const response = await apiClient.delete(`/usuarios/clientes/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar cliente ${id}:`, error);
      throw error;
    }
  },

  // Personal
  getPersonal: async (params = {}) => {
    try {
      const response = await apiClient.get('/usuarios/personal/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener personal:', error);
      throw error;
    }
  },

  getPersonalById: async (id) => {
    try {
      const response = await apiClient.get(`/usuarios/personal/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener personal ${id}:`, error);
      throw error;
    }
  },

  createPersonal: async (personalData) => {
    try {
      const response = await apiClient.post('/usuarios/personal/', personalData);
      return response.data;
    } catch (error) {
      console.error('Error al crear personal:', error);
      throw error;
    }
  },

  updatePersonal: async (id, personalData) => {
    try {
      const response = await apiClient.put(`/usuarios/personal/${id}/`, personalData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar personal ${id}:`, error);
      throw error;
    }
  },

  deletePersonal: async (id) => {
    try {
      const response = await apiClient.delete(`/usuarios/personal/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar personal ${id}:`, error);
      throw error;
    }
  },

  // Usuarios Administradores
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/users/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/admin/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/admin/users/${id}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  },

  updateUserStatus: async (id, isActive) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/status/`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado del usuario ${id}:`, error);
      throw error;
    }
  },

  resetUserPassword: async (id) => {
    try {
      const response = await apiClient.post(`/admin/users/${id}/reset-password/`);
      return response.data;
    } catch (error) {
      console.error(`Error al resetear contraseña del usuario ${id}:`, error);
      throw error;
    }
  },

  // Grupos
  getGroups: async () => {
    try {
      const response = await apiClient.get('/admin/groups/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      throw error;
    }
  },

  getGroupById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener grupo ${id}:`, error);
      throw error;
    }
  },

  createGroup: async (groupData) => {
    try {
      const response = await apiClient.post('/admin/groups/', groupData);
      return response.data;
    } catch (error) {
      console.error('Error al crear grupo:', error);
      throw error;
    }
  },

  updateGroup: async (id, groupData) => {
    try {
      const response = await apiClient.put(`/admin/groups/${id}/`, groupData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar grupo ${id}:`, error);
      throw error;
    }
  },

  deleteGroup: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/groups/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar grupo ${id}:`, error);
      throw error;
    }
  },

  // Permisos
  getPermissions: async () => {
    try {
      const response = await apiClient.get('/admin/permissions/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  },

  // Usuarios en un grupo
  getUsersInGroup: async (groupId) => {
    try {
      const response = await apiClient.get(`/admin/groups/${groupId}/users/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuarios del grupo ${groupId}:`, error);
      throw error;
    }
  },

  // Asignar grupos a un usuario
  assignGroupsToUser: async (userId, groupIds) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/groups/`, { groups: groupIds });
      return response.data;
    } catch (error) {
      console.error(`Error al asignar grupos al usuario ${userId}:`, error);
      throw error;
    }
  }
};

export default userService;