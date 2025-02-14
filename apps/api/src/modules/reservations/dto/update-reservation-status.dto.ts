import { IsNotEmpty, IsEnum } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status: ReservationStatus;
}
