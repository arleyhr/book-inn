import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EmailService } from '../modules/email/services/email.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('TestEmail');
  logger.log('Starting email test script...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const emailService = app.get(EmailService);

    logger.log('Email service initialized, attempting to send test email...');

    const result = await emailService.sendEmail({
      to: '', // test email
      subject: 'Prueba de Email desde BookInn con MailerSend',
      html: `
        <h1>Correo de Prueba</h1>
        <p>Este es un correo de prueba desde la aplicación BookInn usando MailerSend.</p>
        <p>Si estás recibiendo esto, ¡el servicio de correo está funcionando correctamente!</p>
        <p>Hora: ${new Date().toISOString()}</p>
      `,
      text: 'Este es un correo de prueba desde la aplicación BookInn usando MailerSend. Si estás recibiendo esto, ¡el servicio de correo está funcionando correctamente!',
    });

    logger.log(`Email sent successfully!`);

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Failed to send test email: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
