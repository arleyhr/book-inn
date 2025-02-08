import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../entities/hotel.entity';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { GooglePlacesService } from './google-places.service';
import { Amenity } from '../entities/amenity.entity';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    private readonly googlePlacesService: GooglePlacesService,
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  async findAll(): Promise<Hotel[]> {
    const hotels = await this.hotelRepository.find({
      relations: ['rooms', 'reviews', 'amenities'],
    });

    // Procesar imágenes para hoteles de Google Places
    return await Promise.all(
      hotels.map(async (hotel) => {
        if (hotel.placeId && (!hotel.images || hotel.images.length === 0)) {
          const photos = await this.googlePlacesService.getPlacePhotos(
            (await this.googlePlacesService.getPlaceDetails(hotel.placeId)).photos || []
          );

          if (photos.length > 0) {
            hotel.images = photos;
            await this.hotelRepository.save(hotel);
          }
        }
        return hotel;
      })
    );
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['rooms', 'reviews', 'amenities'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    // Procesar imágenes si es un hotel de Google Places
    if (hotel.placeId && (!hotel.images || hotel.images.length === 0)) {
      const photos = await this.googlePlacesService.getPlacePhotos(
        (await this.googlePlacesService.getPlaceDetails(hotel.placeId)).photos || []
      );

      if (photos.length > 0) {
        hotel.images = photos;
        await this.hotelRepository.save(hotel);
      }
    }

    return hotel;
  }

  async createOrFindService(name: string): Promise<Amenity> {
    let amenity = await this.amenityRepository.findOne({ where: { name } });

    if (!amenity) {
      amenity = this.amenityRepository.create({ name });
      await this.amenityRepository.save(amenity);
    }

    return amenity;
  }

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const hotel = this.hotelRepository.create(createHotelDto);
    return this.hotelRepository.save(hotel);
  }

  async save(hotel: Hotel): Promise<Hotel> {
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

  async refreshHotelImages(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (!hotel.placeId) {
      throw new NotFoundException('Hotel is not from Google Places');
    }

    const photos = await this.googlePlacesService.getPlacePhotos(
      (await this.googlePlacesService.getPlaceDetails(hotel.placeId)).photos || []
    );

    if (photos.length > 0) {
      hotel.images = photos;
      await this.hotelRepository.save(hotel);
    }

    return hotel;
  }
}
