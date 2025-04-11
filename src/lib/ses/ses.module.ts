import { Global, Module } from '@nestjs/common';
import { SesService } from './ses.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SesService],
  exports: [SesService],
})
export class SesModule {}
