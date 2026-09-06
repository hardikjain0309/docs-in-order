import { Module } from "@nestjs/common";
import PrismaModule from "../prisma/prisma.module.js";
import { WorkspaceController } from "./workspace.controller.js";
import { WorkspaceService } from "./workspace.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export default class WorkspaceModule {}
