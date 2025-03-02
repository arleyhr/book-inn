import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ReservationEmailService } from './services/reservation-email.service';

@Module({
  providers: [EmailService, ReservationEmailService],
  exports: [EmailService, ReservationEmailService],
})
export class EmailModule {}
