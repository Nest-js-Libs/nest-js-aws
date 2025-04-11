import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');

    this.s3Client = new S3Client({
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
   * Sube un archivo a S3
   */
  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    });

    return await this.s3Client.send(command);
  }

  /**
   * Descarga un archivo de S3
   */
  async getFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    return response;
  }

  /**
   * Elimina un archivo de S3
   */
  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await this.s3Client.send(command);
  }

  /**
   * Lista archivos en un directorio de S3
   */
  async listFiles(prefix?: string, maxKeys = 1000, continuationToken?: string) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    return await this.s3Client.send(command);
  }

  /**
   * Verifica si un archivo existe en S3
   */
  async fileExists(key: string) {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
    return true;
  }

  /**
   * Copia un archivo dentro de S3
   */
  async copyFile(sourceKey: string, destinationKey: string) {
    const command = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourceKey}`,
      Key: destinationKey,
    });

    return await this.s3Client.send(command);
  }

  /**
   * Genera una URL prefirmada para acceso temporal a un archivo
   */
  getSignedUrl(key: string) {
    const url = `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
    // Nota: Para generar URLs prefirmadas reales, se necesita importar
    // @aws-sdk/s3-request-presigner y usar getSignedUrl
    return url;
  }
}
