import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  changeSelectedWorkspace,
  fetchWorkspaces,
} from '../store/workspaceSlice';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { useParams } from 'react-router';

const WorkspaceContent = () => {
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { workspaceFetchStatus, workspacesFetchError, workspaces, selectedWorkspaceId } =
    useAppSelector((state) => state.workspace);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const selectedWorkspace = useAppSelector((state) =>
    state.workspace.workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
  );

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    dispatch(changeSelectedWorkspace(workspaceId ?? null));
  }, [dispatch, workspaceId]);

  const renderCreateWorkspaceButton = () => {
    return <Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ flexShrink: 1 }}
        onClick={() => setIsCreateWorkspaceOpen(true)}
      >
      Create Workspace
      </Button>
    </Box>;
  };

  const renderFirstRunExperience = () => {
    return <Container>
      <Stack spacing={2} component="div" sx={{textAlign: 'center' }}>
        <Typography variant="body1" color="text.primary" align="center">
          Create a new workspace to get started.
        </Typography>
        {renderCreateWorkspaceButton()}
      </Stack>
    </Container>;
  };

  const renderWorkspaceContent = () => {
    if (!selectedWorkspace) {
      return <Stack spacing={2} component="div" sx={{textAlign: 'center' }}>
        <Typography variant="body1" color="text.primary" align="center">
          Please select a workspace from the sidebar.
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }} align="center">
          or
        </Typography>
        { renderCreateWorkspaceButton() }
      </Stack>;
    }

    return <Container>
      <Stack spacing={2} component="div" sx={{textAlign: 'center' }}>
        
      </Stack>
    </Container>;
  };

  const renderSuccessContent = () => {
    if (workspaces.length === 0) {
      return renderFirstRunExperience();
    }
    return renderWorkspaceContent();
  }

  const renderWorkspaceHeader = () => {
    if (selectedWorkspace) {
      return <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        Workspace: {selectedWorkspace.name}
      </Typography>;
    }
    return <Typography sx={{ mb: 3, color: "text.secondary", textAlign: "center" }}>
        Upload your documents to convert them into a searchable, filterable knowledge base.
    </Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      { renderWorkspaceHeader() }
      {workspaceFetchStatus === 'loading' && <Typography>Loading workspaces...</Typography>}
      {workspaceFetchStatus === 'failed' && (
        <Typography color="error">{workspacesFetchError}</Typography>
      )}
      {workspaceFetchStatus === 'success' && renderSuccessContent()}
      <CreateWorkspaceModal
        open={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
    </Box>
  );
};

export default WorkspaceContent;