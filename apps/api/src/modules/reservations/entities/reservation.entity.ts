import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../hotels/entities/room.entity';
import { ReservationMessage } from './message.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  checkInDate: Date;

  @Column()
  checkOutDate: Date;

  @Column()
  guestName: string;

  @Column()
  guestEmail: string;

  @Column()
  guestPhone: string;

  @Column()
  emergencyContactName: string;

  @Column()
  emergencyContactPhone: string;

  @Column()
  userId: number;

  @Column()
  roomId: number;

  @Column({ default: 1 })
  guestCount: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING
  })
  status: ReservationStatus;

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelledBy?: number;

  @Column({ nullable: true })
  confirmedAt?: Date;

  @Column({ nullable: true })
  confirmedBy?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, (user) => user.cancelledReservations)
  @JoinColumn({ name: 'cancelledBy' })
  cancelledByUser: User;

  @ManyToOne(() => User, (user) => user.confirmedReservations)
  @JoinColumn({ name: 'confirmedBy' })
  confirmedByUser: User;

  @ManyToOne(() => Room, (room) => room.reservations)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @OneToMany(() => ReservationMessage, (message) => message.reservation)
  messages: ReservationMessage[];
}
