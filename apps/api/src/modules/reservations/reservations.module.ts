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

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationMessage, Room])],
  controllers: [ReservationsController, StatisticsController, MessagesController],
  providers: [ReservationsService, StatisticsService, MessagesService],
  exports: [ReservationsService, StatisticsService, MessagesService],
})
export class ReservationsModule {}
