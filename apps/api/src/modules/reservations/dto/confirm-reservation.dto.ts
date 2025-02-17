import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConfirmReservationDto {
  @IsNumber()
  @IsNotEmpty()
  reservationId: number;
}
