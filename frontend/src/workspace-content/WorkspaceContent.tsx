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

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    dispatch(changeSelectedWorkspace(workspaceId ?? null));
  }, [dispatch, workspaceId]);

  const renderFirstRunExperience = () => {
    return <Container>
      <Stack spacing={2} component="div" sx={{textAlign: 'center' }}>
        <Typography variant="body1" color="text.primary" align="center">
          Create a new workspace to get started.
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ flexShrink: 1 }}
            onClick={() => setIsCreateWorkspaceOpen(true)}
          >
            Create Workspace
          </Button>
        </Box>
      </Stack>
    </Container>;
  };

  const renderSuccessContent = () => {
    if (workspaces.length === 0) {
      return renderFirstRunExperience();
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ mb: 3, color: "text.secondary" }}>
        Upload your documents to convert them into a searchable, filterable knowledge base.
      </Typography>
      {workspaceFetchStatus === 'loading' && <Typography>Loading workspaces...</Typography>}
      {workspaceFetchStatus === 'failed' && (
        <Typography color="error">{workspacesFetchError}</Typography>
      )}
      {workspaceFetchStatus === 'success' && renderSuccessContent()}
      {selectedWorkspaceId && (
        <Typography sx={{ mb: 1 }}>
          Selected workspace: {selectedWorkspaceId}
        </Typography>
      )}
      <CreateWorkspaceModal
        open={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
    </Box>
  );
};

export default WorkspaceContent;