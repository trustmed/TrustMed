import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreProxyModule } from './core-proxy/core-proxy.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { ConsentRequestsModule } from './consent-requests/consent-requests.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CoreProxyModule,
    AuthModule,
    PatientsModule,
    ConsentRequestsModule,
  ],
})
export class AppModule {}

