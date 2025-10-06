// frontend/src/api/workspaces.js
import { api } from './client';

// Helper to normalize the workspace object shape from the backend for the dashboard list
const normalizeWorkspaceForList = (ws) => ({
  id: ws.id,
  name: ws.name,
  description: ws.description || '',
  members: Array.isArray(ws.members) ? ws.members.length : (ws.members ?? 0),
  documents: typeof ws.documents === 'number' ? ws.documents : 0,
  starred: false, // You can add logic for this later if needed
});

/**
 * Fetches all workspaces for the current user.
 * GET /api/workspaces
 */
export async function fetchWorkspaces() {
  const { data } = await api.get('/workspaces');
  return (data?.workspaces || []).map(normalizeWorkspaceForList);
}

/**
 * Creates a new workspace.
 * POST /api/workspaces
 * @param {object} payload - { name: string, description?: string }
 */
export async function createWorkspace(payload) {
  const { data } = await api.post('/workspaces', payload);
  const ws = data?.workspace || data;
  return normalizeWorkspaceForList(ws);
}

/**
 * Fetches a single workspace by its ID.
 * GET /api/workspaces/:id
 * @param {string} workspaceId - The ID of the workspace to fetch.
 */
export async function fetchWorkspaceById(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}`);
  // Returns the detailed, non-normalized workspace object for the workspace page
  return data.workspace;
}

/**
 * Fetches all members for a given workspace.
 * GET /api/workspaces/:id/members
 * @param {string} workspaceId - The ID of the workspace.
 */
export async function fetchWorkspaceMembers(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}/members`);
  return data.members || [];
}

/**
 * Invites a new user to a workspace.
 * POST /api/workspaces/:id/invite
 * @param {string} workspaceId - The ID of the workspace.
 * @param {object} payload - { email: string, role: string }
 */
export async function inviteWorkspaceMember(workspaceId, payload) {
  const { data } = await api.post(`/workspaces/${workspaceId}/invite`, payload);
  return data;
}

/**
 * Removes a member from a workspace.
 * DELETE /api/workspaces/:id/members/:userId
 * @param {string} workspaceId - The ID of the workspace.
 * @param {string} userId - The ID of the user to remove.
 */
export async function removeWorkspaceMember(workspaceId, userId) {
  const { data } = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  return data;
}