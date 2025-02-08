import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationMessage } from '../entities/message.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(ReservationMessage)
    private readonly messageRepository: Repository<ReservationMessage>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto, userId: number): Promise<ReservationMessage> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: sendMessageDto.reservationId },
      relations: ['user', 'room', 'room.hotel'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELLED || reservation.status === ReservationStatus.COMPLETED) {
      throw new ForbiddenException('Cannot send messages for cancelled or completed reservations');
    }

    if (userId !== reservation.userId && userId !== reservation.room.hotel.agentId) {
      throw new ForbiddenException('You can only send messages for your own reservations');
    }

    const message = this.messageRepository.create({
      ...sendMessageDto,
      senderId: userId,
    });

    return this.messageRepository.save(message);
  }

  async getMessages(reservationId: number, userId: number): Promise<ReservationMessage[]> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['user', 'room', 'room.hotel'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (userId !== reservation.userId && userId !== reservation.room.hotel.agentId) {
      throw new ForbiddenException('You can only view messages for your own reservations');
    }

    return this.messageRepository.find({
      where: { reservationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }
}

