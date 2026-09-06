import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWorkspaceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
