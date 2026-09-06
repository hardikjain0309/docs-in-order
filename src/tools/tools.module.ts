import { Module } from '@nestjs/common';
import { UUIDService } from './uuid.service.js';

@Module({
  providers: [UUIDService],
  exports: [UUIDService],
})
export default class ToolsModule {}
