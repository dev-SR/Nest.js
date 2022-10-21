import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OneToManyModule } from './one-to-many/one-to-many.module';
import { ManyToManyModule } from './many-to-many/many-to-many.module';
import { FancyTablesModule } from './fancy-tables/fancy-tables.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot(),
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: process.env.DATABASE_HOST,
//       // port: Number(process.env.DATABASE_PORT),
//       port: +process.env.DATABASE_PORT,
//       username: process.env.DATABASE_USER,
//       database: process.env.DATABASE_NAME,
//       password: process.env.DATABASE_PASSWORD,
//       synchronize: true, //allow migration
//       // entities: [User],
//       autoLoadEntities: true,
//       logging: process.env.NODE_ENV == 'development' ? true : false,
//     }),
//     OneToManyModule,
//     ManyToManyModule,
//     FancyTablesModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        console.log(isProduction);
        return {
          ssl: isProduction,
          extra: {
            ssl: isProduction ? { rejectUnauthorized: false } : null,
            // !Heroku Deployment
            /*
            https://devcenter.heroku.com/articles/heroku-postgresql#heroku-postgres-ssl
            */
          },
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          database: configService.get('DB_NAME'),
          password: configService.get('DB_PASSWORD'),
          synchronize: true, //allow migration
          // entities: [User],
          autoLoadEntities: true,
          // logging: true,
        };
      },
    }),
    OneToManyModule,
    ManyToManyModule,
    FancyTablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
