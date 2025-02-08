import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../entities/hotel.entity';
import { CreateHotelDto } from '../dto/create-hotel.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find({
      relations: ['rooms', 'reviews'],
    });
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['rooms', 'reviews'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const hotel = this.hotelRepository.create(createHotelDto);
    return this.hotelRepository.save(hotel);
  }

  async update(id: number, updateHotelDto: CreateHotelDto): Promise<Hotel> {
    const hotel = await this.findOne(id);
    const updatedHotel = Object.assign(hotel, updateHotelDto);
    return this.hotelRepository.save(updatedHotel);
  }

  async remove(id: number): Promise<void> {
    const hotel = await this.findOne(id);
    await this.hotelRepository.remove(hotel);
  }
} 