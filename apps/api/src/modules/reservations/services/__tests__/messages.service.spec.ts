import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagesService } from '../messages.service';
import { ReservationMessage } from '../../entities/message.entity';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepository: Repository<ReservationMessage>;
  let reservationRepository: Repository<Reservation>;

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn()
  };

  const mockReservationRepository = {
    findOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(ReservationMessage),
          useValue: mockMessageRepository
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository
        }
      ]
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get<Repository<ReservationMessage>>(getRepositoryToken(ReservationMessage));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    const mockSendMessageDto = {
      reservationId: 1,
      message: 'Test message'
    };

    const mockReservation = {
      id: 1,
      userId: 1,
      status: ReservationStatus.CONFIRMED,
      room: {
        hotel: {
          agentId: 2
        }
      }
    };

    it('should successfully send a message for a traveler', async () => {
      const userId = 1;
      const expectedMessage = { ...mockSendMessageDto, senderId: userId };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMessageRepository.create.mockReturnValue(expectedMessage);
      mockMessageRepository.save.mockResolvedValue(expectedMessage);

      const result = await service.sendMessage(mockSendMessageDto, userId);

      expect(result).toEqual(expectedMessage);
      expect(mockMessageRepository.create).toHaveBeenCalledWith(expectedMessage);
      expect(mockMessageRepository.save).toHaveBeenCalledWith(expectedMessage);
    });

    it('should successfully send a message for an agent', async () => {
      const agentId = 2;
      const expectedMessage = { ...mockSendMessageDto, senderId: agentId };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMessageRepository.create.mockReturnValue(expectedMessage);
      mockMessageRepository.save.mockResolvedValue(expectedMessage);

      const result = await service.sendMessage(mockSendMessageDto, agentId);

      expect(result).toEqual(expectedMessage);
      expect(mockMessageRepository.create).toHaveBeenCalledWith(expectedMessage);
      expect(mockMessageRepository.save).toHaveBeenCalledWith(expectedMessage);
    });

    it('should throw NotFoundException when reservation is not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.sendMessage(mockSendMessageDto, 1)).rejects.toThrow(NotFoundException);
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
      expect(mockMessageRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for cancelled reservations', async () => {
      const cancelledReservation = {
        ...mockReservation,
        status: ReservationStatus.CANCELLED
      };
      mockReservationRepository.findOne.mockResolvedValue(cancelledReservation);

      await expect(service.sendMessage(mockSendMessageDto, 1)).rejects.toThrow(ForbiddenException);
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
      expect(mockMessageRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for completed reservations', async () => {
      const completedReservation = {
        ...mockReservation,
        status: ReservationStatus.COMPLETED
      };
      mockReservationRepository.findOne.mockResolvedValue(completedReservation);

      await expect(service.sendMessage(mockSendMessageDto, 1)).rejects.toThrow(ForbiddenException);
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
      expect(mockMessageRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const unauthorizedUserId = 3;
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      await expect(service.sendMessage(mockSendMessageDto, unauthorizedUserId)).rejects.toThrow(ForbiddenException);
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
      expect(mockMessageRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    const reservationId = 1;
    const mockReservation = {
      id: 1,
      userId: 1,
      room: {
        hotel: {
          agentId: 2
        }
      }
    };

    const mockMessages = [
      {
        id: 1,
        message: 'Message 1',
        senderId: 1,
        createdAt: new Date(),
        sender: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'traveler'
        }
      },
      {
        id: 2,
        message: 'Message 2',
        senderId: 2,
        createdAt: new Date(),
        sender: {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'agent'
        }
      }
    ];

    it('should return messages for authorized traveler', async () => {
      const userId = 1;
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMessageRepository.find.mockResolvedValue(mockMessages);

      const result = await service.getMessages(reservationId, userId);

      expect(result).toEqual(mockMessages);
      expect(mockMessageRepository.find).toHaveBeenCalledWith({
        where: { reservationId },
        relations: {
          sender: true
        },
        select: {
          id: true,
          message: true,
          senderId: true,
          reservationId: true,
          createdAt: true,
          sender: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        order: { createdAt: 'ASC' }
      });
    });

    it('should return messages for hotel agent', async () => {
      const agentId = 2;
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMessageRepository.find.mockResolvedValue(mockMessages);

      const result = await service.getMessages(reservationId, agentId);

      expect(result).toEqual(mockMessages);
      expect(mockMessageRepository.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException when reservation is not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.getMessages(reservationId, 1)).rejects.toThrow(NotFoundException);
      expect(mockMessageRepository.find).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const unauthorizedUserId = 3;
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      await expect(service.getMessages(reservationId, unauthorizedUserId)).rejects.toThrow(ForbiddenException);
      expect(mockMessageRepository.find).not.toHaveBeenCalled();
    });

    it('should return empty array when no messages exist', async () => {
      const userId = 1;
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockMessageRepository.find.mockResolvedValue([]);

      const result = await service.getMessages(reservationId, userId);

      expect(result).toEqual([]);
      expect(mockMessageRepository.find).toHaveBeenCalled();
    });
  });
});
