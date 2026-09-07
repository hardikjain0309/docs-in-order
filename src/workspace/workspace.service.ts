import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { WorkspaceState } from "../prisma/generated/enums.js";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto.js";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto.js";
import { WorkspaceErrorDto } from "./dto/workspace-error.dto.js";

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  create(createWorkspaceDto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name ?? "New Workspace",
      },
    });
  }

  findAll() {
    return this.prisma.workspace.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  async findOne(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    return workspace;
  }

  async update(workspaceId: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    await this.findOne(workspaceId);

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: updateWorkspaceDto,
    });
  }

  async remove(workspaceId: string) {
    await this.findOne(workspaceId);

    return this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
  }

  async transitionToFilesUploaded(workspaceId: string) {
    const workspace = await this.findOne(workspaceId);

    if (workspace.state !== WorkspaceState.DRAFT) {
      throw new ConflictException(
        // 409 Conflict: "Only draft workspaces can be transitioned to files uploaded",
        "Only draft workspaces can be transitioned to files uploaded",
      );
    }

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { state: WorkspaceState.FILES_UPLOADED },
    });
  }

  async transitionToParsingCompleted(
    workspaceId: string,
    error?: WorkspaceErrorDto,
  ) {
    const workspace = await this.findOne(workspaceId);

    if (workspace.state !== WorkspaceState.FILES_UPLOADED) {
      throw new ConflictException(
        "Only workspaces with files uploaded can be transitioned to files parsed",
      );
    }

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { state: WorkspaceState.PARSING_COMPLETED, error },
    });
  }

  async transitionToExtractionCompleted(
    workspaceId: string,
    error?: WorkspaceErrorDto,
  ) {
    const workspace = await this.findOne(workspaceId);

    if (workspace.state !== WorkspaceState.PARSING_COMPLETED) {
      throw new ConflictException(
        "Only workspaces with parsing completed can be transitioned to extraction completed",
      );
    }

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { state: WorkspaceState.EXTRACTION_COMPLETED, error },
    });
  }

  async transitionToSchemaInferred(
    workspaceId: string,
    error?: WorkspaceErrorDto,
  ) {
    const workspace = await this.findOne(workspaceId);

    if (workspace.state !== WorkspaceState.EXTRACTION_COMPLETED) {
      throw new ConflictException(
        "Only workspaces with extraction completed can be transitioned to schema inferred",
      );
    }

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { state: WorkspaceState.SCHEMA_INFERRED, error },
    });
  }
}
