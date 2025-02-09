# Book Inn API SDK

A framework-agnostic TypeScript SDK for interacting with the Book Inn API. This SDK provides a clean and type-safe way to interact with the API from both React and Angular applications.

## Features

- Framework agnostic - works with both React and Angular
- Built-in token refresh handling
- Type-safe API calls
- Modular architecture
- Automatic error handling
- TypeScript support
## Usage

### With React (using Axios)

```typescript
import { ApiSdk } from '@book-inn/api-sdk';

const sdk = new ApiSdk({
  baseURL: 'http://api.example.com',
  accessToken: 'optional-token',
  refreshToken: 'optional-refresh-token',
  onTokensChange: (accessToken, refreshToken) => {
    // Handle token changes (e.g., save to localStorage)
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
      accessToken: 'optional-token',
      refreshToken: 'optional-refresh-token',
      onTokensChange: (accessToken, refreshToken) => {
        // Handle token changes
      }
    };

    const angularHttpClient = new AngularHttpClient(http, config);
    this.sdk = new ApiSdk(config, angularHttpClient);
  }
}
```

## Available Modules

### Auth Module

Authentication and user management.

```typescript
// Login
const response = await sdk.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Register
const response = await sdk.auth.register({
  email: 'user@example.com',
  password: 'password',
  firstName: 'John',
  lastName: 'Doe'
});

// Get current user
const user = await sdk.auth.me();

// Logout
await sdk.auth.logout();
```

### Hotels Module

Hotel, room, and review management.

```typescript
// Get all hotels
const hotels = await sdk.hotels.getHotels();

// Get specific hotel
const hotel = await sdk.hotels.getHotel('hotel-id');

// Create hotel
const newHotel = await sdk.hotels.createHotel({
  name: 'Hotel Name',
  description: 'Hotel Description',
  address: 'Hotel Address',
  city: 'City',
  country: 'Country',
  images: ['image-url']
});

// Create room
const newRoom = await sdk.hotels.createRoom('hotel-id', {
  name: 'Room Name',
  description: 'Room Description',
  price: 100,
  capacity: 2,
  images: ['image-url']
});

// Create review
const newReview = await sdk.hotels.createReview('hotel-id', {
  rating: 5,
  comment: 'Great hotel!'
});
```

### Reservations Module

Reservation and messaging management.

```typescript
// Get all reservations
const reservations = await sdk.reservations.getReservations();

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

// Get reservation messages
const messages = await sdk.reservations.getMessages('reservation-id');

// Send message
const newMessage = await sdk.reservations.createMessage(
  'reservation-id',
  { content: 'Hello!' }
);

// Get statistics
const stats = await sdk.reservations.getStatistics();
```

### Users Module

User profile management.

```typescript
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
```

## Error Handling

The SDK automatically handles 401 errors and token refresh. For other errors, you should implement try-catch blocks:

```typescript
try {
  const hotels = await sdk.hotels.getHotels();
} catch (error) {
  // Handle error
  console.error('Failed to fetch hotels:', error);
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions for all methods and responses. You'll get autocomplete and type checking out of the box when using TypeScript.
