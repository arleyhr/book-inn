import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './reservation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reservation_messages')
export class ReservationMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  senderId: number;

  @Column()
  reservationId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => Reservation, (reservation) => reservation.messages)
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;
}
