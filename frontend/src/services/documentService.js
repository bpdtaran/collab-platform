// src/services/documentService.js
import api from './api';

export const documentService = {
  // Documents in a workspace
  getDocuments: async (workspaceId) => {
    const { data } = await api.get(`/documents/workspace/${workspaceId}`);
    // backend returns { documents: [...] }
    return data.documents;
  },

  // Single document
  getDocument: async (documentId) => {
    const { data } = await api.get(`/documents/${documentId}`);
    // backend returns { document: {...} }
    return data.document;
  },

  // Create document
  createDocument: async (documentData) => {
    const { data } = await api.post('/documents', documentData);
    return data.document;
  },

  // Update document
  updateDocument: async (documentId, updates) => {
    const { data } = await api.put(`/documents/${documentId}`, updates);
    return data.document;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const { data } = await api.delete(`/documents/${documentId}`);
    return data;
  },

  // History
  getDocumentHistory: async (documentId) => {
    const { data } = await api.get(`/documents/${documentId}/history`);
    return data;
  },

  // Search
  searchDocuments: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const { data } = await api.get(`/search?${params}`);
    return data;
  },

  advancedSearch: async (filters) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/search/advanced?${params}`);
    return data;
  },
};