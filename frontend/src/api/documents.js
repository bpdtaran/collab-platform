// src/api/documents.js
import { api } from './client';

const normalizeDoc = (doc, workspaceId) => ({
  id: doc.id,
  title: doc.title,
  workspaceId: workspaceId ?? doc.workspaceId ?? null,
  updatedAt: doc.updatedAt || new Date().toISOString(),
  createdBy: doc.createdBy || { name: 'You' },
});

export async function fetchDocumentsByWorkspace(workspaceId) {
  const { data } = await api.get(`/documents/workspace/${workspaceId}`);
  return (data?.documents || []).map((d) => normalizeDoc(d, workspaceId));
}

export async function createDocument(payload) {
  const { data } = await api.post('/documents', payload);
  const d = data?.document || data;
  return normalizeDoc(d, d.workspaceId);
}

export async function updateDocument(documentId, payload) {
  // payload will be an object like { title: 'New Name' }
  const { data } = await api.put(`/documents/${documentId}`, payload);
  const d = data?.document || data;
  return normalizeDoc(d);
}

export async function deleteDocument(documentId) {
  await api.delete(`/documents/${documentId}`);
  return true; // Indicate success
}