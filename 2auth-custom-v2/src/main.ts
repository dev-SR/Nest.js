import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const logger = new Logger('App');
	app.use(cookieParser());
	app.setGlobalPrefix('api');
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true
			}
		})
	);
	if (process.env.NODE_ENV === 'development')
		logger.log(`App started at http://localhost:3000/api/`);
	await app.listen(3000);
}
bootstrap();
