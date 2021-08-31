import { Module } from '@nestjs/common';
import { CpuService } from './cpu.service';
import { CpuController } from './cpu.controller';
import { PowerModule } from 'src/power/power.module';

@Module({
  imports: [PowerModule],
  providers: [CpuService],
  controllers: [CpuController],
  exports: [CpuService],
})
export class CpuModule {}
