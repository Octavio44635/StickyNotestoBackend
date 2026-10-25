import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// ObserveInstrument?
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', //Asi nomas?
    credentials: true,
  });

  app.setGlobalPrefix('api'); //No se que tan bien esta esto pero va


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API de StickyNotes')
      .setDescription('API para la gestión de notas adhesivas')
      .addTag('notes')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

/*
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();


 Main tiene la funcion boopstrap que no se que hace y la funcion de creacion de doucmento de Swagger
Capaz es lo que se ejecuta primero, tiene lo del puerto incluso
*/
