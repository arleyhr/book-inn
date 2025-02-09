import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SeederService } from '../seeder.service';
import { HotelsService } from '../../../hotels/services/hotels.service';
import { RoomsService } from '../../../hotels/services/rooms.service';
import { ReviewsService } from '../../../hotels/services/reviews.service';
import { GooglePlacesService } from '../../../hotels/services/google-places.service';
import { UsersService } from '../../../users/services/users.service';
import { ReservationsService } from '../../../reservations/services/reservations.service';
import { MessagesService } from '../../../reservations/services/messages.service';
import { UserRole } from '../../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

jest.mock('bcrypt');
jest.mock('../../../hotels/services/google-places.service');

describe('SeederService', () => {
  let service: SeederService;
  let usersService: UsersService;
  let hotelsService: HotelsService;
  let roomsService: RoomsService;
  let googlePlacesService: GooglePlacesService;
  let reservationsService: ReservationsService;
  let messagesService: MessagesService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHotelsService = {
    create: jest.fn(),
  };

  const mockRoomsService = {
    create: jest.fn(),
  };

  const mockReviewsService = {
    create: jest.fn(),
  };

  const mockGooglePlacesService = {
    searchHotels: jest.fn(),
    getPlaceDetails: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockReservationsService = {
    create: jest.fn(),
    confirm: jest.fn(),
    cancel: jest.fn(),
  };

  const mockMessagesService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HotelsService,
          useValue: mockHotelsService,
        },
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
        {
          provide: GooglePlacesService,
          useValue: mockGooglePlacesService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
    usersService = module.get<UsersService>(UsersService);
    hotelsService = module.get<HotelsService>(HotelsService);
    roomsService = module.get<RoomsService>(RoomsService);
    googlePlacesService = module.get<GooglePlacesService>(GooglePlacesService);
    reservationsService = module.get<ReservationsService>(ReservationsService);
    messagesService = module.get<MessagesService>(MessagesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSeedData', () => {
    const mockAgent = {
      id: 1,
      email: 'agent@bookinn.com',
      firstName: 'Test',
      lastName: 'Agent',
      role: UserRole.AGENT,
    };

    const mockTraveler = {
      id: 2,
      email: 'juan.perez@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.TRAVELER,
    };

    const mockHotel = {
      place_id: 'test_place_id',
      name: 'Test Hotel',
      rating: 4.5,
      photos: [{ photo_reference: 'test_photo' }],
    };

    const mockHotelDetails = {
      name: 'Test Hotel',
      formatted_address: 'Test Address',
      rating: 4.5,
      price_level: 3,
      photos: [{ photo_reference: 'test_photo' }],
      types: ['lodging'],
      website: 'https://testhotel.com',
      formatted_phone_number: '+57 1234567',
      geometry: {
        location: {
          lat: 4.710989,
          lng: -74.072092,
        },
      },
    };

    const mockRoom = {
      id: 1,
      type: 'Habitación Individual',
      basePrice: 200,
      taxes: 32,
      location: 'Piso bajo con vista al jardín',
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      mockUsersService.findByEmail
        .mockResolvedValueOnce(null) // Agent not found first time
        .mockResolvedValue(mockTraveler); // Traveler found

      mockUsersService.create
        .mockResolvedValueOnce(mockAgent)
        .mockResolvedValue(mockTraveler);

      mockGooglePlacesService.searchHotels.mockResolvedValue([mockHotel]);
      mockGooglePlacesService.getPlaceDetails.mockResolvedValue(mockHotelDetails);

      mockHotelsService.create.mockImplementation((data) => Promise.resolve({
        id: 1,
        ...data,
      }));

      mockRoomsService.create.mockResolvedValue(mockRoom);

      mockReservationsService.create.mockResolvedValue({
        id: 1,
        checkInDate: '2024-02-15',
        checkOutDate: '2024-02-20',
      });
    });

    it('should generate seed data with default count', async () => {
      await service.generateSeedData(1);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('agent@bookinn.com');
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: 'agent@bookinn.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'Agent',
        role: UserRole.AGENT,
      });

      expect(mockGooglePlacesService.searchHotels).toHaveBeenCalledWith('Bogotá');
      expect(mockGooglePlacesService.getPlaceDetails).toHaveBeenCalledWith(mockHotel.place_id);

      expect(mockHotelsService.create).toHaveBeenCalledWith(expect.objectContaining({
        name: mockHotelDetails.name,
        address: mockHotelDetails.formatted_address,
        placeId: mockHotel.place_id,
        city: 'Bogotá',
        country: 'Colombia',
        latitude: mockHotelDetails.geometry.location.lat,
        longitude: mockHotelDetails.geometry.location.lng,
      }));
    });

    it('should use existing agent if found', async () => {
      mockUsersService.findByEmail
        .mockReset()
        .mockResolvedValue(mockAgent);

      await service.generateSeedData(1);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('agent@bookinn.com');
      expect(mockUsersService.create).not.toHaveBeenCalledWith({
        email: 'agent@bookinn.com',
        password: expect.any(String),
        firstName: 'Test',
        lastName: 'Agent',
        role: UserRole.AGENT,
      });
    });

    it('should respect the count parameter', async () => {
      const count = 5;
      const hotels = Array(count).fill(mockHotel);
      mockGooglePlacesService.searchHotels.mockResolvedValue(hotels);

      await service.generateSeedData(count);

      expect(mockHotelsService.create).toHaveBeenCalledTimes(count);
    });

    it('should handle errors gracefully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

      mockGooglePlacesService.searchHotels.mockRejectedValue(new Error('API Error'));

      try {
        await service.generateSeedData(1);
      } catch (error) {
        console.log(error);
      }

      expect(mockGooglePlacesService.searchHotels).toHaveBeenCalled();
      expect(mockHotelsService.create).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalled();

      loggerSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });
  });
});
