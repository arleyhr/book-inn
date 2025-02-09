import { IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class ListReservationsDto {
  @IsOptional()
  @IsNumber()
  hotelId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
