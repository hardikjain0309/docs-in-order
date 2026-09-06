import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  changeSelectedWorkspace,
  fetchWorkspaceById,
  fetchWorkspaces,
} from '../store/workspaceSlice';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import FileUploadSection from '../file-upload-section/FileUploadSection';
import { useParams } from 'react-router';

const WorkspaceContent = () => {
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [pollToast, setPollToast] = useState<string | null>(null);
  const pollAttemptedRef = useRef(false);
  const pollInFlightRef = useRef(false);
  const dispatch = useAppDispatch();
  const { workspaceFetchStatus, workspacesFetchError, workspaces, selectedWorkspaceId } =
    useAppSelector((state) => state.workspace);
  const {
    selectedWorkspace,
    selectedWorkspacePollState,
    selectedWorkspacePollError,
  } = useAppSelector((state) => state.workspace);
  const { workspaceId } = useParams<{ workspaceId: string }>();

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    dispatch(changeSelectedWorkspace(workspaceId ?? null));
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (!workspaceId || workspaceId !== selectedWorkspaceId) {
      return;
    }

    let isActive = true;
    pollAttemptedRef.current = false;
    pollInFlightRef.current = false;

    const pollWorkspace = async () => {
      if (pollInFlightRef.current) {
        return;
      }

      pollInFlightRef.current = true;
      try {
        await dispatch(fetchWorkspaceById(workspaceId)).unwrap();
      } catch (error) {
        if (isActive && pollAttemptedRef.current) {
          setPollToast(
            typeof error === 'string' ? error : 'Failed to refresh workspace',
          );
        }
      } finally {
        pollAttemptedRef.current = true;
        pollInFlightRef.current = false;
      }
    };

    void pollWorkspace();
    const pollInterval = window.setInterval(() => {
      void pollWorkspace();
    }, 2000);

    return () => {
      isActive = false;
      window.clearInterval(pollInterval);
    };
  }, [dispatch, selectedWorkspaceId, workspaceId]);

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

    return <Container maxWidth="md"><FileUploadSection workspace={selectedWorkspace} /></Container>;
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
      {selectedWorkspacePollState === 'loading' && (
        <Typography>Loading workspace...</Typography>
      )}
      {selectedWorkspacePollState === 'failed' && (
        <Typography color="error">{selectedWorkspacePollError}</Typography>
      )}
      {selectedWorkspacePollState !== 'failed' && workspaceFetchStatus === 'success' && renderSuccessContent()}
      <CreateWorkspaceModal
        open={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
      <Snackbar
        open={Boolean(pollToast)}
        autoHideDuration={5000}
        onClose={() => setPollToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setPollToast(null)}>
          {pollToast}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkspaceContent;