import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS 
  app.enableCors({
    origin: true, // Allow all origins for dev.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('TrustMed Core API')
    .setDescription('API documentation for the TrustMed Core backend')
    .setVersion('1.0.0')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 2. Change Default Port to 4000
  const port = process.env.PORT ?? 4000; 
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
void bootstrap();