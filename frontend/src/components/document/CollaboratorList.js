import React from 'react';
import {
  Box,
  Avatar,
  Tooltip,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { People } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const CollaboratorList = ({ collaborators }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const activeCollaborators = collaborators.filter(collab =>
    Date.now() - new Date(collab.lastActive).getTime() < 300000 // 5 minutes
  );

  return (
    <>
      <Chip
        icon={<People />}
        label={`${activeCollaborators.length} online`}
        variant="outlined"
        onClick={handleClick}
        sx={{ cursor: 'pointer' }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6" gutterBottom>
            Collaborators
          </Typography>
          <List dense>
            {collaborators.map((collaborator) => (
              <ListItem key={collaborator.user.id}>
                <ListItemAvatar>
                  <Tooltip title={collaborator.user.name}>
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(collaborator.user.name),
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                      }}
                    >
                      {getInitials(collaborator.user.name)}
                    </Avatar>
                  </Tooltip>
                </ListItemAvatar>
                <ListItemText
                  primary={collaborator.user.name}
                  secondary={
                    Date.now() - new Date(collaborator.lastActive).getTime() < 300000
                      ? 'Online'
                      : `Last seen ${formatDistanceToNow(new Date(collaborator.lastActive))} ago`
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
};

// Helper functions
function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default CollaboratorList;