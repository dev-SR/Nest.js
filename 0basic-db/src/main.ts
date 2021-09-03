import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const logger = new Logger('App');
  const app = await NestFactory.create(AppModule);
  const port = +process.env.PORT;
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV === 'development')
    logger.log(`App started at http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
