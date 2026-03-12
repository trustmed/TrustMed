import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Set global prefix so routes become /internal/*
    app.setGlobalPrefix('internal');

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('TrustMed Connector Node')
        .setDescription('Internal API for S3 Vault — encrypted file storage & presigned URLs')
        .setVersion('1.0.0')
        .addTag('s3-vault', 'Encrypted file upload & presigned download URLs')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT ?? 5000;

    await app.listen(port);
    console.log(`Connector Node is running on: http://localhost:${port}`);
    console.log(`Swagger documentation: http://localhost:${port}/api`);
}
void bootstrap();
