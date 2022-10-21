import { Module } from '@nestjs/common';
import { PowerService } from './power.service';
import { PowerController } from './power.controller';

@Module({
  providers: [PowerService],
  controllers: [PowerController],
  // not exports: [PowerModule],
  exports: [PowerService],
})
export class PowerModule {}
