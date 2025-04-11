import { Global, Module } from '@nestjs/common';
import { CognitoModule } from './cognito/cognito.module';
import { S3Module } from './s3/s3.module';
import { SqsModule } from './sqs/sqs.module';
import { DynamoDBModule } from './dynamodb/dynamodb.module';
import { SnsModule } from './sns/sns.module';
import { AppSyncModule } from './appsync/appsync.module';
import { SesModule } from './ses/ses.module';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    CognitoModule,
    S3Module,
    SqsModule,
    DynamoDBModule,
    SnsModule,
    AppSyncModule,
    SesModule,
  ],
  exports: [
    CognitoModule,
    S3Module,
    SqsModule,
    DynamoDBModule,
    SnsModule,
    AppSyncModule,
    SesModule,
  ],
})
export class AwsModule {}
