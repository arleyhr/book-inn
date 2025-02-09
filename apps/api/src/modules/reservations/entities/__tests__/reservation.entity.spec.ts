import { Reservation, ReservationStatus } from '../reservation.entity';
import { User } from '../../../users/entities/user.entity';
import { Room } from '../../../hotels/entities/room.entity';
import { ReservationMessage } from '../message.entity';

describe('Reservation Entity', () => {
  let reservation: Reservation;

  beforeEach(() => {
    reservation = new Reservation();
  });

  describe('Relations', () => {
    it('should have a ManyToOne relation with User through userId', () => {
      const user = new User();
      user.id = 1;

      reservation.userId = user.id;
      reservation.user = user;

      expect(reservation.userId).toBe(1);
      expect(reservation.user).toBeDefined();
      expect(reservation.user instanceof User).toBeTruthy();
    });

    it('should have a ManyToOne relation with User through cancelledBy', () => {
      const cancelUser = new User();
      cancelUser.id = 2;

      reservation.cancelledBy = cancelUser.id;
      reservation.cancelledByUser = cancelUser;

      expect(reservation.cancelledBy).toBe(2);
      expect(reservation.cancelledByUser).toBeDefined();
      expect(reservation.cancelledByUser instanceof User).toBeTruthy();
    });

    it('should have a ManyToOne relation with User through confirmedBy', () => {
      const confirmUser = new User();
      confirmUser.id = 3;

      reservation.confirmedBy = confirmUser.id;
      reservation.confirmedByUser = confirmUser;

      expect(reservation.confirmedBy).toBe(3);
      expect(reservation.confirmedByUser).toBeDefined();
      expect(reservation.confirmedByUser instanceof User).toBeTruthy();
    });

    it('should have a ManyToOne relation with Room', () => {
      const room = new Room();
      room.id = 1;

      reservation.roomId = room.id;
      reservation.room = room;

      expect(reservation.roomId).toBe(1);
      expect(reservation.room).toBeDefined();
      expect(reservation.room instanceof Room).toBeTruthy();
    });

    it('should have a OneToMany relation with ReservationMessage', () => {
      const message1 = new ReservationMessage();
      const message2 = new ReservationMessage();

      message1.id = 1;
      message2.id = 2;

      reservation.messages = [message1, message2];

      expect(reservation.messages).toHaveLength(2);
      expect(reservation.messages[0] instanceof ReservationMessage).toBeTruthy();
      expect(reservation.messages[1] instanceof ReservationMessage).toBeTruthy();
    });
  });
});
