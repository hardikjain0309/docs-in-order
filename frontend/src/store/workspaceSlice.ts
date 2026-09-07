import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AsyncThunkStatus, type AsyncThunkStatusValue } from './reduxTypes';

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  state: string;
  error: unknown;
};

export type WorkspaceFetchStatus = AsyncThunkStatusValue;

export type WorkspacePollStatus = AsyncThunkStatusValue;

type WorkspaceState = {
  workspaces: Workspace[];
  workspacesFetchError: string | null;
  workspaceFetchStatus: WorkspaceFetchStatus;
  selectedWorkspaceId: string | null;
  selectedWorkspace: Workspace | null;
  selectedWorkspacePollState: WorkspacePollStatus;
  selectedWorkspacePollError: string | null;
};

const initialState: WorkspaceState = {
  workspaces: [],
  workspacesFetchError: null,
  workspaceFetchStatus: AsyncThunkStatus.Idle,
  selectedWorkspaceId: null,
  selectedWorkspace: null,
  selectedWorkspacePollState: AsyncThunkStatus.Idle,
  selectedWorkspacePollError: null,
};

export const fetchWorkspaces = createAsyncThunk<
  Workspace[],
  void,
  { rejectValue: string }
>('workspace/fetchWorkspaces', async (_, thunkAPI) => {
  try {
    const response = await fetch('/api/v1/workspaces');

    if (!response.ok) {
      throw new Error('Failed to fetch workspaces');
    }

    const data = (await response.json()) as Workspace[];
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch workspaces',
    );
  }
});

export const fetchWorkspaceById = createAsyncThunk<
  Workspace,
  string,
  { rejectValue: string }
>('workspace/fetchWorkspaceById', async (workspaceId, thunkAPI) => {
  try {
    const response = await fetch(`/api/v1/workspaces/${workspaceId}`);

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorBody?.message ?? 'Failed to fetch workspace');
    }

    return (await response.json()) as Workspace;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch workspace',
    );
  }
});

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    changeSelectedWorkspace: (state, action: PayloadAction<string | null>) => {
      state.selectedWorkspaceId = action.payload;
      state.selectedWorkspace = null;
      state.selectedWorkspacePollState = AsyncThunkStatus.Idle;
      state.selectedWorkspacePollError = null;
    },
    clearWorkspaceError: (state) => {
      state.workspacesFetchError = null;
      state.workspaceFetchStatus = AsyncThunkStatus.Idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.workspaceFetchStatus = AsyncThunkStatus.Loading;
        state.workspacesFetchError = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action: PayloadAction<Workspace[]>) => {
        state.workspaces = action.payload;
        state.workspaceFetchStatus = AsyncThunkStatus.Success;
        state.workspacesFetchError = null;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.workspaceFetchStatus = AsyncThunkStatus.Failed;
        state.workspacesFetchError = action.payload ?? 'Failed to fetch workspaces';
      })
      .addCase(fetchWorkspaceById.pending, (state) => {
        if (state.selectedWorkspacePollState === AsyncThunkStatus.Idle) {
          state.selectedWorkspacePollState = AsyncThunkStatus.Loading;
          state.selectedWorkspacePollError = null;
        }
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action: PayloadAction<Workspace>) => {
        state.selectedWorkspace = action.payload;
        state.selectedWorkspacePollState = AsyncThunkStatus.Success;
        state.selectedWorkspacePollError = null;
      })
      .addCase(fetchWorkspaceById.rejected, (state, action) => {
        if (state.selectedWorkspacePollState === AsyncThunkStatus.Loading) {
          state.selectedWorkspacePollState = AsyncThunkStatus.Failed;
          state.selectedWorkspacePollError =
            action.payload ?? 'Failed to fetch workspace';
        }
      });
  },
});

export const { changeSelectedWorkspace, clearWorkspaceError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
