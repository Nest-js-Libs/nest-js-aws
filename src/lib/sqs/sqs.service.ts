import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
  SendMessageBatchCommand,
  DeleteMessageBatchCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.queueUrl = this.configService.getOrThrow<string>('AWS_SQS_QUEUE_URL');

    this.sqsClient = new SQSClient({
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
   * Envía un mensaje a la cola SQS
   */
  async sendMessage(
    messageBody: string,
    delaySeconds = 0,
    messageAttributes?: Record<string, any>,
  ) {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: messageBody,
      DelaySeconds: delaySeconds,
      MessageAttributes: messageAttributes,
    });

    return await this.sqsClient.send(command);
  }

  /**
   * Recibe mensajes de la cola SQS
   */
  async receiveMessages(
    maxNumberOfMessages = 10,
    visibilityTimeout = 30,
    waitTimeSeconds = 0,
  ) {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: maxNumberOfMessages,
      VisibilityTimeout: visibilityTimeout,
      WaitTimeSeconds: waitTimeSeconds,
    });

    return await this.sqsClient.send(command);
  }

  /**
   * Elimina un mensaje de la cola SQS después de procesarlo
   */
  async deleteMessage(receiptHandle: string) {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    return await this.sqsClient.send(command);
  }

  /**
   * Obtiene atributos de la cola SQS
   */
  async getQueueAttributes(
    attributeNames: [
      // AttributeNameList
      | 'All'
      | 'Policy'
      | 'VisibilityTimeout'
      | 'MaximumMessageSize'
      | 'MessageRetentionPeriod'
      | 'ApproximateNumberOfMessages'
      | 'ApproximateNumberOfMessagesNotVisible'
      | 'CreatedTimestamp'
      | 'LastModifiedTimestamp'
      | 'QueueArn'
      | 'ApproximateNumberOfMessagesDelayed'
      | 'DelaySeconds'
      | 'ReceiveMessageWaitTimeSeconds'
      | 'RedrivePolicy'
      | 'FifoQueue'
      | 'ContentBasedDeduplication'
      | 'KmsMasterKeyId'
      | 'KmsDataKeyReusePeriodSeconds'
      | 'DeduplicationScope'
      | 'FifoThroughputLimit'
      | 'RedriveAllowPolicy'
      | 'SqsManagedSseEnabled',
    ] = ['All'],
  ) {
    const command = new GetQueueAttributesCommand({
      QueueUrl: this.queueUrl,
      AttributeNames: attributeNames,
    });

    return await this.sqsClient.send(command);
  }

  /**
   * Envía múltiples mensajes en lote a la cola SQS
   */
  async sendMessageBatch(
    entries: { id: string; messageBody: string; delaySeconds?: number }[],
  ) {
    const command = new SendMessageBatchCommand({
      QueueUrl: this.queueUrl,
      Entries: entries.map(entry => ({
        Id: entry.id,
        MessageBody: entry.messageBody,
        DelaySeconds: entry.delaySeconds,
      })),
    });

    return await this.sqsClient.send(command);
  }

  /**
   * Elimina múltiples mensajes en lote de la cola SQS
   */
  async deleteMessageBatch(entries: { id: string; receiptHandle: string }[]) {
    const command = new DeleteMessageBatchCommand({
      QueueUrl: this.queueUrl,
      Entries: entries.map(entry => ({
        Id: entry.id,
        ReceiptHandle: entry.receiptHandle,
      })),
    });

    return await this.sqsClient.send(command);
  }
}
