import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CancelReservationDto {
  @IsNumber()
  @IsNotEmpty()
  reservationId: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
