import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { VaultClientService } from './vault-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'VAULT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'vault',
          protoPath: join(__dirname, '../../../../packages/proto/vault.proto'),
          url: '127.0.0.1:50051',
          maxReceiveMessageLength: 50 * 1024 * 1024,
          maxSendMessageLength: 50 * 1024 * 1024,
          loader: {
            keepCase: true,
          },
        },
      },
    ]),
  ],
  providers: [VaultClientService],
  exports: [VaultClientService],
})
export class VaultClientModule {}
