import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand,
  QueryCommand,
  BatchWriteItemCommand,
  BatchGetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

@Injectable()
export class DynamoDBService {
  private readonly dynamoDBClient: DynamoDBClient;

  constructor(private readonly configService: ConfigService) {
    this.dynamoDBClient = new DynamoDBClient({
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
   * Crea o actualiza un ítem en una tabla de DynamoDB
   */
  async putItem(tableName: string, item: Record<string, any>) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    });

    return await this.dynamoDBClient.send(command);
  }

  /**
   * Obtiene un ítem de una tabla de DynamoDB por su clave primaria
   */
  async getItem(tableName: string, key: Record<string, any>) {
    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });

    const response = await this.dynamoDBClient.send(command);
    return response.Item ? unmarshall(response.Item) : null;
  }

  /**
   * Elimina un ítem de una tabla de DynamoDB por su clave primaria
   */
  async deleteItem(tableName: string, key: Record<string, any>) {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });

    return await this.dynamoDBClient.send(command);
  }

  /**
   * Actualiza un ítem existente en una tabla de DynamoDB
   */
  async updateItem(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
  ) {
    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ...(expressionAttributeNames && {
        ExpressionAttributeNames: expressionAttributeNames,
      }),
      ReturnValues: 'ALL_NEW',
    });

    const response = await this.dynamoDBClient.send(command);
    return response.Attributes ? unmarshall(response.Attributes) : null;
  }

  /**
   * Escanea todos los ítems de una tabla de DynamoDB
   */
  async scan(
    tableName: string,
    limit?: number,
    lastEvaluatedKey?: Record<string, any>,
  ) {
    const command = new ScanCommand({
      TableName: tableName,
      ...(limit && { Limit: limit }),
      ...(lastEvaluatedKey && {
        ExclusiveStartKey: marshall(lastEvaluatedKey),
      }),
    });

    const response = await this.dynamoDBClient.send(command);
    return {
      items: response.Items ? response.Items.map(item => unmarshall(item)) : [],
      lastEvaluatedKey: response.LastEvaluatedKey
        ? unmarshall(response.LastEvaluatedKey)
        : undefined,
    };
  }

  /**
   * Consulta ítems en una tabla de DynamoDB usando una expresión de condición
   */
  async query(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
    indexName?: string,
    limit?: number,
    lastEvaluatedKey?: Record<string, any>,
  ) {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ...(expressionAttributeNames && {
        ExpressionAttributeNames: expressionAttributeNames,
      }),
      ...(indexName && { IndexName: indexName }),
      ...(limit && { Limit: limit }),
      ...(lastEvaluatedKey && {
        ExclusiveStartKey: marshall(lastEvaluatedKey),
      }),
    });

    const response = await this.dynamoDBClient.send(command);
    return {
      items: response.Items ? response.Items.map(item => unmarshall(item)) : [],
      lastEvaluatedKey: response.LastEvaluatedKey
        ? unmarshall(response.LastEvaluatedKey)
        : undefined,
    };
  }

  /**
   * Escribe múltiples ítems en lote en una o varias tablas de DynamoDB
   */
  async batchWriteItems(requestItems: Record<string, any[]>) {
    // Convertir los ítems a formato DynamoDB
    const formattedRequestItems: Record<string, any[]> = {};

    for (const tableName in requestItems) {
      formattedRequestItems[tableName] = requestItems[tableName].map(item => ({
        PutRequest: {
          Item: marshall(item),
        },
      }));
    }

    const command = new BatchWriteItemCommand({
      RequestItems: formattedRequestItems,
    });

    return await this.dynamoDBClient.send(command);
  }

  /**
   * Obtiene múltiples ítems en lote de una o varias tablas de DynamoDB
   */
  async batchGetItems(
    requestItems: Record<string, { Keys: Record<string, any>[] }>,
  ) {
    // Convertir las claves a formato DynamoDB
    const formattedRequestItems: Record<string, { Keys: any[] }> = {};

    for (const tableName in requestItems) {
      formattedRequestItems[tableName] = {
        Keys: requestItems[tableName].Keys.map(key => marshall(key)),
      };
    }

    const command = new BatchGetItemCommand({
      RequestItems: formattedRequestItems,
    });

    const response = await this.dynamoDBClient.send(command);

    // Desmarshall los resultados
    const formattedResponse: Record<string, any[]> = {};

    if (response.Responses) {
      for (const tableName in response.Responses) {
        formattedResponse[tableName] = response.Responses[tableName].map(item =>
          unmarshall(item),
        );
      }
    }

    return formattedResponse;
  }
}
