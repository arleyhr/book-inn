import { Test, TestingModule } from '@nestjs/testing';
import { HotelsController } from '../hotels.controller';
import { HotelsService } from '../../services/hotels.service';
import { ReviewsService } from '../../services/reviews.service';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { SearchHotelsDto } from '../../dto/search-hotels.dto';
import { User, UserRole } from '../../../users/entities/user.entity';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('HotelsController', () => {
  let controller: HotelsController;
  let hotelsService: HotelsService;
  let reviewsService: ReviewsService;

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
    confirmedReservations: [],
    cancelledReservations: []
  };

  const mockHotel = {
    id: 1,
    name: 'Test Hotel',
    address: 'Test Address',
    city: 'Test City',
    country: 'Test Country',
    agentId: mockUser.id,
    placeId: 'test_place_id',
    latitude: 0,
    longitude: 0,
    images: [],
    rooms: [],
    reviews: [],
    amenities: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: mockUser
  };

  const mockHotelsService = {
    search: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    getFeatured: jest.fn(),
    findAgentHotels: jest.fn(),
    toggleRoomAvailability: jest.fn()
  };

  const mockReviewsService = {
    create: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        {
          provide: HotelsService,
          useValue: mockHotelsService
        },
        {
          provide: ReviewsService,
          useValue: mockReviewsService
        }
      ]
    }).compile();

    controller = module.get<HotelsController>(HotelsController);
    hotelsService = module.get<HotelsService>(HotelsService);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all hotels', async () => {
      const hotels = [mockHotel];
      mockHotelsService.findAll.mockResolvedValue(hotels);

      const result = await controller.findAll();

      expect(result).toEqual(hotels);
      expect(hotelsService.findAll).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search hotels with given parameters', async () => {
      const searchDto: SearchHotelsDto = {
        checkIn: new Date('2024-03-01'),
        checkOut: new Date('2024-03-10'),
        city: 'Test City',
        country: 'Test Country',
        name: 'Test Hotel',
        minPrice: 100,
        maxPrice: 500,
        rating: 4
      };
      const hotels = [mockHotel];
      mockHotelsService.search.mockResolvedValue(hotels);

      const result = await controller.search(searchDto);

      expect(result).toEqual(hotels);
      expect(hotelsService.search).toHaveBeenCalledWith(searchDto);
    });
  });

  describe('getFeatured', () => {
    it('should return featured hotels with limit', async () => {
      const limit = 5;
      const hotels = [mockHotel];
      mockHotelsService.getFeatured.mockResolvedValue(hotels);

      const result = await controller.getFeatured(limit);

      expect(result).toEqual(hotels);
      expect(hotelsService.getFeatured).toHaveBeenCalledWith(limit);
    });
  });

  describe('getAgentHotels', () => {
    it('should return hotels managed by the agent', async () => {
      const hotels = [mockHotel];
      mockHotelsService.findAgentHotels.mockResolvedValue(hotels);

      const result = await controller.getAgentHotels(mockUser);

      expect(result).toEqual(hotels);
      expect(hotelsService.findAgentHotels).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('create', () => {
    it('should create a hotel', async () => {
      const createDto: CreateHotelDto = {
        name: 'Test Hotel',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country',
        placeId: 'test_place_id'
      };
      mockHotelsService.create.mockResolvedValue(mockHotel);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(mockHotel);
      expect(hotelsService.create).toHaveBeenCalledWith({ ...createDto, agentId: mockUser.id });
    });
  });

  describe('update', () => {
    it('should update a hotel when user is the owner', async () => {
      const hotelId = '1';
      const updateDto: Partial<CreateHotelDto> = {
        name: 'Updated Hotel',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country'
      };
      mockHotelsService.findOne.mockResolvedValue(mockHotel);
      mockHotelsService.update.mockResolvedValue({ ...mockHotel, ...updateDto });

      const result = await controller.update(mockUser, hotelId, updateDto);

      expect(result).toBeDefined();
      expect(hotelsService.update).toHaveBeenCalledWith(parseInt(hotelId), { ...updateDto, agentId: mockUser.id });
    });

    it('should throw UnauthorizedException when user is not the owner', async () => {
      const hotelId = '1';
      const updateDto: Partial<CreateHotelDto> = {
        name: 'Updated Hotel',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country'
      };
      mockHotelsService.findOne.mockResolvedValue({ ...mockHotel, agentId: 999 });

      await expect(controller.update(mockUser, hotelId, updateDto))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    it('should return a hotel by id', async () => {
      const hotelId = '1';
      mockHotelsService.findOne.mockResolvedValue(mockHotel);

      const result = await controller.findOne(hotelId);

      expect(result).toEqual(mockHotel);
      expect(hotelsService.findOne).toHaveBeenCalledWith(parseInt(hotelId));
    });

    it('should throw NotFoundException when hotel not found', async () => {
      const hotelId = '999';
      mockHotelsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(hotelId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a hotel when user is the owner', async () => {
      const hotelId = '1';
      mockHotelsService.findOne.mockResolvedValue(mockHotel);
      mockHotelsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser, hotelId);

      expect(hotelsService.remove).toHaveBeenCalledWith(parseInt(hotelId));
    });

    it('should throw UnauthorizedException when user is not the owner', async () => {
      const hotelId = '1';
      mockHotelsService.findOne.mockResolvedValue({ ...mockHotel, agentId: 999 });

      await expect(controller.remove(mockUser, hotelId))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('toggleRoomAvailability', () => {
    it('should toggle room availability when user is the owner', async () => {
      const hotelId = '1';
      const roomId = '1';
      mockHotelsService.findOne.mockResolvedValue(mockHotel);
      mockHotelsService.toggleRoomAvailability.mockResolvedValue({ id: 1, isAvailable: false });

      await controller.toggleRoomAvailability(mockUser, hotelId, roomId);

      expect(hotelsService.toggleRoomAvailability).toHaveBeenCalledWith(parseInt(hotelId), parseInt(roomId));
    });

    it('should throw UnauthorizedException when user is not the owner', async () => {
      const hotelId = '1';
      const roomId = '1';
      mockHotelsService.findOne.mockResolvedValue({ ...mockHotel, agentId: 999 });

      await expect(controller.toggleRoomAvailability(mockUser, hotelId, roomId))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createReview', () => {
    it('should create a review for a hotel', async () => {
      const hotelId = '1';
      const createReviewDto = {
        rating: 4,
        comment: 'Great hotel!'
      };
      const mockReview = {
        id: 1,
        ...createReviewDto,
        userId: mockUser.id,
        hotelId: parseInt(hotelId),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockReviewsService.create.mockResolvedValue(mockReview);

      const result = await controller.createReview(mockUser, hotelId, createReviewDto);

      expect(result).toEqual(mockReview);
      expect(reviewsService.create).toHaveBeenCalledWith({
        ...createReviewDto,
        userId: mockUser.id,
        hotelId: parseInt(hotelId)
      });
    });
  });
});
