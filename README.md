# Módulo AWS para NestJS

# @nest-js/aws

[![npm version](https://img.shields.io/npm/v/@nest-js/aws.svg)](https://www.npmjs.com/package/@nest-js/aws)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


Este módulo proporciona una integración sencilla con varios servicios de AWS para aplicaciones NestJS.

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

### Credenciales Obligatorias

Estas variables de entorno son **requeridas** para cualquier servicio de AWS:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Configuración por Servicio

Configura solo las variables de entorno correspondientes a los servicios que vayas a utilizar:

#### Cognito (Autenticación y gestión de usuarios)
```env
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
```

#### S3 (Almacenamiento de objetos)
```env
AWS_S3_BUCKET=your-bucket-name
```

#### DynamoDB (Base de datos NoSQL)
```env
AWS_DYNAMODB_TABLE=your-table-name
```

#### SQS (Sistema de colas)
```env
AWS_SQS_QUEUE_URL=your-queue-url
```

#### SNS (Servicio de notificaciones)
```env
AWS_SNS_TOPIC_ARN=your-topic-arn
```

#### SES (Servicio de envío de correos)
```env
AWS_SES_SENDER_EMAIL=no-reply@yourdomain.com
```

#### AppSync (API GraphQL)
```env
AWS_APPSYNC_API_URL=your-appsync-api-url
AWS_APPSYNC_API_KEY=your-appsync-api-key
```

## Uso

Puedes inyectar los servicios que necesites en tus controladores o servicios:

```typescript
import { CognitoService } from './aws/cognito/cognito.service';
import { S3Service } from './aws/s3/s3.service';

@Injectable()
export class YourService {
  constructor(
    private readonly cognitoService: CognitoService, // Solo si usas Cognito
    private readonly s3Service: S3Service, // Solo si usas S3
  ) {}

  async example() {
    // Usar los servicios según necesites
  }
}
```

## Servicios Disponibles

- **Cognito**: Autenticación y gestión de usuarios
- **S3**: Almacenamiento de objetos
- **DynamoDB**: Base de datos NoSQL
- **SQS**: Sistema de colas
- **SNS**: Servicio de notificaciones
- **SES**: Servicio de envío de correos
- **AppSync**: API GraphQL gestionada

Cada servicio tiene su propia documentación detallada en su respectivo directorio.