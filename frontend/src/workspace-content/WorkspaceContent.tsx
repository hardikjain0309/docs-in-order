import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkspaces } from '../store/workspaceSlice';

const WorkspaceContent = () => {
  const dispatch = useAppDispatch();
  const { workspaces, workspaceFetchStatus, workspacesFetchError } = useAppSelector(
    (state) => state.workspace,
  );

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const renderFirstRunExperience = () => {
    return <Typography variant="body1" color="text.primary">No workspaces found. Please create a new workspace to get started.</Typography>;
  };

  const renderSuccessContent = () => {
    if (workspaces.length === 0) {
      return renderFirstRunExperience();
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Workspace Content
      </Typography>
      {workspaceFetchStatus === 'loading' && <Typography>Loading workspaces...</Typography>}
      {workspaceFetchStatus === 'failed' && (
        <Typography color="error">{workspacesFetchError}</Typography>
      )}
      {workspaceFetchStatus === 'success' && renderSuccessContent()}
      {workspaceFetchStatus === 'success' &&
        workspaces.map((workspace) => (
          <Typography key={workspace.id} sx={{ mb: 1 }}>
            {workspace.name}
          </Typography>
        ))}
    </Box>
  );
};

export default WorkspaceContent;