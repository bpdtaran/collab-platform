import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { Save, People } from '@mui/icons-material';
import { useDocument } from '../hooks/useDocument';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Document.css';

const Document = () => {
  const { documentId } = useParams();
  const {
    document,
    loading,
    error,
    collaborators,
    updateDocument,
    sendTextChange,
    updateCursor,
  } = useDocument(documentId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const quillRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Initialize editor with document data
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && document) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await updateDocument({ title, content });
          setHasUnsavedChanges(false);
          toast.success('Auto-saved');
        } catch (error) {
          console.error('Auto-save failed:', error);
          toast.error('Auto-save failed');
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, hasUnsavedChanges, document, updateDocument]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (value) => {
    setContent(value);
    setHasUnsavedChanges(true);

    // Send real-time updates
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const selection = editor.getSelection();

      if (selection) {
        updateCursor(selection.index);

        // Get the change details
        const change = editor.getContents(selection.index, selection.length);
        sendTextChange({
          type: 'insert',
          position: selection.index,
          text: change.ops[0]?.insert || '',
          length: selection.length,
        });
      }
    }
  };

  const handleManualSave = async () => {
    if (!document) return;

    setIsSaving(true);
    try {
      await updateDocument({ title, content });
      setHasUnsavedChanges(false);
      toast.success('Document saved');
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('Save failed');
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
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  if (loading) {
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
      {/* Header */}
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
              '& .MuiOutlinedInput-input': { fontSize: '1.5rem', fontWeight: 'bold' }
            }}
          />

          <Box display="flex" alignItems="center" gap={1}>
            {isSaving && <CircularProgress size={20} />}
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleManualSave}
              disabled={!hasUnsavedChanges || isSaving}
            >
              Save
            </Button>

            {/* Collaborators */}
            <Chip
              icon={<People />}
              label={`${collaborators.length} online`}
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Status bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" color="text.secondary">
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            {isSaving && ' - Saving...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version: {document.version}
          </Typography>
        </Box>
      </Paper>

      {/* Editor */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }} elevation={1}>
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="document-editor"
        />
      </Paper>

      {/* Collaborators Panel */}
      <Paper sx={{ p: 2, mt: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Collaborators
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {collaborators.map((collaborator) => (
            <Chip
              key={collaborator.user.id}
              avatar={<Avatar>{collaborator.user.name[0]}</Avatar>}
              label={collaborator.user.name}
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Document;
