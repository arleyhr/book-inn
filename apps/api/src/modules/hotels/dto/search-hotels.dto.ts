import { IsOptional, IsString, IsDate, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchHotelsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  checkIn?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  checkOut?: Date;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}
