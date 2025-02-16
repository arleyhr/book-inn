import { registerAs } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Hotel } from '../modules/hotels/entities/hotel.entity';
import { Room } from '../modules/hotels/entities/room.entity';
import { Review } from '../modules/hotels/entities/review.entity';
import { Reservation } from '../modules/reservations/entities/reservation.entity';

const databaseUrl = process.env.DATABASE_URL;

const ssl = {
  ssl: {
    rejectUnauthorized: false
  }
}
const databaseConfig = {
  host: process.env.DB_HOST || process.env.AZURE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.AZURE_MYSQL_PORT || '3306', 10),
  username: process.env.DB_USERNAME || process.env.AZURE_MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.AZURE_MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.AZURE_MYSQL_DATABASE || 'book_inn',
  ...(process.env.AZURE_MYSQL_SSL ? ssl : {})
}

const dabaseConfigUrl = {
  url: databaseUrl,
}

export default registerAs('database', () => ({
  type: 'mysql',
  ...(databaseUrl ? dabaseConfigUrl : databaseConfig),
  entities: [User, Hotel, Room, Review, Reservation],
  autoLoadEntities: true,
  // synchronize: process.env.NODE_ENV !== 'production',
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production',
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
}));
