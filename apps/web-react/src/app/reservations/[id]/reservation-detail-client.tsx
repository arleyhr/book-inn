'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuthStore } from '../../../store/auth';
import { getApi } from '../../../lib/api-config';
import { useToast } from '../../../components/common/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/common/card';
import { Button } from '../../../components/common/button';
import { PageHeader } from '../../../components/common/page-header';
import { ReservationStatus } from '../../../components/messages/reservation-status';
import { CancelReservationModal } from '../../../components/reservations/cancel-reservation-modal';
import { MapLocationPicker } from '../../../components/common/map-location-picker';
import { Textarea } from '../../../components/common/textarea';
import {
  StarIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getHotelImageUrl } from '../../../lib/images';
import type { Reservation } from '../../../lib/api';

interface ReservationDetailClientProps {
  reservationId: string;
}

export function ReservationDetailClient({
  reservationId,
}: ReservationDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  const loadReservation = async () => {
    try {
      const data = await getApi().reservations.getReservation(+reservationId);
      setReservation(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reservation details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: Reservation['status']) => {
    if (!reservation) return;

    try {
      setIsConfirming(true);
      await getApi().reservations.updateReservationStatus(
        reservation.id,
        status,
      );
      toast({
        title: 'Success',
        description: 'Reservation status updated successfully.',
      });
      loadReservation();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reservation status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!reservation) return;

    try {
      setIsCancelling(true);
      await getApi().reservations.cancelReservation({
        reservationId: reservation.id,
        reason,
      });
      toast({
        title: 'Success',
        description: 'Reservation cancelled successfully.',
      });
      loadReservation();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messages/${reservationId}`);
  };

  const handleSubmitReview = async () => {
    if (!reservation || !review.trim()) return;

    try {
      setIsSubmittingReview(true);
      await getApi().hotels.createReview(String(reservation.room.hotel.id), {
        rating,
        comment: review,
      });
      toast({
        title: 'Success',
        description: 'Review submitted successfully.',
      });
      loadReservation();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const hasReview = reservation?.room?.hotel?.reviews?.find(
    (r: { userId: number }) => Number(r.userId) === Number(user?.id),
  );
  const canReview =
    reservation?.status === 'completed' && !hasReview;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Reservation not found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The reservation you are looking for does not exist or you do not
            have permission to view it.
          </p>
          <Button
            onClick={() => router.push('/manage-reservations')}
            className="mt-4"
          >
            Go to My Reservations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title={`Reservation #${reservation.id}`}
            description="View and manage your reservation details"
            className="mb-6"
          />

          <div className="space-y-6">
            {user?.role === 'agent' && reservation.status === 'pending' && (
              <Card className="border-2 border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                        Pending Confirmation
                      </h3>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        This reservation requires your confirmation to proceed
                      </p>
                    </div>
                    <Button
                      onClick={() => handleStatusChange('confirmed')}
                      disabled={isConfirming}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      {isConfirming ? 'Confirming...' : 'Confirm Reservation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hotel Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden mb-6">
                      {reservation.room?.hotel?.images?.[0] && (
                        <img
                          src={getHotelImageUrl(
                            reservation.room?.hotel?.placeId,
                            reservation.room?.hotel?.images[0]
                          )}
                          alt={`${reservation.room?.hotel?.name}`}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {reservation.room?.hotel?.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {reservation.room?.hotel?.address}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {reservation.room?.hotel?.city},{' '}
                          {reservation.room?.hotel?.country}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Room Details
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Room #{reservation.room?.location}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {reservation.room?.type}
                        </p>
                      </div>
                    </div>

                    {reservation.room?.hotel?.latitude &&
                      reservation.room?.hotel?.longitude && (
                        <div className="mt-6 aspect-video rounded-lg overflow-hidden">
                          <MapLocationPicker
                            initialLocation={{
                              lat: Number(reservation.room.hotel.latitude),
                              lng: Number(reservation.room.hotel.longitude),
                            }}
                            readonly
                          />
                        </div>
                      )}
                  </CardContent>
                </Card>

                {(canReview || hasReview) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hotel Review</CardTitle>
                      {canReview && (
                        <CardDescription>
                          Share your experience at this hotel
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {canReview ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                  star <= rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              >
                                <StarIcon className="h-6 w-6 fill-current" />
                              </button>
                            ))}
                          </div>
                          <Textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Write your review here..."
                            className="min-h-[100px]"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={handleSubmitReview}
                              disabled={isSubmittingReview || !review.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isSubmittingReview
                                ? 'Submitting...'
                                : 'Submit Review'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        hasReview && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {[...Array(hasReview.rating)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className="h-5 w-5 text-yellow-400 fill-current"
                                />
                              ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {hasReview.comment}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Posted on{' '}
                              {format(new Date(hasReview.createdAt), 'PPP')}
                            </p>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reservation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </h4>
                      <ReservationStatus status={reservation.status} />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Created on{' '}
                        {format(new Date(reservation.createdAt), 'PPP')}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stay Dates
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Check-in:{' '}
                        {format(new Date(reservation.checkInDate), 'PPP')}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Check-out:{' '}
                        {format(new Date(reservation.checkOutDate), 'PPP')}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Guests
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {reservation.guestCount || 1} {(reservation.guestCount || 1) === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Guest Information
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Name: {reservation.guestName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Phone: {reservation.guestPhone}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Email: {reservation.guestEmail}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Emergency contact: {reservation.emergencyContactName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Emergency contact phone: {reservation.emergencyContactPhone}
                      </p>
                    </div>

                    {reservation.cancellationReason && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <span className="font-medium">
                            Cancellation Reason:
                          </span>{' '}
                          {reservation.cancellationReason}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 space-y-3">
                      <Button
                        onClick={handleMessage}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        Message Hotel
                      </Button>

                      {reservation.status === 'pending' && (
                        <Button
                          onClick={() => setShowCancelModal(true)}
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-2"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Cancel Reservation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CancelReservationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
      />
    </main>
  );
}
