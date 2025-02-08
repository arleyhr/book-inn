import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Hotel, hotel => hotel.amenities)
  hotels: Hotel[];
}
