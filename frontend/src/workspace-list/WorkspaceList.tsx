import { useState } from 'react';
import {
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useAppSelector } from '../store/hooks';
import CreateWorkspaceModal from '../workspace-content/CreateWorkspaceModal';
import { Link } from 'react-router';

const WorkspaceList = () => {
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const workspaces = useAppSelector((state) => state.workspace.workspaces);

  return (
    <Stack sx={{ height: '100%', p: 1 }}>
      <Typography variant="overline" sx={{ px: 1, color: 'text.secondary' }}>
        Workspaces
      </Typography>
      <List disablePadding sx={{ flexGrow: 1 }}>
        {workspaces.map((workspace) => (
          <ListItem key={workspace.id} disablePadding>
            <ListItemButton component={Link} to={`/workspaces/${workspace.id}`}>
              <ListItemText primary={workspace.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <Button
        fullWidth
        variant="outlined"
        onClick={() => setIsCreateWorkspaceOpen(true)}
      >
        + New Workspace
      </Button>
      <CreateWorkspaceModal
        open={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
    </Stack>
  );
};

export default WorkspaceList;