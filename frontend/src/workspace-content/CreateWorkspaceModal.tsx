import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material';
import { useAppDispatch } from '../store/hooks';
import { changeSelectedWorkspace, fetchWorkspaces } from '../store/workspaceSlice';

type CreateWorkspaceModalProps = {
  open: boolean;
  onClose: () => void;
};

const CreateWorkspaceModal = ({ open, onClose }: CreateWorkspaceModalProps) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isSaving) {
      setName('');
      setError(null);
      onClose();
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Workspace name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      setName('');
      onClose();
      const newWorkspace = await response.json();
      if (newWorkspace?.id) {
        dispatch(changeSelectedWorkspace(newWorkspace.id));
      }
      dispatch(fetchWorkspaces());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to create workspace',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Workspace</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Name"
            margin="dense"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSaving}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateWorkspaceModal;