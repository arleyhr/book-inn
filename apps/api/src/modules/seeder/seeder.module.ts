import { Module } from '@nestjs/common';
import { SeederController } from './controllers/seeder.controller';
import { SeederService } from './services/seeder.service';
import { HotelsModule } from '../hotels/hotels.module';
import { UsersModule } from '../users/users.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    HotelsModule,
    UsersModule,
    ReservationsModule,
  ],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
