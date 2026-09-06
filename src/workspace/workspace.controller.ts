import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto.js";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto.js";
import { WorkspaceService } from "./workspace.service.js";

@Controller("workspaces")
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create({
      name: createWorkspaceDto.name,
    });
  }

  @Get()
  findAll() {
    return this.workspaceService.findAll();
  }

  @Get(":workspaceId")
  findOne(@Param("workspaceId", ParseUUIDPipe) workspaceId: string) {
    return this.workspaceService.findOne(workspaceId);
  }

  @Put(":workspaceId")
  update(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(workspaceId, updateWorkspaceDto);
  }

  @Delete(":workspaceId")
  remove(@Param("workspaceId", ParseUUIDPipe) workspaceId: string) {
    return this.workspaceService.remove(workspaceId);
  }
}
