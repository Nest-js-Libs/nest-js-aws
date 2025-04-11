# Submódulo SES para AWS en NestJS

Este submódulo proporciona integración con Amazon Simple Email Service (SES) para el envío de correos electrónicos desde aplicaciones NestJS.

## Características

- Envío de correos electrónicos simples con soporte para HTML y texto plano
- Envío de correos usando plantillas predefinidas
- Envío masivo de correos (bulk email)
- Gestión de plantillas de correo (crear, eliminar, listar)
- Monitoreo de cuotas de envío
- Soporte para destinatarios CC y BCC
- Soporte para adjuntos

## Configuración

El módulo requiere las siguientes variables de entorno:

```env
# AWS Credentials (requeridas por el módulo AWS principal)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# SES Configuration
AWS_SES_SENDER_EMAIL=no-reply@yourdomain.com
```

## Uso

### Envío de correo simple

```typescript
import { SesService } from './aws/ses/ses.service';

@Injectable()
export class YourService {
  constructor(private readonly sesService: SesService) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    await this.sesService.sendEmail({
      subject: 'Bienvenido a nuestra plataforma',
      to: [{ email: userEmail, name: userName }],
      html: '<h1>Bienvenido</h1><p>Gracias por registrarte en nuestra plataforma.</p>',
      text: 'Bienvenido. Gracias por registrarte en nuestra plataforma.',
    });
  }
}
```

### Envío de correo con plantilla

```typescript
import { SesService } from './aws/ses/ses.service';

@Injectable()
export class YourService {
  constructor(private readonly sesService: SesService) {}

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string) {
    await this.sesService.sendTemplatedEmail({
      subject: 'Restablecimiento de contraseña',
      to: [{ email: userEmail, name: userName }],
      template: 'PasswordReset',
      templateData: {
        userName: userName,
        resetLink: `https://yourdomain.com/reset-password?token=${resetToken}`,
        expirationHours: 24
      }
    });
  }
}
```

### Creación de una plantilla

```typescript
import { SesService } from './aws/ses/ses.service';

@Injectable()
export class YourService {
  constructor(private readonly sesService: SesService) {}

  async createPasswordResetTemplate() {
    await this.sesService.createTemplate({
      name: 'PasswordReset',
      subject: 'Restablecimiento de contraseña para {{userName}}',
      html: `
        <h1>Hola {{userName}},</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <p><a href="{{resetLink}}">Restablecer contraseña</a></p>
        <p>Este enlace expirará en {{expirationHours}} horas.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
      text: 'Hola {{userName}}, has solicitado restablecer tu contraseña. Visita {{resetLink}} para continuar. Este enlace expirará en {{expirationHours}} horas.'
    });
  }
}
```

### Envío masivo de correos

```typescript
import { SesService } from './aws/ses/ses.service';

@Injectable()
export class YourService {
  constructor(private readonly sesService: SesService) {}

  async sendNewsletterToUsers(users: Array<{ email: string, name: string, preferences: any }>) {
    await this.sesService.sendBulkTemplatedEmail({
      from: 'newsletter@yourdomain.com',
      template: 'MonthlyNewsletter',
      defaultTemplateData: {
        month: 'Junio',
        year: '2023'
      },
      destinations: users.map(user => ({
        to: [{ email: user.email, name: user.name }],
        templateData: {
          userName: user.name,
          userPreferences: user.preferences
        }
      }))
    });
  }
}
```

## Verificación de dominios y direcciones de correo

Recuerda que para utilizar Amazon SES en producción, debes verificar tus dominios y direcciones de correo electrónico en la consola de AWS. Además, si tu cuenta está en el sandbox de SES, solo podrás enviar correos a direcciones verificadas.

## Monitoreo

Puedes monitorear tus cuotas de envío utilizando el método `getSendQuota`:

```typescript
import { SesService } from './aws/ses/ses.service';

@Injectable()
export class YourService {
  constructor(private readonly sesService: SesService) {}

  async checkEmailQuota() {
    const quota = await this.sesService.getSendQuota();
    console.log(`Cuota diaria: ${quota.Max24HourSend}`);
    console.log(`Enviados en las últimas 24h: ${quota.SentLast24Hours}`);
    console.log(`Tasa máxima de envío: ${quota.MaxSendRate} emails/segundo`);
  }
}
```