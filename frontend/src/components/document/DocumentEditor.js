import React, { useState, useRef, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import QuillCursors from 'quill-cursors';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useDocument } from '../../hooks/useDocument';
import { useSocket } from '../../contexts/SocketContext';
import CollaboratorList from './CollaboratorList';
import './DocumentEditor.css';

// register quill-cursors once
if (typeof window !== 'undefined' && Quill && !Quill.imports['modules/cursors']) {
  Quill.register('modules/cursors', QuillCursors);
}
const Delta = Quill?.import?.('delta') || null;

// deterministic color per user id
function colorFor(id) {
  let hash = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 80%, 50%)`;
}

const DocumentEditor = ({ documentId }) => {
  const {
    document,
    loading,
    error,
    collaborators,
    updateDocument,
    updateCursor,
    localContent,
    setLocalContent,
    localVersion,
    setLocalVersion,
  } = useDocument(documentId);

  const { socketService } = useSocket();

  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const quillRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const cursorsRef = useRef(null);

  // hydrate once
  useEffect(() => {
    if (document && !isInitialized) {
      setTitle(document.title || '');
      setLocalContent(document.content || '');
      setIsInitialized(true);
      setHasUnsavedChanges(false);
    }
  }, [document, isInitialized, setLocalContent]);

  // attach quill-cursors + selection listener
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    const cursors = quill.getModule('cursors');
    cursorsRef.current = cursors;

    const onSelection = (range) => {
      if (range && typeof range.index === 'number') {
        updateCursor(range.index);
      }
    };
    quill.on('selection-change', onSelection);

    return () => {
      quill.off('selection-change', onSelection);
    };
  }, [updateCursor]);

  // render/update collaborator cursors
  useEffect(() => {
    if (!cursorsRef.current || !isInitialized) return;
    const cursors = cursorsRef.current;

    collaborators.forEach((c) => {
      const id = String(c.user.id);
      const name = c.user.name || 'User';
      const color = colorFor(id);
      const index = c.cursorPosition || 0;

      if (!cursors.cursors()[id]) {
        cursors.createCursor(id, name, color);
      } else {
        const existing = cursors.cursors()[id];
        if (existing && existing.color !== color) {
          cursors.removeCursor(id);
          cursors.createCursor(id, name, color);
        }
      }
      cursors.moveCursor(id, { index, length: 0 });
    });

    // cleanup stale cursors
    const currentIds = new Set(collaborators.map((c) => String(c.user.id)));
    Object.keys(cursors.cursors()).forEach((id) => {
      if (!currentIds.has(id)) cursors.removeCursor(id);
    });
  }, [collaborators, isInitialized]);

  // socket handlers for deltas
  useEffect(() => {
    if (!socketService.isConnected()) return;
    const onDelta = (data) => {
      const quill = quillRef.current?.getEditor?.();
      if (!quill || !data?.delta) return;
      // apply remote delta silently
      quill.updateContents(data.delta, 'silent');
      setLocalVersion(data.version);
    };
    const onAck = (data) => {
      if (data?.version !== undefined) setLocalVersion(data.version);
    };
    socketService.on('delta-update', onDelta);
    socketService.on('doc:ack', onAck);
    return () => {
      socketService.off('delta-update', onDelta);
      socketService.off('doc:ack', onAck);
    };
  }, [socketService, setLocalVersion]);

  // auto-save
  useEffect(() => {
    if (!document || !hasUnsavedChanges) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateDocument({ title, content: localContent });
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error('Auto-save failed:', e?.response?.data?.message || e);
      } finally {
        setIsSaving(false);
      }
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, localContent, hasUnsavedChanges, document, updateDocument]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  // send minimal delta + html snapshot to server
  const handleContentChange = (newContent, delta, source, editor) => {
    if (source !== 'user') return;

    setLocalContent(newContent);
    setHasUnsavedChanges(true);

    const selection = editor.getSelection();
    if (selection && typeof selection.index === 'number') {
      updateCursor(selection.index);
    }

    // only send meaningful changes
    if (delta && Array.isArray(delta.ops) && delta.ops.length > 0) {
      const html = editor.getHTML ? editor.getHTML() : newContent;
      socketService.sendDelta(documentId, delta.ops, localVersion, html);
      // server will ack with new version; we don’t apply our delta again
    }
  };

  const handleManualSave = async () => {
    if (!document) return;
    setIsSaving(true);
    try {
      await updateDocument({ title, content: localContent });
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error('Manual save failed:', e?.response?.data?.message || e);
    } finally {
      setIsSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
    clipboard: { matchVisual: false },
    cursors: { hideDelay: 3000, hideSpeed: 0, transformOnTextChange: true },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
  ];

  if (loading && !isInitialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  if (!document) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Document not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <TextField
            fullWidth
            variant="outlined"
            value={title}
            onChange={handleTitleChange}
            placeholder="Document title..."
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiOutlinedInput-input': { fontSize: '1.5rem', fontWeight: 'bold' },
            }}
          />
          <Box display="flex" alignItems="center" gap={1}>
            {isSaving && <CircularProgress size={20} />}
            <Button variant="contained" startIcon={<Save />} onClick={handleManualSave} disabled={!hasUnsavedChanges || isSaving}>
              Save
            </Button>
            <CollaboratorList collaborators={collaborators} />
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" color="text.secondary">
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            {isSaving && ' — Saving...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">Version: {localVersion}</Typography>
        </Box>
      </Paper>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }} elevation={1}>
        <ReactQuill
          ref={quillRef}
          value={localContent}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          className="document-editor"
        />
      </Paper>
    </Box>
  );
};

export default DocumentEditor;