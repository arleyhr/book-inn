import { IsString, IsEmail, IsPhoneNumber, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

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

  @IsPhoneNumber()
  @IsNotEmpty()
  guestPhone: string;

  @IsString()
  @IsNotEmpty()
  emergencyContactName: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  emergencyContactPhone: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  roomId: number;
}
