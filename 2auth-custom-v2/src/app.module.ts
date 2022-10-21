import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HomeModule } from './home/home.module';
import { UserInterceptor } from './user/interceptor/user.interceptor';
import { AuthGuard } from './user/guard/auth.guard';
@Module({
	imports: [ConfigModule.forRoot(), PrismaModule, UserModule, HomeModule],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: ClassSerializerInterceptor
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: UserInterceptor
		},
		{
			provide: APP_GUARD,
			useClass: AuthGuard
		}
	]
})
export class AppModule {}
