import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
import { ComputerModule } from './computer/computer.module';

async function bootstrap() {
  const app = await NestFactory.create(ComputerModule);
  await app.listen(4000);
}
bootstrap();
