import {
	Box,
	CircularProgress,
	Stack,
	Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import type { Workspace } from '../store/workspaceSlice';

type StageStatus = 'notStarted' | 'failed' | 'inProgress' | 'completed';

type ProcessingStage = {
	key: string;
	name: string;
	completedLabel: string;
	inProgressLabel: string;
};

const stages: ProcessingStage[] = [
	{
		key: 'FILES_UPLOADED',
		name: 'File Upload',
		completedLabel: 'Files uploaded',
		inProgressLabel: 'Uploading files...',
	},
	{
		key: 'PARSING_COMPLETED',
		name: 'Parsing',
		completedLabel: 'Files parsed',
		inProgressLabel: 'Parsing files...',
	},
	{
		key: 'EXTRACTION_COMPLETED',
		name: 'Data Extraction',
		completedLabel: 'Data extracted',
		inProgressLabel: 'Extracting data...',
	},
	{
		key: 'SCHEMA_INFERRED',
		name: 'Schema Inference',
		completedLabel: 'Schema inferred',
		inProgressLabel: 'Inferring schema...',
	},
	{
		key: 'USER_CONFIRMED_SCHEMA',
		name: 'User Confirmation',
		completedLabel: 'Schema confirmed',
		inProgressLabel: 'Awaiting confirmation',
	},
];

const getStageStatus = (
	stageIndex: number,
	currentStageIndex: number,
	hasError: boolean,
): StageStatus => {
	if (stageIndex < currentStageIndex) {
		return 'completed';
	}
	if (stageIndex === currentStageIndex) {
		return hasError ? 'failed' : 'completed';
	}
	if (stageIndex === currentStageIndex + 1 && !hasError) {
		return 'inProgress';
	}
	return 'notStarted';
};

const workspaceHasErrors = (error: unknown) => {
	if (!error || typeof error !== 'object') {
		return false;
	}

	const errorValue = error as { errors?: unknown };
	return Array.isArray(errorValue.errors) && errorValue.errors.length > 0;
};

const getStageIcon = (status: StageStatus) => {
	if (status === 'completed') {
		return <CheckCircleIcon color="success" />;
	}
	if (status === 'failed') {
		return <ErrorIcon color="error" />;
	}
	if (status === 'inProgress') {
		return <CircularProgress size={24} color="primary" />;
	}
	return <RadioButtonUncheckedIcon color="disabled" />;
};

type ProcessingStageStatusProps = {
	workspace: Workspace;
};

const ProcessingStageStatus = ({ workspace }: ProcessingStageStatusProps) => {
	if (workspace.state === 'DRAFT') {
		return null;
	}

	const matchedStageIndex = stages.findIndex((stage) => stage.key === workspace.state);
	const currentStageIndex = matchedStageIndex === -1 ? stages.length : matchedStageIndex;
	const hasError = workspaceHasErrors(workspace.error);

	return (
		<Box
			aria-label="Document processing stages"
			sx={{
				border: 1,
				borderColor: 'divider',
				borderRadius: 2,
				mb: 3,
				p: { xs: 2, sm: 3 },
			}}
		>
			<Typography variant="overline" color="text.secondary">
				Processing progress
			</Typography>
			<Stack spacing={0} sx={{ mt: 1 }}>
				{stages.map((stage, index) => {
					const status = getStageStatus(index, currentStageIndex, hasError);
					const isLast = index === stages.length - 1;
					const description =
						status === 'completed'
							? stage.completedLabel
							: status === 'inProgress'
								? stage.inProgressLabel
								: status === 'failed'
									? 'Processing failed'
									: 'Not started';

					return (
						<Box key={stage.key} sx={{ display: 'flex', minHeight: isLast ? 44 : 68 }}>
							<Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', mr: 2 }}>
								<Box sx={{ display: 'flex', height: 28 }}>{getStageIcon(status)}</Box>
								{!isLast && (
									<Box
										sx={{
											bgcolor: status === 'completed' ? 'success.main' : 'divider',
											flex: 1,
											mt: 0.5,
											width: 2,
										}}
									/>
								)}
							</Box>
							<Box sx={{ pb: isLast ? 0 : 2, pt: 0.25 }}>
								<Typography
									variant="body1"
									color={
										status === 'failed'
											? 'error.main'
											: status === 'inProgress'
												? 'primary.main'
												: status === 'notStarted'
													? 'text.secondary'
													: 'text.primary'
									}
									sx={{
										fontWeight: status === 'inProgress' || status === 'failed' ? 700 : 500,
									}}
								>
									{stage.name}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{description}
								</Typography>
							</Box>
						</Box>
					);
				})}
			</Stack>
		</Box>
	);
};

export default ProcessingStageStatus;
