import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsController } from './controllers/hotels.controller';
import { HotelsService } from './services/hotels.service';
import { Hotel } from './entities/hotel.entity';
import { Room } from './entities/room.entity';
import { Review } from './entities/review.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Room, Review]),
    UsersModule
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
