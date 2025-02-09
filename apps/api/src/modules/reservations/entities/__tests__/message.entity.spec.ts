import { ReservationMessage } from '../message.entity';
import { User } from '../../../users/entities/user.entity';
import { Reservation } from '../reservation.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('ReservationMessage Entity', () => {
  let message: ReservationMessage;

  beforeEach(() => {
    message = new ReservationMessage();
  });

  describe('Relations', () => {
    it('should have a ManyToOne relation with User through senderId', () => {
      const user = new User();
      user.id = 1;

      message.senderId = user.id;
      message.sender = user;

      expect(message.senderId).toBe(1);
      expect(message.sender).toBeDefined();
      expect(message.sender instanceof User).toBeTruthy();

      const metadata = getMetadataArgsStorage();
      const relationMetadata = metadata.relations.find(
        relation =>
          relation.target === ReservationMessage &&
          relation.propertyName === 'sender'
      );

      expect(relationMetadata).toBeDefined();
      expect(typeof relationMetadata.type).toBe('function');
      expect(relationMetadata.relationType).toBe('many-to-one');

      const joinColumnMetadata = metadata.joinColumns.find(
        joinColumn =>
          joinColumn.target === ReservationMessage &&
          joinColumn.propertyName === 'sender'
      );

      expect(joinColumnMetadata).toBeDefined();
      expect(joinColumnMetadata.name).toBe('senderId');
    });

    it('should have a ManyToOne relation with Reservation', () => {
      const reservation = new Reservation();
      reservation.id = 1;

      message.reservationId = reservation.id;
      message.reservation = reservation;

      expect(message.reservationId).toBe(1);
      expect(message.reservation).toBeDefined();
      expect(message.reservation instanceof Reservation).toBeTruthy();

      // Test relation decorators
      const metadata = getMetadataArgsStorage();
      const relationMetadata = metadata.relations.find(
        relation =>
          relation.target === ReservationMessage &&
          relation.propertyName === 'reservation'
      );

      expect(relationMetadata).toBeDefined();
      expect(typeof relationMetadata.type).toBe('function');
      expect(relationMetadata.relationType).toBe('many-to-one');

      // Test JoinColumn decorator
      const joinColumnMetadata = metadata.joinColumns.find(
        joinColumn =>
          joinColumn.target === ReservationMessage &&
          joinColumn.propertyName === 'reservation'
      );

      expect(joinColumnMetadata).toBeDefined();
      expect(joinColumnMetadata.name).toBe('reservationId');
    });
  });
});
