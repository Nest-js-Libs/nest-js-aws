import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AwsModule } from './lib/aws.module';

export const swaggerConfig = app => {
  const options = new DocumentBuilder()
    .setTitle('CACHE STRATEGIES')
    .setDescription('The CACHE STRATEGIES API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};


async function bootstrap() {
  const app = await NestFactory.create(AwsModule);
  swaggerConfig(app);
  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();