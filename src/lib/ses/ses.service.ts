import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendBulkTemplatedEmailCommand,
  GetSendQuotaCommand,
  ListTemplatesCommand,
  CreateTemplateCommand,
  DeleteTemplateCommand,
} from '@aws-sdk/client-ses';

/**
 * Interfaz para los destinatarios de correo
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Interfaz para los adjuntos de correo
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/**
 * Interfaz para la configuración básica de un correo
 */
export interface EmailOptions {
  subject: string;
  from?: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Interfaz para enviar un correo con contenido HTML y texto plano
 */
export interface SendEmailOptions extends EmailOptions {
  html?: string;
  text?: string;
}

/**
 * Interfaz para enviar un correo usando una plantilla
 */
export interface SendTemplatedEmailOptions extends EmailOptions {
  template: string;
  templateData: Record<string, any>;
}

/**
 * Interfaz para enviar correos masivos usando una plantilla
 */
export interface SendBulkTemplatedEmailOptions {
  from: string;
  template: string;
  defaultTemplateData?: Record<string, any>;
  destinations: {
    to: EmailRecipient[];
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    templateData?: Record<string, any>;
  }[];
}

/**
 * Interfaz para crear una plantilla de correo
 */
export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class SesService {
  private readonly sesClient: SESClient;
  private readonly defaultSender: string;

  constructor(private readonly configService: ConfigService) {
    this.defaultSender = this.configService.get<string>(
      'AWS_SES_SENDER_EMAIL',
      'no-reply@example.com',
    );

    this.sesClient = new SESClient({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * Envía un correo electrónico
   * @param options Opciones del correo
   * @returns Resultado del envío
   */
  async sendEmail(options: SendEmailOptions) {
    const {
      subject,
      from = this.defaultSender,
      to,
      cc,
      bcc,
      replyTo,
      html,
      text,
    } = options;

    const command = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: to.map(recipient =>
          recipient.name
            ? `${recipient.name} <${recipient.email}>`
            : recipient.email,
        ),
        CcAddresses:
          cc?.map(recipient =>
            recipient.name
              ? `${recipient.name} <${recipient.email}>`
              : recipient.email,
          ) || [],
        BccAddresses:
          bcc?.map(recipient =>
            recipient.name
              ? `${recipient.name} <${recipient.email}>`
              : recipient.email,
          ) || [],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(html && {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          }),
          ...(text && {
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ...(replyTo && { ReplyToAddresses: [replyTo] }),
    });

    return this.sesClient.send(command);
  }

  /**
   * Envía un correo electrónico usando una plantilla
   * @param options Opciones del correo con plantilla
   * @returns Resultado del envío
   */
  async sendTemplatedEmail(options: SendTemplatedEmailOptions) {
    const {
      subject,
      from = this.defaultSender,
      to,
      cc,
      bcc,
      replyTo,
      template,
      templateData,
    } = options;

    const command = new SendTemplatedEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: to.map(recipient =>
          recipient.name
            ? `${recipient.name} <${recipient.email}>`
            : recipient.email,
        ),
        CcAddresses:
          cc?.map(recipient =>
            recipient.name
              ? `${recipient.name} <${recipient.email}>`
              : recipient.email,
          ) || [],
        BccAddresses:
          bcc?.map(recipient =>
            recipient.name
              ? `${recipient.name} <${recipient.email}>`
              : recipient.email,
          ) || [],
      },
      Template: template,
      TemplateData: JSON.stringify(templateData),
      ...(replyTo && { ReplyToAddresses: [replyTo] }),
    });

    return this.sesClient.send(command);
  }

  /**
   * Envía correos electrónicos masivos usando una plantilla
   * @param options Opciones para el envío masivo
   * @returns Resultado del envío
   */
  async sendBulkTemplatedEmail(options: SendBulkTemplatedEmailOptions) {
    const { from, template, defaultTemplateData, destinations } = options;

    const command = new SendBulkTemplatedEmailCommand({
      Source: from,
      Template: template,
      DefaultTemplateData: defaultTemplateData
        ? JSON.stringify(defaultTemplateData)
        : undefined,
      Destinations: destinations.map(destination => ({
        Destination: {
          ToAddresses: destination.to.map(recipient =>
            recipient.name
              ? `${recipient.name} <${recipient.email}>`
              : recipient.email,
          ),
          CcAddresses:
            destination.cc?.map(recipient =>
              recipient.name
                ? `${recipient.name} <${recipient.email}>`
                : recipient.email,
            ) || [],
          BccAddresses:
            destination.bcc?.map(recipient =>
              recipient.name
                ? `${recipient.name} <${recipient.email}>`
                : recipient.email,
            ) || [],
        },
        ReplacementTemplateData: destination.templateData
          ? JSON.stringify(destination.templateData)
          : undefined,
      })),
    });

    return this.sesClient.send(command);
  }

  /**
   * Crea una plantilla de correo electrónico
   * @param template Datos de la plantilla
   * @returns Resultado de la creación
   */
  async createTemplate(template: EmailTemplate) {
    const command = new CreateTemplateCommand({
      Template: {
        TemplateName: template.name,
        SubjectPart: template.subject,
        HtmlPart: template.html,
        TextPart: template.text,
      },
    });

    return this.sesClient.send(command);
  }

  /**
   * Elimina una plantilla de correo electrónico
   * @param templateName Nombre de la plantilla
   * @returns Resultado de la eliminación
   */
  async deleteTemplate(templateName: string) {
    const command = new DeleteTemplateCommand({
      TemplateName: templateName,
    });

    return this.sesClient.send(command);
  }

  /**
   * Lista las plantillas disponibles
   * @returns Lista de plantillas
   */
  async listTemplates() {
    const command = new ListTemplatesCommand({});
    return this.sesClient.send(command);
  }

  /**
   * Obtiene la cuota de envío de SES
   * @returns Información sobre la cuota de envío
   */
  async getSendQuota() {
    const command = new GetSendQuotaCommand({});
    return this.sesClient.send(command);
  }
}
