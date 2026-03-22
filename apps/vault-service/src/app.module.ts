import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VaultModule } from './vault/vault.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VaultModule,
  ],
})
export class AppModule {}
