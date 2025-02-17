import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  @IsNotEmpty()
  reservationId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
