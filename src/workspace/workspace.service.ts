import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto.js";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto.js";

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
}
