import { Global, Module } from '@nestjs/common';
import { DynamoDBService } from './dynamodb.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DynamoDBService],
  exports: [DynamoDBService],
})
export class DynamoDBModule {}
