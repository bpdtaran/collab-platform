import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Paper,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Description,
  MoreVert,
  Edit,
  Delete,
  Share,
  PersonAdd,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import the REAL API functions
import {
  fetchWorkspaceById,
  fetchWorkspaceMembers,
  inviteWorkspaceMember,
  removeWorkspaceMember
} from '../api/workspaces';
import {
  fetchDocumentsByWorkspace,
  createDocument
} from '../api/documents';


const Workspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({ anchorEl: null, type: null, item: null });

  // Form states
  const [newDocument, setNewDocument] = useState({ title: '' });
  const [inviteData, setInviteData] = useState({ email: '', role: 'reader' });
  const [isInviting, setIsInviting] = useState(false);

  // Load real data from the backend
  const loadWorkspaceData = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const [wsData, docsData, membersData] = await Promise.all([
        fetchWorkspaceById(workspaceId),
        fetchDocumentsByWorkspace(workspaceId),
        fetchWorkspaceMembers(workspaceId),
      ]);

      setWorkspace(wsData);
      setDocuments(docsData);
      setMembers(membersData);
    } catch (error) {
      toast.error('Failed to load workspace data.');
      navigate('/dashboard'); // Redirect if workspace is not found or user lacks access
    } finally {
      setLoading(false);
    }
  }, [workspaceId, navigate]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const handleCreateDocument = async () => {
    if (!newDocument.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    try {
      const newDoc = await createDocument({
        title: newDocument.title.trim(),
        workspaceId: workspaceId,
      });

      setDocuments(prev => [newDoc, ...prev]);
      setCreateDocumentOpen(false);
      setNewDocument({ title: '' });
      toast.success('Document created successfully');

      // Navigate to the new document editor page
      navigate(`/document/${newDoc.id}`);
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteData.email.trim() || !inviteData.role) {
      toast.error("Email and role are required.");
      return;
    }
    setIsInviting(true);
    try {
      const { member } = await inviteWorkspaceMember(workspaceId, inviteData);
      setMembers(prev => [member, ...prev]);
      setInviteUserOpen(false);
      setInviteData({ email: '', role: 'reader' });
      toast.success(`Invitation sent to ${inviteData.email}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleContextMenu = (event, type, item) => {
    event.stopPropagation();
    setContextMenu({
      anchorEl: event.currentTarget,
      type,
      item,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ anchorEl: null, type: null, item: null });
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }
    try {
      await removeWorkspaceMember(workspaceId, memberId);
      setMembers(prev => prev.filter(m => m.user._id !== memberId));
      toast.success('Member removed');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleOpenDocument = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!workspace) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Workspace not found or you don't have access.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Workspace Header */}
      <Box mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {workspace.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {workspace.description}
        </Typography>

        {/* Members */}
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="h6">Members:</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {members.map((member) => (
              <Chip
                key={member.user._id}
                avatar={<Avatar src={member.user.avatar}>{member.user.name[0]}</Avatar>}
                label={`${member.user.name} (${member.role})`}
                onDelete={member.role !== 'owner' ? () => handleRemoveMember(member.user._id, member.user.name) : undefined}
              />
            ))}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => setInviteUserOpen(true)}
          >
            Invite
          </Button>
        </Box>
      </Box>

      {/* Documents Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDocumentOpen(true)}
        >
          New Document
        </Button>
      </Box>

      <Grid container spacing={3}>
        {documents.map((document) => (
          <Grid item xs={12} sm={6} md={4} key={document.id}>
            <Card
              sx={{ cursor: 'pointer', height: '100%', borderRadius: 3, '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}
              onClick={() => handleOpenDocument(document.id)}
            >
              <CardContent sx={{ position: 'relative' }}>
                <IconButton
                  aria-label="more"
                  size="small"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={(e) => handleContextMenu(e, 'document', document)}
                >
                  <MoreVert />
                </IconButton>

                <Description sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom noWrap>
                  {document.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated {new Date(document.updatedAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  By {document.createdBy?.name || 'You'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {documents.length === 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ textAlign: 'center', p: 4, borderRadius: 3, mt: 2 }}>
              <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No documents in this workspace
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDocumentOpen(true)}
                sx={{ mt: 2 }}
              >
                Create First Document
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create Document Dialog */}
      <Dialog open={createDocumentOpen} onClose={() => setCreateDocumentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Title"
            fullWidth
            variant="outlined"
            value={newDocument.title}
            onChange={(e) => setNewDocument({ title: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDocumentOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDocument} variant="contained" disabled={!newDocument.title.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteUserOpen} onClose={() => setInviteUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite User to Workspace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteData.email}
            onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              label="Role"
              value={inviteData.role}
              onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
            >
              <MenuItem value="reader">Reader</MenuItem>
              <MenuItem value="commenter">Commenter</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteUserOpen(false)}>Cancel</Button>
          <Button onClick={handleInviteUser} variant="contained" disabled={!inviteData.email.trim() || isInviting}>
            {isInviting ? <CircularProgress size={24} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu for Documents */}
      <Menu
        anchorEl={contextMenu.anchorEl}
        open={Boolean(contextMenu.anchorEl)}
        onClose={handleCloseContextMenu}
      >
        <MenuItem onClick={handleCloseContextMenu}>
          <Edit sx={{ mr: 1 }} /> Rename
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setCreateDocumentOpen(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Workspace;