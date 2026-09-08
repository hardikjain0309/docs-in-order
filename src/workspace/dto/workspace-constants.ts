import { WorkspaceState } from "../../prisma/generated/enums.js";

export const OrderedWorkspaceStates = [
  WorkspaceState.DRAFT,
  WorkspaceState.FILES_UPLOADED,
  WorkspaceState.PARSING_COMPLETED,
  WorkspaceState.EXTRACTION_COMPLETED,
  WorkspaceState.SCHEMA_INFERRED,
  WorkspaceState.USER_CONFIRMED_SCHEMA,
  WorkspaceState.MAPPING_VALIDATION_COMPLETED,
  WorkspaceState.COMPLETED,
];
