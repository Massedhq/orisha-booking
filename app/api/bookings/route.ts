import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  SquareClient,
  SquareEnvironment,
} from 'square';
import { sql } from '../../../lib/db';

type BookingRequest = {
  fullName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  lashLook?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  location?: 'studio' | 'travel';
  serviceAddress?: string;
  serviceCity?: string;
  serviceState?: string;
  serviceZip?: string;
  lashKit?: boolean;
  sourceId?: string;
  idempotencyKey?: string;
};

function createConfirmationCode() {
  return `OI-${randomUUID()
    .replace(/-/g, '')
    .slice(0, 10)
    .toUpperCase()}`;
}

function getSquareClient() {
  const accessToken =
    process.env.SQUARE_ACCESS_TOKEN?.trim();

  const environment =
    process.env.SQUARE_ENVIRONMENT?.trim();

  if (!accessToken) {
    throw new Error(
      'SQUARE_ACCESS_TOKEN is not configured.'
    );
  }

  return new SquareClient({
    token: accessToken,
    environment:
      environment === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as BookingRequest;

    const fullName =
      body.fullName?.trim();

    const phone =
      body.phone?.trim();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    const notes =
      body.notes?.trim() || null;

    const lashLook =
      body.lashLook?.trim();

    const appointmentDate =
      body.appointmentDate?.trim();

    const appointmentTime =
      body.appointmentTime?.trim();

    const location =
      body.location;

    const sourceId =
      body.sourceId?.trim();

    const idempotencyKey =
      body.idempotencyKey?.trim();

    if (
      !fullName ||
      !phone ||
      !email ||
      !lashLook ||
      !appointmentDate ||
      !appointmentTime ||
      !location
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required booking information.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !sourceId ||
      !idempotencyKey
    ) {
      return NextResponse.json(
        {
          error:
            'Secure payment information is missing.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      location !== 'studio' &&
      location !== 'travel'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid appointment location.',
        },
        {
          status: 400,
        }
      );
    }

    const serviceAddress =
      location === 'travel'
        ? body.serviceAddress?.trim()
        : null;

    const serviceCity =
      location === 'travel'
        ? body.serviceCity?.trim()
        : null;

    const serviceState =
      location === 'travel'
        ? body.serviceState?.trim()
        : null;

    const serviceZip =
      location === 'travel'
        ? body.serviceZip?.trim()
        : null;

    if (
      location === 'travel' &&
      (
        !serviceAddress ||
        !serviceCity ||
        !serviceState ||
        !serviceZip
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Come To Me bookings require a complete service address.',
        },
        {
          status: 400,
        }
      );
    }

    const lashKit =
      Boolean(body.lashKit);

    const bookingFeeCents =
      500;

    const travelFeeCents =
      location === 'travel'
        ? 3500
        : 0;

    const lashKitFeeCents =
      lashKit
        ? 600
        : 0;

    const expectedTotalCents =
      bookingFeeCents +
      travelFeeCents +
      lashKitFeeCents;

    const square =
      getSquareClient();

    let squarePaymentId:
      string | null = null;

    try {
      const squareLocationId =
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.trim();

      if (!squareLocationId) {
        console.error(
          'NEXT_PUBLIC_SQUARE_LOCATION_ID is not configured on the server.'
        );

        return NextResponse.json(
          {
            error:
              'Payment configuration is missing. Your booking has not been confirmed.',
          },
          {
            status: 500,
          }
        );
      }

      const paymentResponse =
        await square.payments.create({
          sourceId,
          idempotencyKey,

          locationId:
            squareLocationId,

          amountMoney: {
            amount:
              BigInt(
                expectedTotalCents
              ),
            currency:
              'USD',
          },

          autocomplete: true,

          note:
            `Orisha Infinity Lash Booking - ${fullName}`,
        });

      const payment =
        paymentResponse.payment;

      if (
        !payment ||
        payment.status !== 'COMPLETED' ||
        !payment.id
      ) {
        console.error(
          'Square payment was not completed:',
          payment
        );

        return NextResponse.json(
          {
            error:
              'Payment was not completed. Your booking has not been confirmed.',
          },
          {
            status: 402,
          }
        );
      }

      squarePaymentId =
        payment.id;

    } catch (squareError: any) {
      console.error(
        'Square payment failed:',
        squareError
      );

      console.error(
        'Square errors:',
        squareError?.errors
      );

      return NextResponse.json(
        {
          error:
            squareError?.errors?.[0]?.detail ||
            'Payment was declined or could not be processed. Your booking has not been confirmed.',
        },
        {
          status: 402,
        }
      );
    }

    const confirmationCode =
      createConfirmationCode();

    const rows = await sql`
      INSERT INTO bookings (
        confirmation_code,
        full_name,
        phone,
        email,
        appointment_notes,
        lash_look,
        appointment_date,
        appointment_time,
        location_type,
        service_address,
        service_city,
        service_state,
        service_zip,
        lash_kit,
        booking_fee_cents,
        travel_fee_cents,
        lash_kit_fee_cents,
        total_paid_cents,
        square_payment_id,
        payment_status,
        booking_status
      )
      VALUES (
        ${confirmationCode},
        ${fullName},
        ${phone},
        ${email},
        ${notes},
        ${lashLook},
        ${appointmentDate},
        ${appointmentTime},
        ${location},
        ${serviceAddress},
        ${serviceCity},
        ${serviceState},
        ${serviceZip},
        ${lashKit},
        ${bookingFeeCents},
        ${travelFeeCents},
        ${lashKitFeeCents},
        ${expectedTotalCents},
        ${squarePaymentId},
        ${'paid'},
        ${'confirmed'}
      )
      RETURNING
        id,
        confirmation_code,
        full_name,
        email,
        phone,
        lash_look,
        appointment_date,
        appointment_time,
        location_type,
        service_address,
        service_city,
        service_state,
        service_zip,
        lash_kit,
        booking_fee_cents,
        travel_fee_cents,
        lash_kit_fee_cents,
        total_paid_cents,
        square_payment_id,
        payment_status,
        booking_status,
        created_at;
    `;

    return NextResponse.json(
      {
        booking: rows[0],
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      'Booking payment/creation failed:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to complete your booking.',
      },
      {
        status: 500,
      }
    );
  }
}