// frontend/src/components/workspace/ManageMembersDialog.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Box,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

import {
  fetchWorkspaceMembers,
  inviteWorkspaceMember,
  removeWorkspaceMember,
} from '../../api/workspaces';

const ROLES = ['reader', 'commenter', 'editor'];

export default function ManageMembersDialog({ workspace, open, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('reader');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (open && workspace?.id) {
      (async () => {
        setLoading(true);
        try {
          const membersList = await fetchWorkspaceMembers(workspace.id);
          setMembers(membersList);
        } catch (e) {
          toast.error('Failed to load members');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, workspace]);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) {
      return toast.error('Email and role are required');
    }
    setIsInviting(true);
    try {
      const { member } = await inviteWorkspaceMember(workspace.id, {
        email: inviteEmail,
        role: inviteRole,
      });
      setMembers((prev) => [member, ...prev]);
      setInviteEmail('');
      setInviteRole('reader');
      toast.success('Invitation sent');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this workspace?`)) return;
    try {
      await removeWorkspaceMember(workspace.id, userId);
      setMembers((prev) => prev.filter((m) => m.user._id !== userId));
      toast.success('Member removed');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share "{workspace?.name}"</DialogTitle>
      <DialogContent dividers>
        {/* Invite Form */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <TextField
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            fullWidth
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={inviteRole}
              label="Role"
              onChange={(e) => setInviteRole(e.target.value)}
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={isInviting || !inviteEmail}
            sx={{ px: 3, py: 1 }}
          >
            {isInviting ? <CircularProgress size={24} color="inherit" /> : 'Invite'}
          </Button>
        </Box>

        {/* Members List */}
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {members.map((member) => (
              <ListItem
                key={member.user._id || member.user.email}
                secondaryAction={
                  member.role !== 'owner' ? (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemove(member.user._id, member.user.name)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Avatar src={member.user.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={member.user.name}
                  secondary={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}