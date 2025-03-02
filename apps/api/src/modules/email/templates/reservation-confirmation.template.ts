export interface ReservationConfirmationTemplateData {
  reservationId: number;
  guestName: string;
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  hotelCountry: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
  basePrice: number;
  taxes: number;
  totalPrice: number;
  guestCount: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  cancellationPolicy?: string;
}

export const generateReservationConfirmationTemplate = (
  data: ReservationConfirmationTemplateData,
): string => {
  const checkInDate = new Date(data.checkInDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const checkOutDate = new Date(data.checkOutDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Confirmation - BookInn</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #3b82f6;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
        }
        .reservation-details {
          background-color: #f0f9ff;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .hotel-info {
          margin-bottom: 20px;
        }
        .dates-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .date-box {
          background-color: #e0f2fe;
          border-radius: 6px;
          padding: 15px;
          width: 45%;
          box-sizing: border-box;
          margin-bottom: 10px;
        }
        .date-box h3 {
          margin-top: 0;
          color: #0284c7;
          font-size: 16px;
        }
        .date-box p {
          margin-bottom: 0;
          font-weight: bold;
        }
        .price-details {
          background-color: #f0f9ff;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .total-price {
          font-weight: bold;
          font-size: 18px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          margin-top: 10px;
        }
        .emergency-contact {
          background-color: #fff7ed;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
          border-left: 4px solid #fb923c;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }
        .confirmation-number {
          font-weight: bold;
          color: #0284c7;
          font-size: 18px;
          text-align: center;
          margin: 20px 0;
        }
        .cancellation-policy {
          background-color: #fef2f2;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        @media only screen and (max-width: 480px) {
          .date-box {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reservation Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${data.guestName}</strong>,</p>
          <p>Your reservation has been confirmed! Below you will find the details of your stay:</p>

          <div class="confirmation-number">
            Confirmation Number: #${data.reservationId}
          </div>

          <div class="reservation-details">
            <div class="hotel-info">
              <h2>${data.hotelName}</h2>
              <p>${data.hotelAddress}</p>
              <p>${data.hotelCity}, ${data.hotelCountry}</p>
            </div>

            <div class="dates-info">
              <div class="date-box">
                <h3>Check-in Date</h3>
                <p>${checkInDate}</p>
              </div>
              <div class="date-box">
                <h3>Check-out Date</h3>
                <p>${checkOutDate}</p>
              </div>
            </div>

            <p><strong>Room Type:</strong> ${data.roomType}</p>
            <p><strong>Number of Guests:</strong> ${data.guestCount}</p>
          </div>

          <div class="price-details">
            <h3>Price Details</h3>
            <div class="price-row">
              <span>Base Price:</span>
              <span>${formatCurrency(data.basePrice)}</span>
            </div>
            <div class="price-row">
              <span>Taxes:</span>
              <span>${formatCurrency(data.taxes)}</span>
            </div>
            <div class="price-row total-price">
              <span>Total:</span>
              <span>${formatCurrency(data.totalPrice)}</span>
            </div>
          </div>

          <div class="emergency-contact">
            <h3>Emergency Contact</h3>
            <p><strong>Name:</strong> ${data.emergencyContactName}</p>
            <p><strong>Phone:</strong> ${data.emergencyContactPhone}</p>
          </div>

          ${
            data.cancellationPolicy
              ? `
          <div class="cancellation-policy">
            <h3>Cancellation Policy</h3>
            <p>${data.cancellationPolicy}</p>
          </div>
          `
              : ''
          }

          <p>If you have any questions or need to modify your reservation, please contact us by replying to this email or calling our customer service.</p>

          <p>We look forward to welcoming you soon!</p>
          <p>The BookInn Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} BookInn. All rights reserved.</p>
          <p>This is an automated email, please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
