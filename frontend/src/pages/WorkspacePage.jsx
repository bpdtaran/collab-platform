// frontend/src/pages/WorkspacePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Grid, Card, CardContent, Button, CircularProgress, Paper, Chip } from '@mui/material';
import { Folder, Description, Add } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { fetchWorkspaceById } from '../api/workspaces'; // We will add this function
import { fetchDocumentsByWorkspace, createDocument } from '../api/documents';

// This is a placeholder for your Document Card component
function DocumentCard({ document, onOpen }) {
  return (
    <Card sx={{ cursor: 'pointer', height: '100%', borderRadius: 3, '&:hover': { boxShadow: 6 } }} onClick={() => onOpen(document.id)}>
      <CardContent>
        <Description sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom noWrap>{document.title}</Typography>
        <Typography variant="body2" color="text.secondary">Updated recently</Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>By {document.createdBy?.name || 'You'}</Typography>
      </CardContent>
    </Card>
  );
}

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [wsData, docsData] = await Promise.all([
          fetchWorkspaceById(workspaceId),
          fetchDocumentsByWorkspace(workspaceId),
        ]);
        setWorkspace(wsData);
        setDocuments(docsData);
      } catch (error) {
        toast.error('Failed to load workspace data.');
        navigate('/dashboard'); // Redirect if workspace not found or no access
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [workspaceId, navigate]);

  const handleCreateDocument = async () => {
    const title = window.prompt('Enter new document title:');
    if (title && title.trim()) {
      try {
        const newDoc = await createDocument({ title: title.trim(), workspaceId });
        setDocuments(prev => [newDoc, ...prev]);
        toast.success('Document created!');
        navigate(`/document/${newDoc.id}`);
      } catch (error) {
        toast.error('Failed to create document.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!workspace) {
    return <Typography>Workspace not found.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>{workspace.name}</Typography>
        <Typography variant="body1" color="text.secondary">{workspace.description}</Typography>
      </Box>

      {/* Members (Placeholder) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Members</Typography>
        <Chip label={`${user.name} (You)`} />
        {/* The full member list would be fetched and displayed here */}
      </Box>

      {/* Documents Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Documents</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreateDocument}>
          New Document
        </Button>
      </Box>

      {documents.length > 0 ? (
        <Grid container spacing={3}>
          {documents.map(doc => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <DocumentCard document={doc} onOpen={(id) => navigate(`/document/${id}`)} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper variant="outlined" sx={{ textAlign: 'center', p: 4, borderRadius: 3 }}>
          <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" gutterBottom>No documents in this workspace</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first document to get started.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreateDocument}>
            Create Document
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default WorkspacePage;