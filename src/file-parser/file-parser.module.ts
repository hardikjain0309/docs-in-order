import { Module } from "@nestjs/common";
import FileParserService from "./file-parser.service.js";

@Module({
  providers: [FileParserService],
  exports: [FileParserService],
})
export default class FileParserModule {}
