import { Test, TestingModule } from '@nestjs/testing';
import { HotelsController } from '../hotels.controller';
import { HotelsService } from '../../services/hotels.service';
import { CreateHotelDto } from '../../dto/create-hotel.dto';
import { SearchHotelsDto } from '../../dto/search-hotels.dto';

describe('HotelsController', () => {
  let controller: HotelsController;
  let service: HotelsService;

  const mockHotelsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        {
          provide: HotelsService,
          useValue: mockHotelsService,
        },
      ],
    }).compile();

    controller = module.get<HotelsController>(HotelsController);
    service = module.get<HotelsService>(HotelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of hotels', async () => {
      const mockHotels = [
        { id: 1, name: 'Hotel A' },
        { id: 2, name: 'Hotel B' },
      ];

      mockHotelsService.findAll.mockResolvedValue(mockHotels);

      const result = await controller.findAll();

      expect(result).toEqual(mockHotels);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single hotel', async () => {
      const mockHotel = {
        id: 1,
        name: 'Hotel A',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
      };

      mockHotelsService.findOne.mockResolvedValue(mockHotel);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockHotel);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new hotel', async () => {
      const createHotelDto: CreateHotelDto = {
        name: 'New Hotel',
        address: '456 Park Ave',
        city: 'Los Angeles',
        country: 'USA',
        agentId: 1,
      };

      const expectedHotel = {
        id: 1,
        ...createHotelDto,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockHotelsService.create.mockResolvedValue(expectedHotel);

      const result = await controller.create(createHotelDto);

      expect(result).toEqual(expectedHotel);
      expect(service.create).toHaveBeenCalledWith(createHotelDto);
    });
  });

  describe('update', () => {
    it('should update an existing hotel', async () => {
      const updateHotelDto: CreateHotelDto = {
        name: 'Updated Hotel',
        address: '789 Beach Rd',
        city: 'Miami',
        country: 'USA',
        agentId: 1,
      };

      const expectedHotel = {
        id: 1,
        ...updateHotelDto,
        isActive: true,
        updatedAt: expect.any(Date),
      };

      mockHotelsService.update.mockResolvedValue(expectedHotel);

      const result = await controller.update('1', updateHotelDto);

      expect(result).toEqual(expectedHotel);
      expect(service.update).toHaveBeenCalledWith(1, updateHotelDto);
    });
  });

  describe('remove', () => {
    it('should remove a hotel', async () => {
      const mockResult = { affected: 1 };

      mockHotelsService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove('1');

      expect(result).toEqual(mockResult);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('search', () => {
    it('should search hotels with basic filters', async () => {
      const searchParams: SearchHotelsDto = {
        city: 'New York',
        checkIn: new Date('2024-03-01'),
        checkOut: new Date('2024-03-05'),
        guests: 2,
      };

      const mockResults = [
        {
          id: 1,
          name: 'Hotel A',
          city: 'New York',
          rating: 4,
        },
        {
          id: 2,
          name: 'Hotel B',
          city: 'New York',
          rating: 5,
        },
      ];

      mockHotelsService.search.mockResolvedValue(mockResults);

      const result = await controller.search(searchParams);

      expect(result).toEqual(mockResults);
      expect(service.search).toHaveBeenCalledWith(searchParams);
    });

    it('should search hotels with advanced filters', async () => {
      const searchParams: SearchHotelsDto = {
        city: 'Miami',
        checkIn: new Date('2024-03-01'),
        checkOut: new Date('2024-03-05'),
        guests: 2,
        minPrice: 100,
        maxPrice: 500,
        rating: 4,
      };

      const mockResults = [
        {
          id: 3,
          name: 'Hotel C',
          city: 'Miami',
          rating: 4,
          price: 300,
        },
      ];

      mockHotelsService.search.mockResolvedValue(mockResults);

      const result = await controller.search(searchParams);

      expect(result).toEqual(mockResults);
      expect(service.search).toHaveBeenCalledWith(searchParams);
    });

    it('should return empty array when no hotels match search criteria', async () => {
      const searchParams: SearchHotelsDto = {
        city: 'Unknown City',
        guests: 1,
      };

      mockHotelsService.search.mockResolvedValue([]);

      const result = await controller.search(searchParams);

      expect(result).toEqual([]);
      expect(service.search).toHaveBeenCalledWith(searchParams);
    });
  });
});
