import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Room } from './room.entity';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';
import { Amenity } from './amenity.entity';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column()
  agentId: number;

  @Column({ nullable: true })
  placeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.managedHotels)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @OneToMany(() => Review, (review) => review.hotel)
  reviews: Review[];

  @ManyToMany(() => Amenity, amenity => amenity.hotels)
  @JoinTable({
    name: 'hotel_amenities',
    joinColumn: { name: 'hotelId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'amenityId', referencedColumnName: 'id' }
  })
  amenities: Amenity[];
}
