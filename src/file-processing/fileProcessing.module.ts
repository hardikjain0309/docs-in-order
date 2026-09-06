import { Module } from "@nestjs/common";
import FileProcessingService from "./fileProcessing.service.js";

@Module({
  providers: [FileProcessingService],
  exports: [FileProcessingService],
})
export default class FileProcessingModule {}
