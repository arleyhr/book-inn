import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationMessage } from './entities/message.entity';
import { Room } from '../hotels/entities/room.entity';
import { ReservationsController } from './controllers/reservations.controller';
import { ReservationsService } from './services/reservations.service';
import { StatisticsController } from './controllers/statistics.controller';
import { StatisticsService } from './services/statistics.service';
import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';
import { EmailModule } from '../email/email.module';
import { RoomsService } from '../hotels/services/rooms.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationMessage, Room]),
    EmailModule
  ],
  controllers: [ReservationsController, StatisticsController, MessagesController],
  providers: [ReservationsService, StatisticsService, MessagesService, RoomsService],
  exports: [ReservationsService, StatisticsService, MessagesService, RoomsService],
})
export class ReservationsModule {}
