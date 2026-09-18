'use client';

import { useState } from 'react';
import ContactInfoScreen, {
  ContactInfoData,
} from './ContactInfoScreen';
import PaymentScreen, {
  PaymentResult,
} from './PaymentScreen';
import ConfirmationScreen from './ConfirmationScreen';

const LOOKS = [
  {
    id: 'natural',
    name: 'Natural',
    tag: 'Clean. Classic. Effortless.',
    desc: 'A soft, natural enhancement for everyday beauty. Perfect for a fresh, polished look.',
    photo: '/natural-lash-look.png',
  },
  {
    id: 'wispy',
    name: 'Wispy Spike Brown',
    tag: 'Soft. Defined. Trendy.',
    desc: 'A wispy, spiked style with subtle brown tones for a unique, modern look. Perfect for everyday wear with a little extra flair.',
    photo: '/wispy-spike-brown-look.png',
  },
];

const STEPS = [
  'Lash Look',
  'Date & Time',
  'Contact Info',
  'Payment',
  'Confirmation',
];

type LocationType = 'studio' | 'travel';

export default function Home() {

  const [screen, setScreen] =
    useState<
      'hero' |
      'step1' |
      'step2' |
      'step3' |
      'step4' |
      'step5'
    >('hero');

  const [selectedLook, setSelectedLook] =
    useState<string | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<number | null>(null);

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null);

  const [contactInfo, setContactInfo] =
    useState<ContactInfoData | null>(null);

  const [appointmentLocation, setAppointmentLocation] =
    useState<LocationType>('studio');

  const [lashKitPurchased, setLashKitPurchased] =
    useState(false);

  const [totalPaid, setTotalPaid] =
    useState(5);


  function handleContactContinue(
    data: ContactInfoData
  ) {

    setContactInfo(data);

    setAppointmentLocation(data.location);

    setScreen('step4');
  }


  function handlePaymentSuccess(
    result: PaymentResult
  ) {

    setAppointmentLocation(
      result.location
    );

    setLashKitPurchased(
      result.lashKit
    );

    setTotalPaid(
      result.totalPaid
    );

    setScreen('step5');
  }


  function handleBackHome() {

    setSelectedLook(null);

    setSelectedDate(null);

    setSelectedTime(null);

    setContactInfo(null);

    setAppointmentLocation('studio');

    setLashKitPurchased(false);

    setTotalPaid(5);

    setScreen('hero');
  }


  return (
    <div className="app">

      {screen === 'hero' && (

        <Hero
          onEnter={() =>
            setScreen('step1')
          }
        />

      )}


      {screen === 'step1' && (

        <Step1
          selectedLook={selectedLook}
          onSelectLook={setSelectedLook}
          onBack={() =>
            setScreen('hero')
          }
          onContinue={() =>
            setScreen('step2')
          }
        />

      )}


      {screen === 'step2' && (

        <Step2
          selectedLook={selectedLook}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDate={setSelectedDate}
          onSelectTime={setSelectedTime}
          onBack={() =>
            setScreen('step1')
          }
          onContinue={() =>
            setScreen('step3')
          }
        />

      )}


      {screen === 'step3' && (

        <ContactInfoScreen
          selectedLook={selectedLook}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onEdit={() =>
            setScreen('step2')
          }
          onContinue={handleContactContinue}
        />

      )}


      {screen === 'step4' && (

        <PaymentScreen
          location={appointmentLocation}
          bookingData={{
            fullName:
              contactInfo?.fullName ?? '',
            phone:
              contactInfo?.phone ?? '',
            email:
              contactInfo?.email ?? '',
            notes:
              contactInfo?.notes ?? '',
            lashLook:
              selectedLook ?? '',
            appointmentDate:
              selectedDate
                ? `2026-09-${String(
                    selectedDate
                  ).padStart(2, '0')}`
                : '',
            appointmentTime:
              selectedTime ?? '',
            serviceAddress:
              contactInfo?.serviceAddress ?? '',
            serviceCity:
              contactInfo?.serviceCity ?? '',
            serviceState:
              contactInfo?.serviceState ?? '',
            serviceZip:
              contactInfo?.serviceZip ?? '',
          }}
          onBack={() =>
            setScreen('step3')
          }
          onPaymentSuccess={
            handlePaymentSuccess
          }
        />

      )}


      {screen === 'step5' && (

        <ConfirmationScreen
          selectedLook={selectedLook}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          location={appointmentLocation}
          customerEmail={contactInfo?.email ?? ''}
          customerPhone={contactInfo?.phone ?? ''}
          serviceAddress={contactInfo?.serviceAddress ?? ''}
          serviceCity={contactInfo?.serviceCity ?? ''}
          serviceState={contactInfo?.serviceState ?? ''}
          serviceZip={contactInfo?.serviceZip ?? ''}
          lashKit={lashKitPurchased}
          totalPaid={totalPaid}
          onBackHome={handleBackHome}
        />

      )}

    </div>
  );
}


/* =========================
   HERO
========================= */

function Hero({
  onEnter,
}: {
  onEnter: () => void;
}) {

  return (
    <>

      <div className="hero-bg">

        <img
          src="/orisha-hero.png"
          alt="Orisha Infinity model"
        />

      </div>


      <div className="hero">

        <div>

          <div className="top-row">

            <div className="logo">

              <img
                src="/orisha-logo.png"
                alt="Orisha Infinity — Beauty | Self Care | Beyond"
              />

            </div>


            <div className="top-note">

              <p>
                Same
                <br />
                Beauty
                <br />
                Bigger
                <br />
                Confidence
              </p>

              <div className="rule" />

            </div>

          </div>


          <div className="headline-block">

            <p className="eyebrow">
              The
            </p>

            <h1>
              Lash
            </h1>

            <div className="experience">
              Experience
            </div>

            <div className="divider" />

            <p className="sub">
              Beauty that fits
              <br />
              your lifestyle
            </p>

          </div>


          <div className="features">

            <div className="feature">

              <img
                src="/icon-natural-look.png"
                alt=""
              />

              <span>
                Natural Look
              </span>

            </div>


            <div className="feature">

              <img
                src="/icon-lightweight-feel.png"
                alt=""
              />

              <span>
                Lightweight Feel
              </span>

            </div>


            <div className="feature">

              <img
                src="/icon-long-lasting-wear.png"
                alt=""
              />

              <span>
                Long Lasting Wear
              </span>

            </div>


            <div className="feature">

              <img
                src="/icon-real-results.png"
                alt=""
              />

              <span>
                Real Results
              </span>

            </div>

          </div>

        </div>


        <div>

          <button
            className="cta"
            type="button"
            onClick={onEnter}
          >

            <span className="cta-text">

              <span className="main">
                ENTER HERE
              </span>

              <span className="sub">
                For Booking
              </span>

            </span>


            <span className="rule" />


            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >

              <path d="M5 12h14M13 6l6 6-6 6" />

            </svg>

          </button>


          <div className="strip">

            <p>
              Look Good
              <br />
              Feel Good
            </p>

            <div className="rule" />

            <p>
              Real Women
              <br />
              Real Results
            </p>

            <div className="rule" />

            <p>
              Beauty
              <br />
              Beyond Limits
            </p>

          </div>


          <div className="footer-row">

            <div className="script">

              <img
                src="/lashes-change-everything.png"
                alt="Lashes Change Everything"
              />

            </div>


            <div className="footer-right">

              <p>
                Orisha Infinity
                <br />
                Beauty With Purpose
              </p>

              <div className="rule" />

            </div>

          </div>

        </div>

      </div>

    </>
  );
}


/* =========================
   STEP 1
========================= */

function Step1({
  selectedLook,
  onSelectLook,
  onBack,
  onContinue,
}: {
  selectedLook: string | null;
  onSelectLook: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {

  return (
    <div className="step1">

      <div className="step1-bg">

        <img
          className="step1-photo"
          src="/orisha-booking-step1-bg.png"
          alt="Orisha Infinity model"
        />


        <div className="step1-inner">

          <div className="top-row">

            <div className="logo">

              <img
                src="/orisha-logo-dark.png"
                alt="Orisha Infinity — Beauty | Self Care | Beyond"
              />

            </div>

          </div>


          <div className="step-indicator">

            {STEPS.map((label, i) => (

              <div
                className="step-dot-wrap"
                key={label}
              >

                <div
                  className={`step-dot${
                    i === 0
                      ? ' active'
                      : ''
                  }`}
                >
                  {i + 1}
                </div>

                <div className="step-dot-label">
                  {label}
                </div>

              </div>

            ))}

          </div>


          <div className="step-count">

            <span>
              Step 1 of 5
            </span>

            <div className="rule" />

          </div>


          <h2 className="step1-title">
            Choose Your
            <br />
            Lash Set
          </h2>


          <p className="step1-subtitle">
            Luxury Lashes For Every Look
          </p>


          <p className="step1-desc">
            Select the lash style that fits your
            style and let&apos;s start your booking.
            You&apos;ll choose your date &amp; time next.
          </p>


          <div className="lash-grid">

            {LOOKS.map((look) => (

              <div
                key={look.id}
                className={`lash-card${
                  selectedLook === look.id
                    ? ' selected'
                    : ''
                }`}
                onClick={() =>
                  onSelectLook(look.id)
                }
              >

                <img
                  className="lash-photo"
                  src={look.photo}
                  alt={look.name}
                />


                <div className="lash-card-body">

                  <div className="lash-card-title">

                    {look.name}

                    <span className="rule" />

                  </div>


                  <div className="lash-card-tag">
                    {look.tag}
                  </div>


                  <p className="lash-card-desc">
                    {look.desc}
                  </p>


                  <button
                    type="button"
                    className="lash-card-btn"
                    onClick={(e) => {

                      e.stopPropagation();

                      onSelectLook(
                        look.id
                      );

                    }}
                  >

                    {selectedLook === look.id
                      ? 'Selected'
                      : 'Select This Look'}

                  </button>

                </div>

              </div>

            ))}

          </div>


          <div className="step1-nav">

            <button
              type="button"
              className="step1-back"
              onClick={onBack}
            >

              <span className="circle">

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >

                  <path d="M19 12H5M11 18l-6-6 6-6" />

                </svg>

              </span>

              <span>
                Back
              </span>

            </button>


            <button
              type="button"
              className="step1-continue"
              disabled={!selectedLook}
              onClick={onContinue}
            >

              Continue To Date &amp; Time

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >

                <path d="M5 12h14M13 6l6 6-6 6" />

              </svg>

            </button>


            <div className="step1-beyond">

              <p>
                Beauty
                <br />
                Beyond
                <br />
                Limits
              </p>

              <div className="rule" />

            </div>

          </div>

        </div>

      </div>


      <div className="step1-strip">

        <div className="step1-luxury-item">

          <span className="step1-luxury-mark premium-mark">
            ◆
          </span>

          <span>
            Premium
            <br />
            Application
          </span>

        </div>


        <div className="step1-strip-rule" />


        <div className="step1-luxury-item">

          <span className="step1-luxury-mark feather-mark">
            𓆩
          </span>

          <span>
            Lightweight
            <br />
            Comfort
          </span>

        </div>


        <div className="step1-strip-rule" />


        <div className="step1-luxury-item">

          <span className="step1-luxury-mark">
            28
          </span>

          <span>
            Up To 28 Days
            <br />
            Of Wear
          </span>

        </div>


        <div className="step1-strip-rule" />


        <div className="step1-luxury-item">

          <span className="step1-luxury-mark">
            ∞
          </span>

          <span>
            Beauty
            <br />
            Beyond Limits
          </span>

        </div>

      </div>

    </div>
  );
}


/* =========================
   STEP 2
========================= */

function Step2({
  selectedLook,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onBack,
  onContinue,
}: {
  selectedLook: string | null;
  selectedDate: number | null;
  selectedTime: string | null;
  onSelectDate: (day: number | null) => void;
  onSelectTime: (time: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}) {

  const selected =
    LOOKS.find(
      (look) =>
        look.id === selectedLook
    ) ?? LOOKS[0];

  const days =
    Array.from(
      { length: 30 },
      (_, i) => i + 1
    );

  const startBlanks = 2;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  /*
    Customers must book at least one calendar day
    in advance. Past dates and today's date cannot
    be selected.
  */
  const earliestBookableDate =
    new Date(today);

  earliestBookableDate.setDate(
    earliestBookableDate.getDate() + 1
  );


  const dayOfWeek = (
    day: number
  ) =>
    new Date(
      2026,
      8,
      day
    ).getDay();


  const dateIsAvailable = (
    day: number
  ) => {

    const appointmentDate =
      new Date(
        2026,
        8,
        day
      );

    appointmentDate.setHours(
      0,
      0,
      0,
      0
    );

    if (
      appointmentDate <
      earliestBookableDate
    ) {
      return false;
    }

    return [
      1,
      3,
      4,
      5,
      6,
    ].includes(
      dayOfWeek(day)
    );

  };


  const timesForDate = (
    day: number | null
  ) => {

    if (!day) {
      return [];
    }

    if (
      dayOfWeek(day) === 6
    ) {

      return [
        '12:00 PM',
        '1:00 PM',
        '2:00 PM',
        '3:00 PM',
      ];

    }

    return [
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '7:00 PM',
    ];

  };


  const times =
    timesForDate(
      selectedDate
    );


  return (
    <div className="step2">

      <div className="step2-book-banner">

        <img
          src="/book-banner.png"
          alt="Orisha Infinity — Book Your Lash Experience"
        />

      </div>


      <div className="step2-inner">


        <div className="step2-progress">

          {STEPS.map(
            (label, i) => (

              <div
                className="step-dot-wrap"
                key={label}
              >

                <div
                  className={`step-dot${
                    i === 1
                      ? ' active'
                      : ''
                  }`}
                >
                  {i + 1}
                </div>

                <div className="step-dot-label">
                  {label}
                </div>

              </div>

            )
          )}

        </div>


        <div className="step2-heading">

          <div className="step-count">

            <span>
              Step 2 of 5
            </span>

            <div className="rule" />

          </div>


          <h2>
            Choose Your
            <br />
            Date &amp; Time
          </h2>


          <p>
            Choose the day and time that works
            best for you.
          </p>

        </div>


        <div className="step2-selected">

          <img
            src={selected.photo}
            alt={selected.name}
          />


          <div className="step2-selected-copy">

            <span>
              Selected Lash Look
            </span>

            <strong>
              {selected.name}
            </strong>

            <button
              type="button"
              onClick={onBack}
            >
              Change Look
            </button>

          </div>

        </div>


        <section className="step2-calendar">

          <div className="step2-section-head">

            <div>

              <span>
                Select A Date
              </span>

              <strong>
                September 2026
              </strong>

            </div>

          </div>


          <div className="weekday-row">

            {[
              'SUN',
              'MON',
              'TUE',
              'WED',
              'THU',
              'FRI',
              'SAT',
            ].map((day) => (

              <span key={day}>
                {day}
              </span>

            ))}

          </div>


          <div className="calendar-grid">

            {Array.from({
              length: startBlanks,
            }).map((_, i) => (

              <span
                key={`blank-${i}`}
              />

            ))}


            {days.map((day) => {

              const available =
                dateIsAvailable(day);

              return (

                <button
                  type="button"
                  key={day}
                  disabled={!available}
                  className={`calendar-day${
                    selectedDate === day
                      ? ' selected'
                      : ''
                  }`}
                  onClick={() => {

                    onSelectDate(day);

                    onSelectTime(null);

                  }}
                >
                  {day}
                </button>

              );

            })}

          </div>

        </section>


        <section className="step2-times">

          <div className="step2-section-head">

            <div>

              <span>
                Select A Time
              </span>

              <strong>

                {selectedDate
                  ? `September ${selectedDate}`
                  : 'Choose a date above'}

              </strong>

            </div>

          </div>


          {selectedDate ? (

            <div className="time-grid">

              {times.map((time) => (

                <button
                  type="button"
                  key={time}
                  className={`time-option${
                    selectedTime === time
                      ? ' selected'
                      : ''
                  }`}
                  onClick={() =>
                    onSelectTime(time)
                  }
                >
                  {time}
                </button>

              ))}

            </div>

          ) : (

            <div className="step2-time-empty">
              Available appointment times will
              appear here.
            </div>

          )}

        </section>


        <div className="step2-booking-summary">

          <div>

            <span>
              Look
            </span>

            <strong>
              {selected.name}
            </strong>

          </div>


          <div>

            <span>
              Date
            </span>

            <strong>

              {selectedDate
                ? `Sep ${selectedDate}`
                : '—'}

            </strong>

          </div>


          <div>

            <span>
              Time
            </span>

            <strong>
              {selectedTime ?? '—'}
            </strong>

          </div>

        </div>


        <button
          type="button"
          className="step2-continue"
          disabled={
            !selectedDate ||
            !selectedTime
          }
          onClick={onContinue}
        >

          Continue To Contact Info

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >

            <path d="M5 12h14M13 6l6 6-6 6" />

          </svg>

        </button>

      </div>

    </div>
  );
}