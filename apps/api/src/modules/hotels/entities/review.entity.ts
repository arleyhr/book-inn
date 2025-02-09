import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Hotel } from './hotel.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column({ type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  comment: string;

  @Column()
  userId: number;

  @Column()
  hotelId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Hotel, (hotel) => hotel.reviews)
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
