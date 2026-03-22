import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'vault',
        protoPath: join(__dirname, '../../../packages/proto/vault.proto'),
        url: '0.0.0.0:50051',
        maxReceiveMessageLength: 50 * 1024 * 1024,
        maxSendMessageLength: 50 * 1024 * 1024,
        loader: {
          keepCase: true,
        },
      },
    },
  );
  await app.listen();
  console.log('Vault Microservice is listening on port 50051');
}
void bootstrap();
