import { IsString, IsEmail, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  checkInDate: string;

  @IsDateString()
  @IsNotEmpty()
  checkOutDate: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  @IsNotEmpty()
  guestEmail: string;

  @IsNotEmpty()
  guestPhone: string;

  @IsString()
  @IsNotEmpty()
  emergencyContactName: string;

  @IsNotEmpty()
  emergencyContactPhone: string;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  roomId: number;
}
