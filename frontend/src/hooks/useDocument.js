// src/hooks/useDocument.js
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { documentService } from '../services/documentService';
import toast from 'react-hot-toast';

export const useDocument = (documentId) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [localContent, setLocalContent] = useState('');
  const [localVersion, setLocalVersion] = useState(0);
  const { socketService } = useSocket();

  // Initial load
  useEffect(() => {
    if (!documentId) return;

    const loadDocument = async () => {
      try {
        setLoading(true);
        const doc = await documentService.getDocument(documentId); // unwrapped
        setDocument(doc);
        setLocalContent(doc.content || '');
        setLocalVersion(doc.version || 0);
        setCollaborators(doc.collaborators || []);
        setError(null);
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to load document';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  // Socket events
  useEffect(() => {
    if (!documentId || !socketService.isConnected()) return;

    socketService.joinDocument(documentId);

    const handleTextUpdate = (data) => {
      // Only apply what server tells us; don't blow away title/other fields
      setDocument((prev) => (prev ? { ...prev, content: data.content, version: data.version } : prev));
      setLocalContent(data.content);
      setLocalVersion(data.version);
    };

    const handleCollaboratorJoined = (data) => {
      setCollaborators((prev) => {
        const exists = prev.find((c) => c.user.id === data.user.id);
        if (exists) return prev;
        return [...prev, { user: data.user, cursorPosition: data.cursorPosition || 0 }];
      });
    };

    const handleCollaboratorLeft = (data) => {
      setCollaborators((prev) => prev.filter((c) => c.user.id !== data.userId));
    };

    const handleCursorUpdate = (data) => {
      setCollaborators((prev) =>
        prev.map((collab) =>
          collab.user.id === data.userId ? { ...collab, cursorPosition: data.position } : collab
        )
      );
    };

    const handleVersionConflict = async () => {
      // Don’t overwrite local content; just update version so next save succeeds
      toast.error('Version conflict. Retrying save…');
      try {
        const fresh = await documentService.getDocument(documentId);
        setDocument((prev) => (prev ? { ...prev, version: fresh.version } : fresh));
        setLocalVersion(fresh.version);
      } catch {
        // ignore
      }
    };

    socketService.on('text-update', handleTextUpdate);
    socketService.on('collaborator-joined', handleCollaboratorJoined);
    socketService.on('collaborator-left', handleCollaboratorLeft);
    socketService.on('cursor-update', handleCursorUpdate);
    socketService.on('version-conflict', handleVersionConflict);

    return () => {
      socketService.leaveDocument(documentId);
      socketService.off('text-update', handleTextUpdate);
      socketService.off('collaborator-joined', handleCollaboratorJoined);
      socketService.off('collaborator-left', handleCollaboratorLeft);
      socketService.off('cursor-update', handleCursorUpdate);
      socketService.off('version-conflict', handleVersionConflict);
    };
  }, [documentId, socketService]);

  // Save document (with version)
  const updateDocument = useCallback(
    async (updates) => {
      if (!document) return;
      const payload = { ...updates, version: localVersion };
      const updatedDoc = await documentService.updateDocument(documentId, payload); // unwrapped
      setDocument((prev) => (prev ? { ...prev, ...updatedDoc } : updatedDoc));
      setLocalVersion(updatedDoc.version);
      return updatedDoc;
    },
    [documentId, document, localVersion]
  );

  // NOTE: disabled sending full HTML every keystroke
  const sendTextChange = useCallback(
    (changes) => {
      if (socketService.isConnected() && document) {
        // Implement proper delta later. Avoid sending entire HTML as insert.
        // socketService.sendTextChange(documentId, changes, localVersion);
      }
    },
    [documentId, document, localVersion, socketService]
  );

  const updateCursor = useCallback(
    (position) => {
      if (socketService.isConnected() && documentId) {
        socketService.updateCursor(documentId, position);
      }
    },
    [documentId, socketService]
  );

  return {
    document,
    loading,
    error,
    collaborators,
    updateDocument,
    sendTextChange,
    updateCursor,
    localContent,
    setLocalContent,
    localVersion,
    setLocalVersion,
  };
};