import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // for session
  // app.use(
  //   session({
  //     secret: 'a secret',
  //     resave: true,
  //     saveUninitialized: true,
  //     cookie: {
  //       maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week,
  //     },
  //   }),
  // );
  // app.use(passport.initialize());
  // app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
