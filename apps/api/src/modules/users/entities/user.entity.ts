import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { Review } from '../../hotels/entities/review.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { ReservationMessage } from '../../reservations/entities/message.entity';
import { Exclude } from 'class-transformer';
export enum UserRole {
  AGENT = 'agent',
  TRAVELER = 'traveler',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TRAVELER
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, select: false })
  @Exclude()
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Hotel, (hotel) => hotel.agent)
  managedHotels: Hotel[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany(() => Reservation, (reservation) => reservation.cancelledByUser)
  cancelledReservations: Reservation[];

  @OneToMany(() => Reservation, (reservation) => reservation.confirmedByUser)
  confirmedReservations: Reservation[];

  @OneToMany(() => ReservationMessage, (message) => message.sender)
  sentMessages: ReservationMessage[];

  comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}
