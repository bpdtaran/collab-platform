import api from './api';

export const workspaceService = {
  // Get all workspaces for current user
  getWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  // Get single workspace
  getWorkspace: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
  },

  // Create workspace
  createWorkspace: async (workspaceData) => {
    const response = await api.post('/workspaces', workspaceData);
    return response.data;
  },

  // Update workspace
  updateWorkspace: async (workspaceId, updates) => {
    const response = await api.put(`/workspaces/${workspaceId}`, updates);
    return response.data;
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    const response = await api.delete(`/workspaces/${workspaceId}`);
    return response.data;
  },

  // Invite user to workspace
  inviteUser: async (workspaceId, inviteData) => {
    const response = await api.post(`/workspaces/${workspaceId}/invite`, inviteData);
    return response.data;
  },

  // Remove user from workspace
  removeUser: async (workspaceId, userId) => {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (workspaceId, userId, role) => {
    const response = await api.put(`/workspaces/${workspaceId}/members/${userId}`, { role });
    return response.data;
  },
};