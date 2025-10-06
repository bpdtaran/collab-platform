// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container, Grid, Card, Typography, Button, Box, Fab, Paper,
  TextField, InputAdornment, IconButton, Tooltip, Menu, MenuItem,
  List, ListItemButton, ListItemAvatar, ListItemText, Avatar, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select,
} from '@mui/material';
import {
  Add, Folder, Description, Search, ExpandMore, MoreVert, OpenInNew, Share,
  InsertDriveFile, People, Storage, StarBorder, Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

import {
  fetchWorkspaces,
  createWorkspace,
  fetchWorkspaceMembers,
  inviteWorkspaceMember,
  removeWorkspaceMember
} from '../api/workspaces';
import {
  fetchDocumentsByWorkspace,
  createDocument
} from '../api/documents';
import ManageMembersDialog from '../components/workspace/ManageMembersDialog';

/* --- Child Components --- */
// (CommandBar, StatCards, WorkspaceCard, RecentDocs components remain the same as your previous version)
// For completeness, they are included here.

/* Command Bar */
function CommandBar({ onCreateDoc, onCreateWorkspace, onSearch }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
      <TextField
        ref={searchRef}
        placeholder="Search workspaces and documents…"
        size="medium"
        onChange={(e) => onSearch?.(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      <Button
        variant="contained"
        startIcon={<Add />}
        endIcon={<ExpandMore />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' },
        }}
      >
        Create
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); onCreateDoc?.(); }}>New Document</MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onCreateWorkspace?.(); }}>New Workspace</MenuItem>
      </Menu>
    </Box>
  );
}

/* Stat Cards */
function StatCards({ stats }) {
  const items = [
    { label: 'Workspaces', value: stats.workspaces, icon: <Folder /> },
    { label: 'Documents', value: stats.documents, icon: <InsertDriveFile /> },
    { label: 'Members', value: stats.members, icon: <People /> },
    { label: 'Storage', value: stats.storage, icon: <Storage /> },
  ];
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {items.map((it) => (
        <Grid key={it.label} item xs={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: 'rgba(37,99,235,.08)', color: '#2563eb' }}>
              {it.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{it.value}</Typography>
              <Typography variant="caption" color="text.secondary">{it.label}</Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

/* Workspace Card */
function WorkspaceCard({ ws, onOpen, onShare, onRename, onDelete, onToggleStar }) {
  const [anchorEl, setAnchorEl] = useState(null);
  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{
        p: 2.5, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 1,
        transition: 'all .2s', cursor: 'pointer',
        '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,.06)', transform: 'translateY(-2px)' },
      }}
      onClick={() => onOpen?.(ws.id)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: 'rgba(99,102,241,.1)', color: '#6366f1' }}>
          <Folder />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={ws.starred ? 'Unstar' : 'Star'}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onToggleStar?.(ws); }}
              aria-label="toggle favorite"
            >
              {ws.starred ? <Star sx={{ color: '#f59e0b' }} /> : <StarBorder />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Open">
            <IconButton
              size="small"
              aria-label="open workspace"
              onClick={(e) => { e.stopPropagation(); onOpen?.(ws.id); }}
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton
              size="small"
              aria-label="share workspace"
              onClick={(e) => { e.stopPropagation(); onShare?.(ws); }}
            >
              <Share fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            aria-label="more actions"
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); onRename?.(ws); }}>Rename</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); onDelete?.(ws); }}>Delete</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>{ws.name}</Typography>
      <Typography variant="body2" color="text.secondary" noWrap title={ws.description}>{ws.description}</Typography>

      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">{ws.members} members</Typography>
        <Typography variant="caption" color="text.secondary">{ws.documents} documents</Typography>
      </Box>
    </Card>
  );
}

/* Recent Docs */
function RecentDocs({ docs, onOpen, onMore }) {
  return (
    <List sx={{ p: 0 }}>
      {docs.map((d) => (
        <ListItemButton key={d.id} onClick={() => onOpen?.(d.id)} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'rgba(236,72,153,.12)', color: '#ec4899' }}>
              <Description />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600 }}>{d.title}</Typography>}
            secondary={<Typography variant="body2" color="text.secondary">Updated recently • by {d.createdBy?.name}</Typography>}
          />
          <IconButton edge="end" aria-label="More actions" onClick={(e) => { e.stopPropagation(); onMore?.(d); }}>
            <MoreVert />
          </IconButton>
        </ListItemButton>
      ))}
    </List>
  );
}
/* --- Main Dashboard Component --- */

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Dialog states
  const [openDocDlg, setOpenDocDlg] = useState(false);
  const [openWsDlg, setOpenWsDlg] = useState(false);
  const [membersDialog, setMembersDialog] = useState({ open: false, workspace: null });

  // Form states
  const [docForm, setDocForm] = useState({ title: '', workspaceId: '' });
  const [wsForm, setWsForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [creatingWs, setCreatingWs] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const ws = await fetchWorkspaces();
      setWorkspaces(ws);

      const docsArrays = await Promise.all(
        (ws || []).map((w) => fetchDocumentsByWorkspace(w.id).catch(() => []))
      );
      const flatDocs = docsArrays.flat().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setDocuments(flatDocs);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load dashboard data');
      setWorkspaces([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getServerMessage = (err) =>
    err?.response?.data?.errors?.[0]?.msg ||
    err?.response?.data?.message ||
    'Server error';

  const handleCreateWorkspace = () => setOpenWsDlg(true);
  const handleCreateDocument = () => setOpenDocDlg(true);

  const submitWorkspace = async () => {
    if (!wsForm.name.trim()) return setFormErrors({ name: 'Name is required' });

    setCreatingWs(true);
    try {
      const newWs = await createWorkspace({ name: wsForm.name.trim(), description: wsForm.description.trim() });
      setWorkspaces((prev) => [newWs, ...prev]);
      setWsForm({ name: '', description: '' });
      setFormErrors({});
      setOpenWsDlg(false);
      toast.success('Workspace created');
    } catch (e) {
      toast.error(getServerMessage(e));
    } finally {
      setCreatingWs(false);
    }
  };

  const submitDocument = async () => {
    const errs = {};
    if (!docForm.title.trim()) errs.title = 'Title is required';
    if (!docForm.workspaceId) errs.workspaceId = 'Workspace is required';
    if (Object.keys(errs).length) return setFormErrors(errs);

    setCreatingDoc(true);
    try {
      const newDoc = await createDocument({
        title: docForm.title.trim(),
        workspaceId: docForm.workspaceId,
      });

      setDocuments((prev) => [newDoc, ...prev]);
      setWorkspaces((prev) =>
        prev.map((w) =>
          String(w.id) === String(newDoc.workspaceId) ? { ...w, documents: (w.documents || 0) + 1 } : w
        )
      );
      setDocForm({ title: '', workspaceId: '' });
      setFormErrors({});
      setOpenDocDlg(false);
      toast.success('Document created');
    } catch (e) {
      toast.error(getServerMessage(e));
    } finally {
      setCreatingDoc(false);
    }
  };

  const handleOpenWorkspace = (workspaceId) => navigate(`/workspace/${workspaceId}`);
  const handleOpenDocument = (documentId) => navigate(`/document/${documentId}`);
  const handleShareWorkspace = (ws) => setMembersDialog({ open: true, workspace: ws });
  const handleRenameWorkspace = (ws) => toast('Rename dialog would open', { icon: '✏️' });
  const handleDeleteWorkspace = async (ws) => {
    // Replace with a real API call later
    setWorkspaces((prev) => prev.filter((w) => w.id !== ws.id));
    setDocuments((prev) => prev.filter((d) => d.workspaceId !== ws.id));
    toast.success(`Workspace "${ws.name}" deleted`);
  };
  const handleToggleStar = (ws) =>
    setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? { ...w, starred: !w.starred } : w)));

  const filteredWorkspaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workspaces;
    return workspaces.filter((w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
  }, [workspaces, query]);

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => d.title.toLowerCase().includes(q));
  }, [documents, query]);

  const stats = useMemo(() => {
    const members = workspaces.reduce((acc, w) => acc + (w.members || 0), 0);
    const storage = `${(documents.length * 0.2).toFixed(1)} GB`;
    return { workspaces: workspaces.length, documents: documents.length, members, storage };
  }, [workspaces, documents]);

  // Skeletons
  const WorkspaceSkeletons = (
    <Grid container spacing={2}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Skeleton variant="rounded" width={36} height={36} sx={{ mb: 1, borderRadius: 1 }} />
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="60%" />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          Welcome back, {user?.name || 'User'}!
        </Typography>
      </Box>

      <CommandBar onCreateDoc={handleCreateDocument} onCreateWorkspace={handleCreateWorkspace} onSearch={setQuery} />

      {loading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={120} height={28} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <StatCards stats={stats} />
      )}

      {/* Workspaces */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>Your Workspaces</Typography>
        <Button size="small" sx={{ textTransform: 'none' }} onClick={() => toast('View all')}>View all</Button>
      </Box>

      {loading ? (
        WorkspaceSkeletons
      ) : Array.isArray(filteredWorkspaces) && filteredWorkspaces.length > 0 ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {filteredWorkspaces.map((ws) => (
            <Grid key={ws.id} item xs={12} sm={6} md={4} lg={3}>
              <WorkspaceCard
                ws={ws}
                onOpen={handleOpenWorkspace}
                onShare={handleShareWorkspace}
                onRename={handleRenameWorkspace}
                onDelete={handleDeleteWorkspace}
                onToggleStar={handleToggleStar}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper variant="outlined" sx={{ textAlign: 'center', p: 4, borderRadius: 3, mb: 3 }}>
          <Folder sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" gutterBottom>No workspaces found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a workspace first to start writing documents
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreateWorkspace}>New Workspace</Button>
        </Paper>
      )}

      {/* Recent Documents */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>Recent Documents</Typography>
        <Button size="small" sx={{ textTransform: 'none' }} onClick={() => toast('View all')}>View all</Button>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} item xs={12} md={6} lg={5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : Array.isArray(filteredDocuments) && filteredDocuments.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={5}>
            <RecentDocs
              docs={filteredDocuments}
              onOpen={handleOpenDocument}
              onMore={(d) => toast(`More actions for "${d.title}"`)}
            />
          </Grid>
        </Grid>
      ) : (
        <Paper variant="outlined" sx={{ textAlign: 'center', p: 4, borderRadius: 2 }}>
          <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" gutterBottom>No documents found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first document to start writing
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreateDocument}>New Document</Button>
        </Paper>
      )}

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="create document"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { xs: 'inline-flex', md: 'none' } }}
        onClick={handleCreateDocument}
      >
        <Add />
      </Fab>

      {/* Create Workspace Dialog */}
      <Dialog open={openWsDlg} onClose={() => setOpenWsDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Workspace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Workspace Name"
            fullWidth
            value={wsForm.name}
            onChange={(e) => setWsForm((p) => ({ ...p, name: e.target.value }))}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <TextField
            margin="normal"
            label="Description (optional)"
            fullWidth
            multiline
            minRows={2}
            value={wsForm.description}
            onChange={(e) => setWsForm((p) => ({ ...p, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWsDlg(false)} disabled={creatingWs}>Cancel</Button>
          <Button variant="contained" onClick={submitWorkspace} disabled={creatingWs}>
            {creatingWs ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Document Dialog */}
      <Dialog open={openDocDlg} onClose={() => setOpenDocDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Title"
            fullWidth
            value={docForm.title}
            onChange={(e) => {
              setDocForm((p) => ({ ...p, title: e.target.value }));
              if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={!!formErrors.title}
            helperText={formErrors.title}
          />
          {workspaces.length === 0 ? (
            <Box sx={{ mt: 1, color: 'text.secondary' }}>
              You need a workspace to create a document.
              <Button
                size="small"
                sx={{ ml: 1, textTransform: 'none' }}
                onClick={() => {
                  setOpenDocDlg(false);
                  setOpenWsDlg(true);
                }}
              >
                Create workspace
              </Button>
            </Box>
          ) : (
            <FormControl fullWidth margin="normal" error={!!formErrors.workspaceId}>
              <InputLabel id="ws-select-label">Workspace</InputLabel>
              <Select
                labelId="ws-select-label"
                label="Workspace"
                required
                value={docForm.workspaceId}
                onChange={(e) => {
                  setDocForm((p) => ({ ...p, workspaceId: e.target.value }));
                  if (formErrors.workspaceId) setFormErrors((prev) => ({ ...prev, workspaceId: '' }));
                }}
              >
                {workspaces.map((w) => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </Select>
              {formErrors.workspaceId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.workspaceId}
                </Typography>
              )}
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocDlg(false)} disabled={creatingDoc}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitDocument}
            disabled={creatingDoc || !docForm.title.trim() || !docForm.workspaceId || workspaces.length === 0}
          >
            {creatingDoc ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render the ManageMembersDialog */}
      <ManageMembersDialog
        workspace={membersDialog.workspace}
        open={membersDialog.open}
        onClose={() => setMembersDialog({ open: false, workspace: null })}
      />
    </Container>
  );
};

export default Dashboard;