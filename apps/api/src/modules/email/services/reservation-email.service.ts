import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Room } from '../../hotels/entities/room.entity';
import { Hotel } from '../../hotels/entities/hotel.entity';
import {
  generateReservationConfirmationTemplate,
  ReservationConfirmationTemplateData
} from '../templates/reservation-confirmation.template';

@Injectable()
export class ReservationEmailService {
  private readonly logger = new Logger(ReservationEmailService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendReservationConfirmation(
    reservation: Reservation,
    room: Room,
    hotel: Hotel
  ) {
    // Verificar que todos los objetos necesarios existan
    if (!reservation || !room || !hotel) {
      this.logger.error('Cannot send confirmation email: Missing required objects', {
        hasReservation: !!reservation,
        hasRoom: !!room,
        hasHotel: !!hotel
      });
      throw new Error('Missing required data for sending confirmation email');
    }
    try {
      const totalPrice = Number(room.basePrice) + Number(room.taxes);

      const templateData: ReservationConfirmationTemplateData = {
        reservationId: reservation.id,
        guestName: reservation.guestName,
        hotelName: hotel.name,
        hotelAddress: hotel.address,
        hotelCity: hotel.city,
        hotelCountry: hotel.country,
        roomType: room.type,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        basePrice: Number(room.basePrice),
        taxes: Number(room.taxes),
        totalPrice,
        guestCount: reservation.guestCount || 1,
        emergencyContactName: reservation.emergencyContactName,
        emergencyContactPhone: reservation.emergencyContactPhone,
        cancellationPolicy: 'Cancellations made at least 48 hours in advance will receive a full refund. Later cancellations are non-refundable.'
      };

      const htmlContent = generateReservationConfirmationTemplate(templateData);

      const result = await this.emailService.sendEmail({
        to: reservation.guestEmail,
        subject: `Reservation Confirmation #${reservation.id} - ${hotel.name}`,
        html: htmlContent,
        text: `
          Reservation Confirmation #${reservation.id}

          Hello ${reservation.guestName},

          Your reservation at ${hotel.name} has been confirmed.

          Reservation details:
          - Check-in date: ${reservation.checkInDate.toLocaleDateString('en-US')}
          - Check-out date: ${reservation.checkOutDate.toLocaleDateString('en-US')}
          - Room type: ${room.type}
          - Number of guests: ${reservation.guestCount || 1}
          - Total price: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPrice)}

          Thank you for choosing BookInn.
        `
      });

      this.logger.log(`Confirmation email sent for reservation #${reservation.id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error sending confirmation email for reservation #${reservation.id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
