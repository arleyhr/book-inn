import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationsController } from './controllers/reservations.controller';
import { ReservationsService } from './services/reservations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
