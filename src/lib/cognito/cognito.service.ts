import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class CognitoService {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;
  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.userPoolId = this.configService.getOrThrow<string>(
      'AWS_COGNITO_USER_POOL_ID',
    );
    this.clientId = this.configService.getOrThrow<string>(
      'AWS_COGNITO_CLIENT_ID',
    );

    this.cognitoClient = new CognitoIdentityProviderClient({
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
   * Inicia sesión de un usuario
   */
  async signIn(username: string, password: string) {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Registra un nuevo usuario
   */
  async signUp(
    username: string,
    password: string,
    email: string,
    phoneNumber?: string,
  ) {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        ...(phoneNumber
          ? [
              {
                Name: 'phone_number',
                Value: phoneNumber,
              },
            ]
          : []),
      ],
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Confirma el registro de un usuario
   */
  async confirmSignUp(username: string, confirmationCode: string) {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Solicita un código para restablecer la contraseña
   */
  async forgotPassword(username: string) {
    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: username,
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Confirma el restablecimiento de contraseña
   */
  async confirmForgotPassword(
    username: string,
    confirmationCode: string,
    newPassword: string,
  ) {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Obtiene información del usuario actual
   */
  async getUser(accessToken: string) {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Crea un usuario como administrador
   */
  async adminCreateUser(
    username: string,
    email: string,
    temporaryPassword: string,
  ) {
    const command = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      TemporaryPassword: temporaryPassword,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Establece la contraseña de un usuario como administrador
   */
  async adminSetUserPassword(
    username: string,
    password: string,
    permanent = true,
  ) {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      Password: password,
      Permanent: permanent,
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Elimina un usuario como administrador
   */
  async adminDeleteUser(username: string) {
    const command = new AdminDeleteUserCommand({
      UserPoolId: this.userPoolId,
      Username: username,
    });

    return await this.cognitoClient.send(command);
  }

  /**
   * Lista todos los usuarios
   */
  async listUsers(limit = 10, paginationToken?: string) {
    const command = new ListUsersCommand({
      UserPoolId: this.userPoolId,
      Limit: limit,
      ...(paginationToken && { PaginationToken: paginationToken }),
    });

    return await this.cognitoClient.send(command);
  }
}
