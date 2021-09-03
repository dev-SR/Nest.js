import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OneToManyModule } from './one-to-many/one-to-many.module';
import { ManyToManyModule } from './many-to-many/many-to-many.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      // port: Number(process.env.DATABASE_PORT),
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      synchronize: true, //allow migration
      // entities: [User],
      autoLoadEntities: true,
      logging: process.env.NODE_ENV == 'development' ? true : false,
    }),
    OneToManyModule,
    ManyToManyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
