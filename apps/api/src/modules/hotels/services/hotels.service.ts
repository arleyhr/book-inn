import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../entities/hotel.entity';
import { Room } from '../entities/room.entity';
import { CreateHotelDto, CreateRoomDto } from '../dto/create-hotel.dto';
import { GooglePlacesService } from './google-places.service';
import { CloudinaryService } from './cloudinary.service';
import { Amenity } from '../entities/amenity.entity';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { ConfigService } from '@nestjs/config';

interface UpdateRoomDto extends Partial<Room> {
  id?: number;
  type: string;
  basePrice: number;
  taxes: number;
  location: string;
  isAvailable?: boolean;
}

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly googlePlacesService: GooglePlacesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  private async processGooglePlacesImages(hotel: Hotel): Promise<Hotel> {
    if (hotel.placeId && (!hotel.images || hotel.images.length === 0)) {
      const placeDetails = await this.googlePlacesService.getPlaceDetails(hotel.placeId);
      const photos = await this.googlePlacesService.getPlacePhotos(placeDetails.photos || []);

      if (photos.length > 0) {
        if (this.configService.get('NODE_ENV') === 'production') {
          const cloudinaryUrls = await Promise.all(
            photos.map(photo => this.cloudinaryService.uploadImage(photo))
          );
          hotel.images = cloudinaryUrls;
        } else {
          hotel.images = photos;
        }
        await this.hotelRepository.save(hotel);
      }
    }
    return hotel;
  }

  private async processHotelsImages(hotels: Hotel[]): Promise<Hotel[]> {
    return hotels;
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

    return hotel;
  }

  async findAgentHotels(agentId: number): Promise<Hotel[]> {
    return this.hotelRepository.find({
      where: { agentId },
      relations: ['rooms', 'amenities', 'reviews'],
      order: {
        createdAt: 'DESC',
      },
    });
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
    const { rooms = [], images = [], ...hotelData } = createHotelDto;

    let processedImages = images;

    processedImages = await Promise.all(
      images.map(image => this.cloudinaryService.uploadImage(image))
    );

    if (!hotelData.maxGuestCapacity && rooms.length > 0) {
      hotelData.maxGuestCapacity = rooms.reduce((total, room) => total + (room.guestCapacity || 1), 0);
    }

    const hotel = this.hotelRepository.create({
      ...hotelData,
      images: processedImages
    });
    const savedHotel = await this.hotelRepository.save(hotel);

    if (rooms.length > 0) {
      const roomEntities = rooms.map(room =>
        this.roomRepository.create({
          ...room,
          hotelId: savedHotel.id,
          isAvailable: true
        })
      );
      savedHotel.rooms = await this.roomRepository.save(roomEntities);
      return this.hotelRepository.save(savedHotel);
    }

    return savedHotel;
  }

  async save(hotel: Hotel): Promise<Hotel> {
    return this.hotelRepository.save(hotel);
  }

  async update(id: number, updateHotelDto: Partial<CreateHotelDto>): Promise<Hotel> {
    const hotel = await this.findOne(id);
    const { rooms, images, ...hotelData } = updateHotelDto;

    const currentImages = hotel.images || [];
    const imagesToDelete = currentImages.filter(img => !images.includes(img));
    const newImages = images.filter(img => !currentImages.includes(img));

    await Promise.all(
      imagesToDelete.map(image => this.cloudinaryService.deleteImage(image))
    );

    const newCloudinaryUrls = await Promise.all(
      newImages.map(image => this.cloudinaryService.uploadImage(image))
    );

    hotel.images = [
      ...currentImages.filter(img => images.includes(img)),
      ...newCloudinaryUrls
    ];

    Object.assign(hotel, hotelData);
    await this.hotelRepository.save(hotel);

    if (rooms) {
      if (hotel.rooms?.length) {
        const updatedRoomIds = rooms.filter(room => room.id).map(room => Number(room.id));

        const roomsToRemove = hotel.rooms.filter(room => !updatedRoomIds.includes(room.id));

        for (const room of roomsToRemove) {
          const hasActiveReservations = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.reservations', 'reservation')
            .where('room.id = :roomId', { roomId: room.id })
            .andWhere('reservation.status IN (:...statuses)', {
              statuses: ['pending', 'confirmed']
            })
            .getOne();

          if (hasActiveReservations) {
            room.isAvailable = false;
            await this.roomRepository.save(room);
          } else {
            await this.roomRepository.remove(room);
          }
        }
      }

      const roomEntities = await Promise.all(rooms.map(async (room: CreateRoomDto) => {
        if (room.id) {
          const existingRoom = await this.roomRepository.findOne({ where: { id: Number(room.id) } });
          if (existingRoom) {
            Object.assign(existingRoom, {
              ...room,
              hotelId: hotel.id,
              isAvailable: typeof room.isAvailable === 'boolean' ? room.isAvailable : existingRoom.isAvailable
            });
            return this.roomRepository.save(existingRoom);
          }
        }
        return this.roomRepository.create({
          ...room,
          hotelId: hotel.id,
          guestCapacity: room.guestCapacity || 1,
          isAvailable: typeof room.isAvailable === 'boolean' ? room.isAvailable : true
        });
      }));

      hotel.rooms = await this.roomRepository.save(roomEntities);
    }

    return this.hotelRepository.save(hotel);
  }

  async remove(id: number): Promise<void> {
    const hotel = await this.findOne(id);

    if (this.configService.get('NODE_ENV') === 'production' && hotel.images?.length > 0) {
      await Promise.all(
        hotel.images.map(image => this.cloudinaryService.deleteImage(image))
      );
    }

    for (const room of hotel.rooms) {
      const hasActiveReservations = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.reservations', 'reservation')
        .where('room.id = :roomId', { roomId: room.id })
        .andWhere('reservation.status IN (:...statuses)', {
          statuses: ['pending', 'confirmed']
        })
        .getOne();

      if (hasActiveReservations) {
        room.isAvailable = false;
        await this.roomRepository.save(room);
      }
    }

    if (hotel.rooms.some(room => !room.isAvailable)) {
      hotel.isActive = false;
      await this.hotelRepository.save(hotel);
    } else {
      await this.hotelRepository.remove(hotel);
    }
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
          'NOT EXISTS (SELECT 1 FROM reservations r WHERE r.roomId = room.id AND ' +
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
      query.andWhere(
        '(hotel.maxGuestCapacity >= :guests OR EXISTS (SELECT 1 FROM rooms r WHERE r.hotelId = hotel.id AND r.guestCapacity >= :guests))',
        { guests: searchParams.guests }
      );
    }

    const hotels = await query.getMany();
    return this.processHotelsImages(hotels);
  }

  async refreshHotelImages(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (!hotel.placeId) {
      throw new NotFoundException('Hotel is not from Google Places');
    }

    return hotel;
  }

  async getFeatured(limit = 6): Promise<Hotel[]> {
    const query = this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.reviews', 'review')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true })
      .orderBy('RAND()')
      .take(limit);

    const hotels = await query.getMany();
    return this.processHotelsImages(hotels);
  }

  async toggleRoomAvailability(hotelId: number, roomId: number): Promise<Hotel> {
    const hotel = await this.findOne(hotelId);
    const room = hotel.rooms.find(r => r.id === roomId);

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found in hotel ${hotelId}`);
    }

    room.isAvailable = !room.isAvailable;
    return this.hotelRepository.save(hotel);
  }
}
