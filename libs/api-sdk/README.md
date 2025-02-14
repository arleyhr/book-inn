# Book Inn API SDK

A framework-agnostic TypeScript SDK for interacting with the Book Inn API. This SDK provides a clean and type-safe way to interact with the API from both React and Angular applications.

## Features

- Framework agnostic - works with both React and Angular
- Built-in token refresh handling with automatic retry
- Concurrent request handling during token refresh
- Type-safe API calls with full TypeScript support
- Modular architecture with separate domain modules
- Comprehensive error handling with specific error types
- Automatic request retry on authentication errors

## Configuration

The SDK can be configured with the following options:

```typescript
interface ApiSdkConfig {
  baseURL: string;                // API base URL
  accessToken?: string;           // Initial access token
  refreshToken?: string;          // Initial refresh token
  onTokensChange?: (             // Callback for token changes
    accessToken: string | undefined, 
    refreshToken: string | undefined
  ) => void;
}
```

## Usage

### With React

```typescript
import { ApiSdk } from '@book-inn/api-sdk';

const sdk = new ApiSdk({
  baseURL: 'http://api.example.com',
  accessToken: 'optional-token',
  refreshToken: 'optional-refresh-token',
  onTokensChange: (accessToken, refreshToken) => {
    // Handle token changes (e.g., save to localStorage)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
});
```

### With Angular

```typescript
import { HttpClient } from '@angular/common/http';
import { ApiSdk, AngularHttpClient } from '@book-inn/api-sdk';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private sdk: ApiSdk;

  constructor(private http: HttpClient) {
    const config = {
      baseURL: 'http://api.example.com',
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      onTokensChange: (accessToken, refreshToken) => {
        if (accessToken && refreshToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };

    const angularHttpClient = new AngularHttpClient(http, config);
    this.sdk = new ApiSdk(config, angularHttpClient);
  }

  getSdk() {
    return this.sdk;
  }
}
```

## Available Modules

### Auth Module

Authentication and user management.

```typescript
interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto extends LoginDto {
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Login
const response = await sdk.auth.login({
  email: 'user@example.com',
  password: 'password'
});
// Returns: AuthResponse

// Register
const response = await sdk.auth.register({
  email: 'user@example.com',
  password: 'password',
  firstName: 'John',
  lastName: 'Doe'
});
// Returns: AuthResponse

// Get current user
const user = await sdk.auth.me();
// Returns: User

// Refresh token
const tokens = await sdk.auth.refreshToken('refresh-token');
// Returns: { access_token: string, refresh_token: string }

// Logout
await sdk.auth.logout();
```

### Hotels Module

Hotel, room, and review management.

```typescript
interface SearchHotelsParams {
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  name?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  amenities?: string;
}

interface CreateHotelDto {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  images: string[];
}

interface CreateRoomDto {
  name: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
}

interface CreateReviewDto {
  rating: number;
  comment: string;
}

// Search hotels
const hotels = await sdk.hotels.search({
  city: 'New York',
  checkIn: '2024-03-01',
  checkOut: '2024-03-05',
  minPrice: '100',
  maxPrice: '500',
  rating: '4'
});

// Get all hotels
const hotels = await sdk.hotels.getHotels();

// Get specific hotel
const hotel = await sdk.hotels.getHotel('hotel-id');

// Get featured hotels
const featuredHotels = await sdk.hotels.getFeatured(4);

// Create hotel
const newHotel = await sdk.hotels.createHotel({
  name: 'Hotel Name',
  description: 'Hotel Description',
  address: 'Hotel Address',
  city: 'City',
  country: 'Country',
  images: ['image-url']
});

// Update hotel
const updatedHotel = await sdk.hotels.updateHotel('hotel-id', {
  name: 'Updated Name',
  description: 'Updated Description'
});

// Delete hotel
await sdk.hotels.deleteHotel('hotel-id');

// Create room
const newRoom = await sdk.hotels.createRoom('hotel-id', {
  name: 'Room Name',
  description: 'Room Description',
  price: 100,
  capacity: 2,
  images: ['image-url']
});

// Update room
const updatedRoom = await sdk.hotels.updateRoom('hotel-id', 'room-id', {
  price: 150
});

// Delete room
await sdk.hotels.deleteRoom('hotel-id', 'room-id');

// Create review
const newReview = await sdk.hotels.createReview('hotel-id', {
  rating: 5,
  comment: 'Great hotel!'
});

// Delete review
await sdk.hotels.deleteReview('hotel-id', 'review-id');

// Toggle room availability
const hotel = await sdk.hotels.toggleRoomAvailability('hotel-id', 'room-id');
```

### Reservations Module

Reservation and messaging management.

```typescript
interface CreateReservationDto {
  checkIn: string;
  checkOut: string;
  guests: number;
  hotelId: string;
  roomId: string;
}

interface CreateMessageDto {
  content: string;
}

interface ReservationStatistics {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

// Get all reservations
const reservations = await sdk.reservations.getReservations();

// Get specific reservation
const reservation = await sdk.reservations.getReservation('reservation-id');

// Create reservation
const newReservation = await sdk.reservations.createReservation({
  checkIn: '2024-03-01',
  checkOut: '2024-03-05',
  guests: 2,
  hotelId: 'hotel-id',
  roomId: 'room-id'
});

// Update reservation status
const updatedReservation = await sdk.reservations.updateReservationStatus(
  'reservation-id',
  'confirmed'
);

// Cancel reservation
const cancelledReservation = await sdk.reservations.cancelReservation('reservation-id');

// Get reservation messages
const messages = await sdk.reservations.getMessages('reservation-id');

// Send message
const newMessage = await sdk.reservations.createMessage(
  'reservation-id',
  { content: 'Hello!' }
);

// Get statistics
const stats = await sdk.reservations.getStatistics();

// Get occupancy stats
const occupancyStats = await sdk.reservations.getOccupancyStats(
  'hotel-id',
  new Date('2024-03-01'),
  new Date('2024-03-31')
);

// Get revenue stats
const revenueStats = await sdk.reservations.getRevenueStats(
  'hotel-id',
  new Date('2024-03-01'),
  new Date('2024-03-31')
);
```

### Users Module

User profile management.

```typescript
interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Get all users
const users = await sdk.users.getUsers();

// Get specific user
const user = await sdk.users.getUser('user-id');

// Update user
const updatedUser = await sdk.users.updateUser('user-id', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'new@example.com'
});

// Update password
await sdk.users.updatePassword({
  currentPassword: 'old-password',
  newPassword: 'new-password'
});

// Delete user
await sdk.users.deleteUser('user-id');
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
class ApiError extends Error {
  status: number;
  details?: Record<string, any>;
}

class NetworkError extends Error {
  cause?: Error;
}

class ValidationError extends Error {
  fieldErrors: Record<string, string[]>;
}
```

The SDK automatically handles common error scenarios:

1. **Authentication Errors (401)**:
   - Automatically attempts to refresh the token
   - Queues concurrent requests during refresh
   - Retries failed requests with new token
   - Clears tokens if refresh fails

2. **Network Errors**:
   - Throws NetworkError with detailed information
   - Includes original error as cause
   - Provides connection status information

3. **API Errors**:
   - Throws ApiError with server message
   - Includes HTTP status code
   - Contains detailed error information

4. **Validation Errors**:
   - Throws ValidationError with field-specific messages
   - Groups errors by field name
   - Provides formatted error messages

Example error handling:

```typescript
try {
  const hotels = await sdk.hotels.getHotels();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.details);
  } else if (error instanceof NetworkError) {
    console.error('Network Error:', error.message);
    console.error('Cause:', error.cause);
  } else if (error instanceof ValidationError) {
    console.error('Validation Error:', error.message);
    console.error('Field Errors:', error.fieldErrors);
  } else {
    console.error('Unexpected Error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides:

- Full type definitions for all methods and responses
- Type-safe request and response handling
- Autocomplete support in modern IDEs
- Type inference for nested objects
- Strict null checks
- Generic type parameters where applicable

