import { Global, Module } from '@nestjs/common';
import { AppSyncService } from './appsync.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AppSyncService],
  exports: [AppSyncService],
})
export class AppSyncModule {}
