import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppSyncClient,
  CreateApiKeyCommand,
  DeleteApiKeyCommand,
  GetSchemaCreationStatusCommand,
  StartSchemaCreationCommand,
  ListGraphqlApisCommand,
  GetGraphqlApiCommand,
  CreateGraphqlApiCommand,
  DeleteGraphqlApiCommand,
  UpdateGraphqlApiCommand,
  UpdateGraphqlApiCommandInput,
} from '@aws-sdk/client-appsync';

@Injectable()
export class AppSyncService {
  private readonly appSyncClient: AppSyncClient;

  constructor(private readonly configService: ConfigService) {
    this.appSyncClient = new AppSyncClient({
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
   * Crea una API GraphQL
   */
  async createGraphqlApi(
    name: string,
    authenticationType:
      | 'API_KEY'
      | 'AWS_IAM'
      | 'AMAZON_COGNITO_USER_POOLS'
      | 'OPENID_CONNECT'
      | 'AWS_LAMBDA',
    additionalConfig?: Record<string, any>,
  ) {
    const command = new CreateGraphqlApiCommand({
      name,
      authenticationType, // "API_KEY" || "AWS_IAM" || "AMAZON_COGNITO_USER_POOLS" || "OPENID_CONNECT" || "AWS_LAMBDA"
      ...additionalConfig,
    });
    return await this.appSyncClient.send(command);
  }

  /**
   * Obtiene información de una API GraphQL
   */
  async getGraphqlApi(apiId: string) {
    const command = new GetGraphqlApiCommand({
      apiId,
    });
    return await this.appSyncClient.send(command);
  }

  /**
   * Actualiza una API GraphQL existente
   */
  async updateGraphqlApi(
    apiId: string,
    name: string,
    additionalConfig?: Record<string, any>,
  ) {
    const command = new UpdateGraphqlApiCommand({
      apiId,
      name,
      ...additionalConfig,
    } as UpdateGraphqlApiCommandInput);

    return await this.appSyncClient.send(command);
  }

  /**
   * Elimina una API GraphQL
   */
  async deleteGraphqlApi(apiId: string) {
    const command = new DeleteGraphqlApiCommand({
      apiId,
    });

    return await this.appSyncClient.send(command);
  }

  /**
   * Lista todas las APIs GraphQL
   */
  async listGraphqlApis(nextToken?: string, maxResults?: number) {
    const command = new ListGraphqlApisCommand({
      ...(nextToken && { nextToken }),
      ...(maxResults && { maxResults }),
    });

    return await this.appSyncClient.send(command);
  }

  /**
   * Inicia la creación de un esquema GraphQL
   */
  async startSchemaCreation(apiId: string, definition: Uint8Array) {
    const command = new StartSchemaCreationCommand({
      apiId,
      definition,
    });

    return await this.appSyncClient.send(command);
  }

  /**
   * Obtiene el estado de creación del esquema GraphQL
   */
  async getSchemaCreationStatus(apiId: string) {
    const command = new GetSchemaCreationStatusCommand({
      apiId,
    });

    return await this.appSyncClient.send(command);
  }

  /**
   * Crea una clave API para una API GraphQL
   */
  async createApiKey(apiId: string, description?: string, expires?: number) {
    const command = new CreateApiKeyCommand({
      apiId,
      ...(description && { description }),
      ...(expires && { expires }),
    });

    return await this.appSyncClient.send(command);
  }

  /**
   * Elimina una clave API de una API GraphQL
   */
  async deleteApiKey(apiId: string, id: string) {
    const command = new DeleteApiKeyCommand({
      apiId,
      id,
    });

    return await this.appSyncClient.send(command);
  }
}
