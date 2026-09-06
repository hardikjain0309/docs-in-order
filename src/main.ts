import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";
import { validationPipeExceptionFactory } from "./validationExceptionFactory.js";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationPipeExceptionFactory,
    }),
  );
  app.useStaticAssets("./frontend/dist");
  await app.listen(4000);
}
bootstrap();
