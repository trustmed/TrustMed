import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3VaultModule } from './s3-vault/s3-vault.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        S3VaultModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
