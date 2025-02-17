import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelsService } from '../hotels.service';
import { Hotel } from '../../entities/hotel.entity';
import { Amenity } from '../../entities/amenity.entity';
import { GooglePlacesService } from '../google-places.service';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { SearchHotelsDto } from '../../dto/search-hotels.dto';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../users/entities/user.entity';
import { User } from '../../../users/entities/user.entity';
import { Room } from '../../entities/room.entity';

describe('HotelsService', () => {
  let service: HotelsService;
  let hotelRepository: Repository<Hotel>;
  let amenityRepository: Repository<Amenity>;
  let googlePlacesService: GooglePlacesService;

  const testData = {
    dates: {
      checkIn: new Date('2024-03-01'),
      checkOut: new Date('2024-03-10')
    },
    location: {
      city: 'Bogotá',
      country: 'Colombia',
      latitude: 4.710989,
      longitude: -74.072092
    },
    ids: {
      hotelId: 1,
      userId: 1,
      placeId: 'test_place_id'
    },
    prices: {
      min: 100,
      max: 500,
      base: 150
    },
    rating: 4
  };

  const mockUser: User = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password',
    role: UserRole.AGENT,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn(),
    managedHotels: [],
    reviews: [],
    reservations: [],
    sentMessages: [],
    cancelledReservations: [],
    confirmedReservations: []
  };

  const mockHotel: Hotel = {
    id: testData.ids.hotelId,
    name: 'Test Hotel',
    address: 'Test Address',
    city: testData.location.city,
    country: testData.location.country,
    latitude: testData.location.latitude,
    longitude: testData.location.longitude,
    placeId: testData.ids.placeId,
    agentId: testData.ids.userId,
    isActive: true,
    images: [],
    rooms: [],
    reviews: [],
    amenities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: mockUser
  };

  const mockHotelEntity = mockHotel as unknown as Hotel;

  const mockAmenity: Amenity = {
    id: '1',
    name: 'WiFi',
    hotels: []
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis()
  };

  const mockHotelRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder)
  };

  const mockRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder)
  };

  const mockAmenityRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
  };

  const mockGooglePlacesService = {
    getPlaceDetails: jest.fn(),
    getPlacePhotos: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        {
          provide: getRepositoryToken(Hotel),
          useValue: mockHotelRepository
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository
        },
        {
          provide: getRepositoryToken(Amenity),
          useValue: mockAmenityRepository
        },
        {
          provide: GooglePlacesService,
          useValue: mockGooglePlacesService
        }
      ]
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    hotelRepository = module.get<Repository<Hotel>>(getRepositoryToken(Hotel));
    amenityRepository = module.get<Repository<Amenity>>(getRepositoryToken(Amenity));
    googlePlacesService = module.get<GooglePlacesService>(GooglePlacesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of hotels', async () => {
      const mockHotels = [mockHotel];
      mockHotelRepository.find.mockResolvedValue(mockHotels);
      mockGooglePlacesService.getPlaceDetails.mockResolvedValue({});
      mockGooglePlacesService.getPlacePhotos.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual(mockHotels);
      expect(hotelRepository.find).toHaveBeenCalledWith({
        relations: ['rooms', 'reviews', 'amenities']
      });
    });
  });

  describe('findOne', () => {
    it('should return a single hotel', async () => {
      mockHotelRepository.findOne.mockResolvedValue(mockHotel);
      mockGooglePlacesService.getPlaceDetails.mockResolvedValue({});
      mockGooglePlacesService.getPlacePhotos.mockResolvedValue([]);

      const result = await service.findOne(testData.ids.hotelId);

      expect(result).toEqual(mockHotel);
      expect(hotelRepository.findOne).toHaveBeenCalledWith({
        where: { id: testData.ids.hotelId },
        relations: ['rooms', 'reviews', 'amenities']
      });
    });

    it('should throw NotFoundException when hotel not found', async () => {
      mockHotelRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new hotel', async () => {
      const createHotelDto: CreateHotelDto = {
        name: 'New Hotel',
        address: 'New Address',
        city: testData.location.city,
        country: testData.location.country,
        latitude: testData.location.latitude,
        longitude: testData.location.longitude,
        placeId: testData.ids.placeId,
        agentId: testData.ids.userId
      };

      mockHotelRepository.create.mockReturnValue(createHotelDto);
      mockHotelRepository.save.mockResolvedValue({ id: testData.ids.hotelId, ...createHotelDto });

      const result = await service.create(createHotelDto);

      expect(result).toEqual({ id: testData.ids.hotelId, ...createHotelDto });
      expect(hotelRepository.create).toHaveBeenCalledWith(createHotelDto);
      expect(hotelRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateHotelDto: CreateHotelDto = {
      name: 'Updated Hotel',
      address: 'Updated Address',
      city: testData.location.city,
      country: testData.location.country,
      latitude: testData.location.latitude,
      longitude: testData.location.longitude,
      placeId: testData.ids.placeId,
      agentId: testData.ids.userId
    };

    it('should update an existing hotel', async () => {
      mockHotelRepository.findOne.mockResolvedValue(mockHotel);
      mockHotelRepository.save.mockResolvedValue({ ...mockHotel, ...updateHotelDto });

      const result = await service.update(testData.ids.hotelId, updateHotelDto);

      expect(result).toEqual({ ...mockHotel, ...updateHotelDto });
      expect(hotelRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existing hotel', async () => {
      mockHotelRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateHotelDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing hotel', async () => {
      mockHotelRepository.findOne.mockResolvedValue(mockHotel);
      mockHotelRepository.remove.mockResolvedValue(mockHotel);

      await service.remove(testData.ids.hotelId);

      expect(hotelRepository.remove).toHaveBeenCalledWith(mockHotel);
    });

    it('should throw NotFoundException when removing non-existing hotel', async () => {
      mockHotelRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('save', () => {
    it('should save a hotel entity', async () => {
      const hotelToSave = {
        ...mockHotelEntity,
        name: 'Updated Hotel Name'
      };

      mockHotelRepository.save.mockResolvedValue(hotelToSave);

      const result = await service.save(hotelToSave);

      expect(result).toEqual(hotelToSave);
      expect(hotelRepository.save).toHaveBeenCalledWith(hotelToSave);
    });

    it('should handle save errors', async () => {
      const hotelToSave = {
        ...mockHotelEntity,
        name: 'Updated Hotel Name'
      };

      const error = new Error('Database error');
      mockHotelRepository.save.mockRejectedValue(error);

      await expect(service.save(hotelToSave)).rejects.toThrow(error);
    });
  });

  describe('getFeatured', () => {
    it('should return featured hotels with default limit', async () => {
      const mockHotels = [mockHotel, { ...mockHotel, id: 2 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockHotels);

      const result = await service.getFeatured();

      expect(result).toEqual(mockHotels);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('hotel.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('RAND()');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(6);
    });

    it('should return featured hotels with custom limit', async () => {
      const limit = 3;
      const mockHotels = [mockHotel, { ...mockHotel, id: 2 }, { ...mockHotel, id: 3 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockHotels);

      const result = await service.getFeatured(limit);

      expect(result).toEqual(mockHotels);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      mockGooglePlacesService.getPlaceDetails.mockResolvedValue({});
      mockGooglePlacesService.getPlacePhotos.mockResolvedValue([]);
      jest.clearAllMocks();
    });

    it('should search hotels with basic filters', async () => {
      const searchParams: SearchHotelsDto = {
        city: testData.location.city,
        checkIn: testData.dates.checkIn,
        checkOut: testData.dates.checkOut
      };

      mockQueryBuilder.getMany.mockResolvedValue([mockHotel]);

      const result = await service.search(searchParams);

      expect(result).toEqual([mockHotel]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('hotel.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(hotel.city) LIKE LOWER(:city)', {
        city: `%${testData.location.city}%`
      });
    });

    it('should search hotels by country', async () => {
      const searchParams: SearchHotelsDto = {
        country: testData.location.country
      };

      mockQueryBuilder.getMany.mockResolvedValue([mockHotel]);

      const result = await service.search(searchParams);

      expect(result).toEqual([mockHotel]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(hotel.country) LIKE LOWER(:country)', {
        country: `%${testData.location.country}%`
      });
    });

    it('should search hotels by name', async () => {
      const searchParams: SearchHotelsDto = {
        name: 'Grand Hotel'
      };

      mockQueryBuilder.getMany.mockResolvedValue([mockHotel]);

      const result = await service.search(searchParams);

      expect(result).toEqual([mockHotel]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(hotel.name) LIKE LOWER(:name)', {
        name: '%Grand Hotel%'
      });
    });

    it('should combine country and name filters', async () => {
      const searchParams: SearchHotelsDto = {
        country: testData.location.country,
        name: 'Grand Hotel'
      };

      mockQueryBuilder.getMany.mockResolvedValue([mockHotel]);

      const result = await service.search(searchParams);

      expect(result).toEqual([mockHotel]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(hotel.country) LIKE LOWER(:country)', {
        country: `%${testData.location.country}%`
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(hotel.name) LIKE LOWER(:name)', {
        name: '%Grand Hotel%'
      });
    });

    it('should search hotels with advanced filters', async () => {
      const searchParams: SearchHotelsDto = {
        city: testData.location.city,
        minPrice: testData.prices.min,
        maxPrice: testData.prices.max,
        rating: testData.rating
      };

      mockQueryBuilder.getMany.mockResolvedValue([mockHotel]);

      const result = await service.search(searchParams);

      expect(result).toEqual([mockHotel]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('room.basePrice >= :minPrice', {
        minPrice: testData.prices.min
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('room.basePrice <= :maxPrice', {
        maxPrice: testData.prices.max
      });
      expect(mockQueryBuilder.having).toHaveBeenCalledWith('AVG(review.rating) >= :rating', {
        rating: testData.rating
      });
    });

    it('should return empty array when no hotels found', async () => {
      const searchParams: SearchHotelsDto = {
        city: 'Unknown City'
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.search(searchParams);

      expect(result).toEqual([]);
    });
  });

  describe('createOrFindService', () => {
    it('should return existing amenity if found', async () => {
      mockAmenityRepository.findOne.mockResolvedValue(mockAmenity);

      const result = await service.createOrFindService('WiFi');

      expect(result).toEqual(mockAmenity);
      expect(amenityRepository.findOne).toHaveBeenCalledWith({ where: { name: 'WiFi' } });
      expect(amenityRepository.create).not.toHaveBeenCalled();
    });

    it('should create new amenity if not found', async () => {
      mockAmenityRepository.findOne.mockResolvedValue(null);
      mockAmenityRepository.create.mockReturnValue(mockAmenity);
      mockAmenityRepository.save.mockResolvedValue(mockAmenity);

      const result = await service.createOrFindService('WiFi');

      expect(result).toEqual(mockAmenity);
      expect(amenityRepository.create).toHaveBeenCalledWith({ name: 'WiFi' });
      expect(amenityRepository.save).toHaveBeenCalled();
    });
  });

  describe('refreshHotelImages', () => {
    const mockPlaceDetails = {
      photos: [{ photo_reference: 'test_photo_reference' }]
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockHotelRepository.findOne.mockReset();
      mockGooglePlacesService.getPlaceDetails.mockReset();
      mockGooglePlacesService.getPlacePhotos.mockReset();
    });

    it('should refresh hotel images from Google Places', async () => {
      const mockPhotos = ['photo1.jpg', 'photo2.jpg'];
      const updatedHotel = {
        ...mockHotel,
        images: mockPhotos
      };

      mockHotelRepository.findOne.mockResolvedValue(mockHotel);
      mockGooglePlacesService.getPlaceDetails.mockResolvedValue(mockPlaceDetails);
      mockGooglePlacesService.getPlacePhotos.mockResolvedValue(mockPhotos);
      mockHotelRepository.save.mockResolvedValue(updatedHotel);

      const result = await service.refreshHotelImages(testData.ids.hotelId);

      expect(result).toEqual(updatedHotel);
      expect(result.images).toEqual(mockPhotos);
      expect(mockHotelRepository.findOne).toHaveBeenCalledWith({
        where: { id: testData.ids.hotelId },
        relations: ['rooms', 'reviews', 'amenities']
      });
      expect(mockGooglePlacesService.getPlaceDetails).toHaveBeenCalledWith(mockHotel.placeId);
      expect(mockGooglePlacesService.getPlacePhotos).toHaveBeenCalledWith(mockPlaceDetails.photos);
      expect(mockHotelRepository.save).toHaveBeenCalled();
    });

    it('should handle missing photos in place details', async () => {
      const updatedHotel = {
        ...mockHotel,
        images: []
      };

      mockHotelRepository.findOne.mockResolvedValue(updatedHotel);
      mockGooglePlacesService.getPlaceDetails.mockResolvedValue(mockPlaceDetails);
      mockGooglePlacesService.getPlacePhotos.mockResolvedValue([]);

      const result = await service.refreshHotelImages(testData.ids.hotelId);

      expect(result.images).toEqual([]);
      expect(mockGooglePlacesService.getPlaceDetails).toHaveBeenCalledWith(updatedHotel.placeId);
    });

    it('should throw NotFoundException when hotel not found', async () => {
      mockHotelRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshHotelImages(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when hotel has no placeId', async () => {
      const hotelWithoutPlaceId = { ...mockHotel, placeId: null };
      mockHotelRepository.findOne.mockResolvedValue(hotelWithoutPlaceId);

      await expect(service.refreshHotelImages(testData.ids.hotelId)).rejects.toThrow(NotFoundException);
    });
  });
});
