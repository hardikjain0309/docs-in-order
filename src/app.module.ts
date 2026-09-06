import { Module } from "@nestjs/common";
import PrismaModule from "./prisma/prisma.module.js";
import WorkspaceModule from "./workspace/workspace.module.js";

@Module({
  imports: [PrismaModule, WorkspaceModule],
})
export class AppModule {}
