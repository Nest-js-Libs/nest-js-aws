# Módulo AWS para NestJS

Este módulo proporciona integración con varios servicios de AWS para aplicaciones NestJS.

## Servicios Incluidos

- **Cognito**: Autenticación y gestión de usuarios
- **S3**: Almacenamiento de objetos
- **SQS**: Sistema de colas
- **DynamoDB**: Base de datos NoSQL
- **SNS**: Servicio de notificaciones
- **AppSync**: API GraphQL gestionada
- **SES**: Servicio de envío de correos electrónicos

## Instalación

El módulo está incluido en el proyecto. Para utilizarlo, importa `AwsModule` en tu módulo:

```typescript
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [AwsModule],
})
export class YourModule {}
```

## Configuración

El módulo requiere las siguientes variables de entorno:

```env
# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Cognito
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id

# S3
AWS_S3_BUCKET=your-bucket-name

# DynamoDB
AWS_DYNAMODB_TABLE=your-table-name

# SQS
AWS_SQS_QUEUE_URL=your-queue-url

# SNS
AWS_SNS_TOPIC_ARN=your-topic-arn

# SES
AWS_SES_SENDER_EMAIL=no-reply@yourdomain.com

# AppSync
AWS_APPSYNC_API_URL=your-appsync-api-url
AWS_APPSYNC_API_KEY=your-appsync-api-key
```

## Uso

Cada servicio de AWS se puede inyectar en tus controladores o servicios:

```typescript
import { CognitoService } from './aws/cognito/cognito.service';
import { S3Service } from './aws/s3/s3.service';
// ... otros servicios

@Injectable()
export class YourService {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly s3Service: S3Service,
    // ... otros servicios
  ) {}

  // Usa los servicios aquí
}
```

## Ejemplos

Consulta la documentación específica de cada servicio para ver ejemplos detallados de uso.