import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../entities/hotel.entity';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { GooglePlacesService } from './google-places.service';
import { Amenity } from '../entities/amenity.entity';
import { SearchHotelsDto } from '../dto/search-hotels.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    private readonly googlePlacesService: GooglePlacesService,
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  private async processGooglePlacesImages(hotel: Hotel): Promise<Hotel> {
    if (hotel.placeId && (!hotel.images || hotel.images.length === 0)) {
      const placeDetails = await this.googlePlacesService.getPlaceDetails(hotel.placeId);
      const photos = await this.googlePlacesService.getPlacePhotos(placeDetails.photos || []);

      if (photos.length > 0) {
        hotel.images = photos;
        await this.hotelRepository.save(hotel);
      }
    }
    return hotel;
  }

  private async processHotelsImages(hotels: Hotel[]): Promise<Hotel[]> {
    return await Promise.all(hotels.map(hotel => this.processGooglePlacesImages(hotel)));
  }

  async findAll(): Promise<Hotel[]> {
    const hotels = await this.hotelRepository.find({
      relations: ['rooms', 'reviews', 'amenities'],
    });

    return this.processHotelsImages(hotels);
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['rooms', 'reviews', 'amenities'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return this.processGooglePlacesImages(hotel);
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

  async search(searchParams: SearchHotelsDto): Promise<Hotel[]> {
    const query = this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.reviews', 'review')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true });

    if (searchParams.city) {
      query.andWhere('LOWER(hotel.city) LIKE LOWER(:city)', {
        city: `%${searchParams.city}%`,
      });
    }

    if (searchParams.country) {
      query.andWhere('LOWER(hotel.country) LIKE LOWER(:country)', {
        country: `%${searchParams.country}%`,
      });
    }

    if (searchParams.name) {
      query.andWhere('LOWER(hotel.name) LIKE LOWER(:name)', {
        name: `%${searchParams.name}%`,
      });
    }

    if (searchParams.checkIn && searchParams.checkOut) {
      query
        .andWhere('room.isAvailable = :isAvailable', { isAvailable: true })
        .andWhere(
          'NOT EXISTS (SELECT 1 FROM reservation r WHERE r.roomId = room.id AND ' +
          '((r.checkInDate <= :checkOut AND r.checkOutDate >= :checkIn)))',
          {
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
          }
        );
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      if (searchParams.minPrice) {
        query.andWhere('room.basePrice >= :minPrice', {
          minPrice: searchParams.minPrice,
        });
      }
      if (searchParams.maxPrice) {
        query.andWhere('room.basePrice <= :maxPrice', {
          maxPrice: searchParams.maxPrice,
        });
      }
    }

    if (searchParams.rating) {
      query
        .addSelect('AVG(review.rating)', 'avgRating')
        .groupBy('hotel.id')
        .having('AVG(review.rating) >= :rating', {
          rating: searchParams.rating,
        });
    }

    if (searchParams.guests) {
      query.andWhere('room.maxGuests >= :guests', {
        guests: searchParams.guests,
      });
    }

    const hotels = await query.getMany();
    return this.processHotelsImages(hotels);
  }

  async refreshHotelImages(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (!hotel.placeId) {
      throw new NotFoundException('Hotel is not from Google Places');
    }

    return this.processGooglePlacesImages(hotel);
  }
}
