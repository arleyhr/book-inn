import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomsService } from '../rooms.service';
import { Room } from '../../entities/room.entity';

describe('RoomsService', () => {
  let service: RoomsService;
  let roomRepository: Repository<Room>;

  const mockRoom = {
    id: 1,
    type: 'Suite',
    basePrice: 100,
    taxes: 16,
    location: 'Floor 1',
    isAvailable: true,
    hotelId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRoomRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const createRoomDto = {
        type: 'Suite',
        basePrice: 100,
        taxes: 16,
        location: 'Floor 1',
        hotelId: 1,
      };

      mockRoomRepository.create.mockReturnValue(mockRoom);
      mockRoomRepository.save.mockResolvedValue(mockRoom);

      const result = await service.create(createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(roomRepository.create).toHaveBeenCalledWith(createRoomDto);
      expect(roomRepository.save).toHaveBeenCalledWith(mockRoom);
    });

    it('should set default values for optional fields', async () => {
      const createRoomDto = {
        type: 'Suite',
        basePrice: 100,
        hotelId: 1,
        taxes: undefined,
        location: undefined,
      };

      const expectedRoom = {
        ...mockRoom,
        taxes: 0,
        location: null,
        isAvailable: true,
      };

      mockRoomRepository.create.mockReturnValue(expectedRoom);
      mockRoomRepository.save.mockResolvedValue(expectedRoom);

      const result = await service.create(createRoomDto);

      expect(result).toEqual(expectedRoom);
      expect(roomRepository.create).toHaveBeenCalledWith(createRoomDto);
      expect(roomRepository.save).toHaveBeenCalledWith(expectedRoom);
    });

    it('should validate required fields', async () => {
      const invalidRoomDto = {
        taxes: 16,
        location: 'Floor 1',
      };

      mockRoomRepository.create.mockImplementation(() => {
        throw new Error('Required fields missing');
      });

      await expect(service.create(invalidRoomDto as any)).rejects.toThrow('Required fields missing');
    });
  });
});
