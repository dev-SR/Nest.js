import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'abcbcjdskss',
      signOptions: { expiresIn: '15d' },
    }),
  ],
  exports: [JwtModule],
})
export class CommonModule {}
