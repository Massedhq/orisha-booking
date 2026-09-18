'use client';

import styles from './ConfirmationScreen.module.css';

type LocationType = 'studio' | 'travel';

type ConfirmationScreenProps = {
  selectedLook?: string | null;
  selectedDate?: number | null;
  selectedTime?: string | null;

  location?: LocationType;

  customerEmail?: string;
  customerPhone?: string;

  serviceAddress?: string;
  serviceCity?: string;
  serviceState?: string;
  serviceZip?: string;
  studioAddress?: string;

  lashKit?: boolean;
  totalPaid?: number;

  onBackHome?: () => void;
  onAddToCalendar?: () => void;
};

const LOOKS = [
  {
    id: 'natural',
    name: 'Natural',
    tag: 'Clean. Classic. Effortless.',
    photo: '/natural-lash-look.png',
  },
  {
    id: 'wispy',
    name: 'Wispy Spike Brown',
    tag: 'Soft. Defined. Trendy.',
    photo: '/wispy-spike-brown-look.png',
  },
];

export default function ConfirmationScreen({
  selectedLook = 'natural',
  selectedDate = null,
  selectedTime = null,

  location = 'studio',

  customerEmail = '',
  customerPhone = '',
  serviceAddress = '',
  serviceCity = '',
  serviceState = '',
  serviceZip = '',
  studioAddress = '',

  lashKit = false,
  totalPaid = 5,

  onBackHome,
  onAddToCalendar,
}: ConfirmationScreenProps) {

  const selected =
    LOOKS.find(
      (look) => look.id === selectedLook
    ) ?? LOOKS[0];

  const formattedDate =
    selectedDate !== null
      ? new Date(
          2026,
          8,
          selectedDate
        ).toLocaleDateString(
          'en-US',
          {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }
        )
      : '—';

  const bookingFee = 5;

  const travelFee =
    location === 'travel'
      ? 35
      : 0;

  const lashKitFee =
    lashKit
      ? 6
      : 0;

  const money = (
    amount: number
  ) => `$${amount.toFixed(2)}`;

  const travelAddress = [
    serviceAddress,
    serviceCity,
    serviceState,
    serviceZip,
  ]
    .filter(Boolean)
    .join(', ');

  const confirmedStudioAddress =
    studioAddress ||
    '3335 Columbus Dr, Frisco, Texas 75034';

  const appointmentAddress =
    location === 'studio'
      ? confirmedStudioAddress
      : travelAddress;

  function parseAppointmentTime(time: string) {
    const match = time
      .trim()
      .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);

    if (!match) {
      return null;
    }

    let hour = Number(match[1]);
    const minute = Number(match[2] ?? '0');
    const meridiem = match[3].toUpperCase();

    if (meridiem === 'PM' && hour !== 12) {
      hour += 12;
    }

    if (meridiem === 'AM' && hour === 12) {
      hour = 0;
    }

    return {
      hour,
      minute,
    };
  }

  function formatGoogleCalendarDate(date: Date) {
    const pad = (value: number) =>
      String(value).padStart(2, '0');

    return (
      date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      '00'
    );
  }

  function handleAddToCalendar() {
    if (onAddToCalendar) {
      onAddToCalendar();
      return;
    }

    if (
      selectedDate === null ||
      !selectedTime
    ) {
      return;
    }

    const parsedTime =
      parseAppointmentTime(selectedTime);

    if (!parsedTime) {
      return;
    }

    const startDate = new Date(
      2026,
      8,
      selectedDate,
      parsedTime.hour,
      parsedTime.minute,
      0
    );

    const endDate = new Date(
      startDate.getTime() +
        90 * 60 * 1000
    );

    const details =
      location === 'studio'
        ? 'Orisha Infinity lash appointment. IMPORTANT: Identification is required upon arrival to enter the gate.'
        : 'Orisha Infinity Come To Me lash appointment.';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Orisha Infinity Lash Appointment — ${selected.name}`,
      dates:
        `${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}`,
      details,
      location: appointmentAddress,
    });

    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <div className={styles.screen}>

      {/* =========================
          APPROVED CONFIRMATION BANNER
      ========================= */}

      <img
        src="/confirmation-banner.png"
        alt="Orisha Infinity — You're All Set"
        className={styles.banner}
      />


      {/* =========================
          CONFIRMATION CONTENT
      ========================= */}

      <main className={styles.content}>

        <div className={styles.cardsGrid}>


          {/* =========================
              APPOINTMENT + PAYMENT
          ========================= */}

          <section className={styles.detailsCard}>

            <div className={styles.sectionTitle}>
              Appointment Details
            </div>


            <div className={styles.appointmentBody}>

              <img
                src={selected.photo}
                alt={selected.name}
                className={styles.lashPhoto}
              />


              <div className={styles.appointmentInfo}>

                <div className={styles.lookHeading}>

                  <strong>
                    {selected.name}
                  </strong>

                  <span>
                    {selected.tag}
                  </span>

                </div>


                <DetailRow
                  icon="▣"
                  text={formattedDate}
                />


                <DetailRow
                  icon="◷"
                  text={
                    selectedTime ?? '—'
                  }
                />


                <DetailRow
                  icon="⌖"
                  text={
                    location === 'studio'
                      ? 'Orisha Infinity Beauty Studio'
                      : 'Come To Me'
                  }
                />


                {location === 'studio' ? (

                  <>
                    <p className={styles.locationNote}>
                      {confirmedStudioAddress}
                    </p>

                    <p className={styles.locationNote}>
                      Identification is required upon arrival to enter the gate.
                    </p>
                  </>

                ) : (

                  <p className={styles.locationNote}>
                    {travelAddress ||
                      'Come To Me service address'}
                  </p>

                )}


                {lashKit && (

                  <div className={styles.kitAdded}>
                    ✓ Lash Kit Added
                  </div>

                )}

              </div>

            </div>


            <div className={styles.divider} />


            {/* PAYMENT DETAILS */}

            <div className={styles.sectionTitle}>
              Payment Details
            </div>


            <div className={styles.paymentRows}>

              <PaymentRow
                label="Paid Today — Booking Fee"
                amount={money(bookingFee)}
              />


              {travelFee > 0 && (

                <PaymentRow
                  label="Come To Me Travel Fee"
                  amount={money(travelFee)}
                />

              )}


              {lashKitFee > 0 && (

                <PaymentRow
                  label="Lash Kit"
                  amount={money(lashKitFee)}
                />

              )}

            </div>


            <div className={styles.totalRow}>

              <strong>
                Total Paid
              </strong>

              <strong>
                {money(totalPaid)}
              </strong>

            </div>

          </section>


          {/* =========================
              BOOKING CONFIRMED
          ========================= */}

          <section className={styles.confirmationCard}>

            <div className={styles.checkCircle}>
              ✓
            </div>


            <h2>
              Booking Confirmed
            </h2>


            <p className={styles.confirmationCopy}>
              Your booking contact information:
            </p>


            <div className={styles.contactList}>

              <div className={styles.contactRow}>

                <span className={styles.contactIcon}>
                  ✉
                </span>

                <span>
                  {customerEmail}
                </span>

              </div>


              <div className={styles.contactRow}>

                <span className={styles.contactIcon}>
                  ☎
                </span>

                <span>
                  {customerPhone}
                </span>

              </div>

            </div>


            <div className={styles.goldDivider} />


            <button
              type="button"
              className={styles.calendarButton}
              onClick={handleAddToCalendar}
            >

              <span className={styles.calendarIcon}>
                ▣
              </span>

              <span>
                Add To Calendar
              </span>

              <span className={styles.calendarArrow}>
                ↓
              </span>

            </button>

          </section>

        </div>


        {/* =========================
            BOTTOM INFORMATION
        ========================= */}

        <section className={styles.infoGrid}>


          <InfoItem
            icon="✉"
            title="Booking Contact"
          >
            Keep your email and phone number
            available for appointment updates.
          </InfoItem>


          <div className={styles.verticalDivider} />


          <InfoItem
            icon="♡"
            title="Prepare For Your Visit"
          >
            Please review your appointment
            policies and come with clean,
            makeup-free lashes.
          </InfoItem>


          <div className={styles.verticalDivider} />


          <InfoItem
            icon="✦"
            title="See You Soon"
          >
            Get ready to look, feel,
            and be your best.
          </InfoItem>

        </section>


        {/* =========================
            BACK HOME
        ========================= */}

        <button
          type="button"
          className={styles.homeButton}
          onClick={onBackHome}
        >

          <span>
            Back To Home
          </span>

          <span className={styles.homeArrow}>
            →
          </span>

        </button>

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className={styles.footer}>

        <FooterItem
          icon="◇"
          line1="Premium"
          line2="Quality"
        />

        <div className={styles.footerDivider} />

        <FooterItem
          icon="◒"
          line1="Personalized"
          line2="Experience"
        />

        <div className={styles.footerDivider} />

        <FooterItem
          icon="♡"
          line1="Relax"
          line2="Rejuvenate"
        />

        <div className={styles.footerDivider} />

        <FooterItem
          icon="♛"
          line1="Real Women"
          line2="Real Results"
        />

      </footer>

    </div>
  );
}


/* =========================
   DETAIL ROW
========================= */

function DetailRow({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {

  return (
    <div className={styles.detailRow}>

      <span className={styles.detailIcon}>
        {icon}
      </span>

      <span>
        {text}
      </span>

    </div>
  );
}


/* =========================
   PAYMENT ROW
========================= */

function PaymentRow({
  label,
  amount,
}: {
  label: string;
  amount: string;
}) {

  return (
    <div className={styles.paymentRow}>

      <span>

        <span className={styles.paymentIcon}>
          ▣
        </span>

        {label}

      </span>

      <strong>
        {amount}
      </strong>

    </div>
  );
}


/* =========================
   INFO ITEM
========================= */

function InfoItem({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {

  return (
    <div className={styles.infoItem}>

      <div className={styles.infoIcon}>
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {children}
      </p>

    </div>
  );
}


/* =========================
   FOOTER ITEM
========================= */

function FooterItem({
  icon,
  line1,
  line2,
}: {
  icon: string;
  line1: string;
  line2: string;
}) {

  return (
    <div className={styles.footerItem}>

      <div className={styles.footerIcon}>
        {icon}
      </div>

      <span>
        {line1}
        <br />
        {line2}
      </span>

    </div>
  );
}