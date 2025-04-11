import { Global, Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SqsService],
  exports: [SqsService],
})
export class SqsModule {}
