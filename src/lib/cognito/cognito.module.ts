import { Global, Module } from '@nestjs/common';
import { CognitoService } from './cognito.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CognitoService],
  exports: [CognitoService],
})
export class CognitoModule {}
