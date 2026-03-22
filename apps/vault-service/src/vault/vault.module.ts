import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { CryptoService } from '../crypto/crypto.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [ConfigModule, StorageModule],
  controllers: [VaultController],
  providers: [VaultService, CryptoService],
  exports: [VaultService],
})
export class VaultModule {}
