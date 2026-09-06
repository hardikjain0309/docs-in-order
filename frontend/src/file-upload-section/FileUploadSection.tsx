import {
	Alert,
	Button,
	Box,
	CircularProgress,
	IconButton,
	LinearProgress,
	Paper,
	Snackbar,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useEffect, useRef, useState } from 'react';
import type { Workspace } from '../store/workspaceSlice';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_COUNT = 10;

type WorkspaceFile = {
	id: string;
	name: string;
	size: number;
	createdAt: string;
};

type UploadBundleFile = {
	id: string;
	file: File;
	status: 'pending' | 'uploading' | 'validation-complete' | 'failed';
	errors: string[];
};

type FileTableProps = {
	files: WorkspaceFile[] | UploadBundleFile[];
	uploadBundle?: boolean;
	showRemoveAction?: boolean;
	onRemove?: (fileId: string) => void;
};

const formatFileSize = (size: number) => {
	if (size < 1024 * 1024) {
		return `${Math.max(1, Math.round(size / 1024))} KB`;
	}
	return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatUploadedAt = (createdAt?: string) => {
	if (!createdAt) {
		return '-';
	}
	return new Date(createdAt).toLocaleString();
};

const FileTable = ({ files, uploadBundle = false, showRemoveAction = false, onRemove }: FileTableProps) => (
	<TableContainer component={Paper} variant="outlined">
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Name</TableCell>
					<TableCell>Size</TableCell>
					<TableCell>Uploaded At</TableCell>
					<TableCell align="right">{uploadBundle ? 'Actions' : 'Upload Status'}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{files.map((file) => {
					const bundleFile = 'file' in file ? file : null;
					const status = bundleFile?.status;
					return (
						<TableRow key={bundleFile?.id ?? file.id}>
							<TableCell sx={{ wordBreak: 'break-word' }}>
								{bundleFile?.file.name ?? file.name}
							</TableCell>
							<TableCell>{formatFileSize(bundleFile?.file.size ?? file.size)}</TableCell>
							<TableCell>{formatUploadedAt(bundleFile ? undefined : file.createdAt)}</TableCell>
							<TableCell align="right">
								{uploadBundle && bundleFile ? (
									<IconButton
										aria-label={`Remove ${bundleFile.file.name}`}
										onClick={() => onRemove?.(bundleFile.id)}
										disabled={status === 'uploading'}
									>
										<DeleteOutlineIcon />
									</IconButton>
								) : status === 'uploading' ? (
									<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
										<CircularProgress size={16} />
										<Typography variant="body2">Uploading...</Typography>
									</Box>
								) : status === 'failed' ? (
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
										<CancelIcon color="error" fontSize="small" />
										<Tooltip
											title={
												<Stack spacing={0.5}>
													<Typography variant="body2">Upload Failed</Typography>
													{bundleFile.errors.map((error) => (
														<Typography key={error} variant="caption">{error}</Typography>
													))}
												</Stack>
											}
											slotProps={{
												tooltip: {
													sx: {
														bgcolor: 'background.paper',
														border: 1,
														borderColor: 'divider',
														boxShadow: 4,
														color: 'text.primary',
														maxWidth: 360,
														p: 1.5,
													},
												},
											}}
										>
											<Box sx={{ alignItems: 'center', cursor: 'help', display: 'inline-flex', gap: 0.5 }}>
												<Typography color="error">Upload Failed</Typography>
												<HelpOutlineIcon color="error" fontSize="small" />
											</Box>
										</Tooltip>
										{showRemoveAction && (
											<IconButton
												aria-label={`Remove ${bundleFile.file.name}`}
												onClick={() => onRemove?.(bundleFile.id)}
											>
												<DeleteOutlineIcon />
											</IconButton>
										)}
									</Box>
								) : status === 'validation-complete' ? (
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
										<CheckCircleIcon color="success" fontSize="small" />
										<Typography color="success.main">Validation complete</Typography>
										{showRemoveAction && bundleFile && (
											<IconButton
												aria-label={`Remove ${bundleFile.file.name}`}
												onClick={() => onRemove?.(bundleFile.id)}
											>
												<DeleteOutlineIcon />
											</IconButton>
										)}
									</Box>
								) : (
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
										<CheckCircleIcon color="success" fontSize="small" />
										<Typography color="success.main">Completed</Typography>
										{showRemoveAction && bundleFile && (
											<IconButton
												aria-label={`Remove ${bundleFile.file.name}`}
												onClick={() => onRemove?.(bundleFile.id)}
											>
												<DeleteOutlineIcon />
											</IconButton>
										)}
									</Box>
								)}
							</TableCell>
						</TableRow>
					);
				})}
				{files.length === 0 && (
					<TableRow>
						<TableCell colSpan={4} align="center">No files uploaded yet.</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	</TableContainer>
);

type FileUploadSectionProps = {
	workspace: Workspace;
};

const FileUploadSection = ({ workspace }: FileUploadSectionProps) => {
	const [files, setFiles] = useState<WorkspaceFile[]>([]);
	const [uploadBundle, setUploadBundle] = useState<UploadBundleFile[]>([]);
	const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'failed'>('idle');
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
  const [workspaceState, setWorkspaceState] = useState<string>(workspace.state);

	useEffect(() => {
		if (workspace.state === 'DRAFT') {
			return;
		}
    
		let isActive = true;
		const loadFiles = async () => {
      setUploadBundle([]);
      setUploadState('idle');
      setUploadProgress(0);
      setWorkspaceState(workspace.state);
			try {
				const response = await fetch(`/api/v1/workspaces/${workspace.id}/files`);
				if (!response.ok) {
					throw new Error('Failed to fetch workspace files');
				}
				const data = (await response.json()) as WorkspaceFile[];
				if (isActive) {
					
					setFiles(data);
				}
			} catch (error) {
				if (isActive) {
					setToast(error instanceof Error ? error.message : 'Failed to fetch workspace files');
				}
			}
		};

		void loadFiles();
		return () => {
			isActive = false;
		};
	}, [workspace.id, workspace.state]);

	const addFilesToBundle = (selectedFiles: File[]) => {
		const remainingCount = MAX_FILE_COUNT - uploadBundle.length;
		if (remainingCount <= 0) {
			setToast(`You can upload a maximum of ${MAX_FILE_COUNT} files.`);
			return;
		}

		const filesToAdd = selectedFiles.slice(0, remainingCount);
		const oversizedFiles = filesToAdd.filter((file) => file.size > MAX_FILE_SIZE);
		const bundleFiles = filesToAdd.map((file) => ({
			id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
			file,
			status: 'pending' as const,
			errors: [],
		}));
		setUploadBundle((currentFiles) => [...currentFiles, ...bundleFiles]);
		setUploadState('idle');
		if (selectedFiles.length > remainingCount) {
			setToast(`Only ${MAX_FILE_COUNT} files can be uploaded at once.`);
		} else if (oversizedFiles.length > 0) {
			setToast('Files larger than 10 MB will fail validation on upload.');
		}
	};

	const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			addFilesToBundle(Array.from(event.target.files));
			event.target.value = '';
		}
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		addFilesToBundle(Array.from(event.dataTransfer.files));
	};

	const uploadFiles = () => {
		if (uploadBundle.length === 0) {
			return;
		}

		setUploadState('uploading');
		setUploadProgress(0);
		setUploadBundle((currentFiles) =>
			currentFiles.map((bundleFile) => ({ ...bundleFile, status: 'uploading', errors: [] })),
		);

		const request = new XMLHttpRequest();
		const formData = new FormData();
		uploadBundle.forEach(({ file }) => formData.append('files', file, file.name));

		request.open('POST', `/api/v1/workspaces/${workspace.id}/files/upload`);
		request.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				setUploadProgress(Math.round((event.loaded / event.total) * 100));
			}
		};
		request.onload = () => {
			if (request.status >= 200 && request.status < 300) {
				setUploadProgress(100);
				return;
			}

			let validationErrors: { fileName: string; errors: string[] }[] = [];
			try {
				const responseBody = JSON.parse(request.responseText) as {
					validationResult?: { errors?: { fileName: string; errors: string[] }[] };
				};
				validationErrors = responseBody.validationResult?.errors ?? [];
			} catch {
				setToast('Upload failed. Please try again.');
			}

			setUploadState('failed');
			setUploadProgress(0);
			setUploadBundle((currentFiles) => currentFiles.map((bundleFile) => {
				const fileError = validationErrors.find(({ fileName }) => fileName === bundleFile.file.name);
				return {
					...bundleFile,
					status: fileError ? 'failed' : 'validation-complete',
					errors: fileError?.errors ?? [],
				};
			}));
		};
		request.onerror = () => {
			setUploadState('failed');
			setUploadProgress(0);
			setUploadBundle((currentFiles) => currentFiles.map((bundleFile) => ({
				...bundleFile,
				status: 'failed',
				errors: ['Upload failed. Please try again.'],
			})));
		};
		request.send(formData);
	};

	const isDraft = workspaceState === 'DRAFT';
	const isUploading = uploadState === 'uploading';

	return (
		<>
      <Typography sx={{ mb: 3, color: "text.secondary", textAlign: "center" }}>
          Upload your documents to convert them into a searchable, filterable knowledge base.
      </Typography>
			{isDraft && !isUploading && (
				<Paper
					variant="outlined"
					onDragOver={(event) => {
						event.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					sx={{
						p: 5,
						mb: 3,
						textAlign: 'center',
						borderStyle: 'dashed',
						borderColor: isDragging ? 'primary.main' : 'divider',
						bgcolor: isDragging ? 'action.hover' : 'transparent',
					}}
				>
					<CloudUploadOutlinedIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
					<Typography variant="h6">Please upload some files to start.</Typography>
					<Typography color="text.secondary" sx={{ mb: 2 }}>
						Max size: 10 MB. Max count: 10.
					</Typography>
					<input ref={fileInputRef} hidden type="file" multiple onChange={handleFileSelection} />
					<Button
						variant="contained"
						startIcon={<UploadFileOutlinedIcon />}
						onClick={() => fileInputRef.current?.click()}
					>
						Select files
					</Button>
				</Paper>
			)}

			{uploadBundle.length > 0 && (
				<>
					<Typography variant="h6" sx={{ mb: 1 }}>Files to upload</Typography>
					<FileTable
						files={uploadBundle}
						uploadBundle={uploadState === 'idle'}
            showRemoveAction={uploadState === "idle" || uploadState === "failed"}
						onRemove={(fileId) => setUploadBundle((currentFiles) => currentFiles.filter(({ id }) => id !== fileId))}
					/>
					{isUploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />}
					{!isUploading && uploadState === 'failed' && (
						<Button variant="contained" sx={{ mt: 2 }} onClick={uploadFiles}>Retry Upload</Button>
					)}
					{!isUploading && uploadState !== 'failed' && (
						<Button variant="contained" sx={{ mt: 2 }} onClick={uploadFiles}>Start Upload</Button>
					)}
				</>
			)}

			{!isDraft && (
				<>
					<Typography variant="h6" sx={{ mb: 1 }}>Uploaded files</Typography>
					<FileTable files={files} />
				</>
			)}

			<Snackbar
				open={Boolean(toast)}
				autoHideDuration={5000}
				onClose={() => setToast(null)}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert severity="error" onClose={() => setToast(null)}>{toast}</Alert>
			</Snackbar>
		</>
	);
};

export default FileUploadSection;
