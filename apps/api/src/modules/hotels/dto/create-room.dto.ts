import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  basePrice: number;

  @IsNumber()
  @IsNotEmpty()
  taxes: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsNotEmpty()
  hotelId: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  guestCapacity?: number;
} 