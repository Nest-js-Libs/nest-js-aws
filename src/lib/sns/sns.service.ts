import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SNSClient,
  PublishCommand,
  CreateTopicCommand,
  DeleteTopicCommand,
  SubscribeCommand,
  UnsubscribeCommand,
  ListSubscriptionsByTopicCommand,
  ListTopicsCommand,
} from '@aws-sdk/client-sns';

@Injectable()
export class SnsService {
  private readonly snsClient: SNSClient;

  constructor(private readonly configService: ConfigService) {
    this.snsClient = new SNSClient({
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
   * Publica un mensaje en un tema SNS
   */
  async publish(
    topicArn: string,
    message: string,
    subject?: string,
    messageAttributes?: Record<string, any>,
  ) {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: message,
      ...(subject && { Subject: subject }),
      ...(messageAttributes && { MessageAttributes: messageAttributes }),
    });

    return await this.snsClient.send(command);
  }

  /**
   * Crea un nuevo tema SNS
   */
  async createTopic(name: string, attributes?: Record<string, string>) {
    const command = new CreateTopicCommand({
      Name: name,
      ...(attributes && { Attributes: attributes }),
    });

    return await this.snsClient.send(command);
  }

  /**
   * Elimina un tema SNS
   */
  async deleteTopic(topicArn: string) {
    const command = new DeleteTopicCommand({
      TopicArn: topicArn,
    });

    return await this.snsClient.send(command);
  }

  /**
   * Suscribe un endpoint a un tema SNS
   */
  async subscribe(
    topicArn: string,
    protocol: string,
    endpoint: string,
    attributes?: Record<string, string>,
  ) {
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol, // 'email', 'sms', 'http', 'https', 'sqs', 'lambda', etc.
      Endpoint: endpoint,
      ...(attributes && { Attributes: attributes }),
    });

    return await this.snsClient.send(command);
  }

  /**
   * Cancela la suscripción a un tema SNS
   */
  async unsubscribe(subscriptionArn: string) {
    const command = new UnsubscribeCommand({
      SubscriptionArn: subscriptionArn,
    });

    return await this.snsClient.send(command);
  }

  /**
   * Lista las suscripciones de un tema SNS
   */
  async listSubscriptionsByTopic(topicArn: string, nextToken?: string) {
    const command = new ListSubscriptionsByTopicCommand({
      TopicArn: topicArn,
      ...(nextToken && { NextToken: nextToken }),
    });

    return await this.snsClient.send(command);
  }

  /**
   * Lista todos los temas SNS
   */
  async listTopics(nextToken?: string) {
    const command = new ListTopicsCommand({
      ...(nextToken && { NextToken: nextToken }),
    });

    return await this.snsClient.send(command);
  }
}
