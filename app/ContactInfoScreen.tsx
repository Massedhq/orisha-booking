'use client';

import { useState } from 'react';
import styles from './ContactInfoScreen.module.css';

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

export type LocationType =
  | 'studio'
  | 'travel';

export type ContactInfoData = {
  fullName: string;
  phone: string;
  email: string;
  notes: string;

  location: LocationType;

  serviceAddress: string;
  serviceCity: string;
  serviceState: string;
  serviceZip: string;
};

type Props = {
  selectedLook?: string | null;
  selectedDate?: number | null;
  selectedTime?: string | null;

  onEdit?: () => void;

  onContinue?: (
    data: ContactInfoData
  ) => void;
};

export default function ContactInfoScreen({
  selectedLook = 'natural',
  selectedDate = null,
  selectedTime = null,
  onEdit,
  onContinue,
}: Props) {

  const [fullName, setFullName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [location, setLocation] =
    useState<LocationType | null>(
      null
    );

  const [address, setAddress] =
    useState('');

  const [city, setCity] =
    useState('');

  const [zip, setZip] =
    useState('');

  const [agreed, setAgreed] =
    useState(false);


  const selected =
    LOOKS.find(
      (look) =>
        look.id === selectedLook
    ) ?? LOOKS[0];


  const formattedDate =
    selectedDate
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


  /* =========================
     PHONE FORMATTING
  ========================= */

  function formatPhone(
    value: string
  ) {

    const digits =
      value
        .replace(/\D/g, '')
        .slice(0, 10);

    if (digits.length <= 3) {

      return digits.length
        ? `(${digits}`
        : '';

    }

    if (digits.length <= 6) {

      return `(${digits.slice(
        0,
        3
      )}) ${digits.slice(3)}`;

    }

    return `(${digits.slice(
      0,
      3
    )}) ${digits.slice(
      3,
      6
    )}-${digits.slice(6)}`;
  }


  function handlePhoneChange(
    value: string
  ) {

    setPhone(
      formatPhone(value)
    );
  }


  /* =========================
     VALIDATION
  ========================= */

  const phoneDigits =
    phone.replace(/\D/g, '');

  const phoneValid =
    phoneDigits.length === 10;


  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );


  const zipValid =
    /^\d{5}$/.test(zip);


  const travelComplete =
    location !== 'travel' ||
    (
      address.trim() !== '' &&
      city.trim() !== '' &&
      zipValid
    );


  const canContinue =
    fullName.trim() !== '' &&
    phoneValid &&
    emailValid &&
    location !== null &&
    agreed &&
    travelComplete;


  /* =========================
     CONTINUE
  ========================= */

  function handleContinue() {

    if (
      !canContinue ||
      !location
    ) {
      return;
    }


    const contactData:
      ContactInfoData = {

      fullName:
        fullName.trim(),

      phone,

      email:
        email
          .trim()
          .toLowerCase(),

      notes:
        notes.trim(),

      location,

      serviceAddress:
        location === 'travel'
          ? address.trim()
          : '',

      serviceCity:
        location === 'travel'
          ? city.trim()
          : '',

      serviceState:
        location === 'travel'
          ? 'TX'
          : '',

      serviceZip:
        location === 'travel'
          ? zip
          : '',
    };


    onContinue?.(
      contactData
    );
  }


  return (
    <div className={styles.screen}>

      <img
        className={styles.banner}
        src="/contact-info.png"
        alt="Orisha Infinity — Contact Information"
      />


      <main className={styles.content}>

        <header className={styles.heading}>

          <div className={styles.stepLine}>

            <span>
              Step 3 of 5
            </span>

            <i />

          </div>


          <h1>
            Enter Your
            <br />
            Contact Info
          </h1>


          <p>
            Please provide your details so we can
            confirm your appointment.
          </p>

        </header>


        {/* CONTACT INFORMATION */}

        <section className={styles.card}>

          <div className={styles.cardTitle}>

            <span className={styles.icon}>
              ○
            </span>

            <h2>
              Contact Information
            </h2>

          </div>


          <div className={styles.twoCol}>

            <label>

              <span>
                Full Name <b>*</b>
              </span>

              <input
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                autoComplete="name"
                placeholder="First and Last Name"
              />

            </label>


            <label>

              <span>
                Phone Number <b>*</b>
              </span>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  handlePhoneChange(
                    e.target.value
                  )
                }
                inputMode="tel"
                autoComplete="tel"
                maxLength={14}
                placeholder="(XXX) XXX-XXXX"
              />

            </label>

          </div>


          <label>

            <span>
              Email Address <b>*</b>
            </span>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              autoComplete="email"
              placeholder="you@example.com"
            />

          </label>


          <label>

            <span>
              Appointment Notes{' '}
              <small>
                (Optional)
              </small>
            </span>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Let us know if you have any special requests, allergies, or anything we should know."
            />

          </label>

        </section>


        {/* APPOINTMENT LOCATION */}

        <section className={styles.card}>

          <div className={styles.cardTitle}>

            <span className={styles.icon}>
              ⌖
            </span>

            <div>

              <h2>
                Appointment Location
              </h2>

              <p>
                Choose where you would like to
                receive your lash service.
              </p>

            </div>

          </div>


          <div className={styles.locationGrid}>

            {/* IN STUDIO */}

            <button
              type="button"
              className={`${styles.locationCard} ${
                location === 'studio'
                  ? styles.selected
                  : ''
              }`}
              onClick={() =>
                setLocation('studio')
              }
            >

              <span className={styles.radio} />

              <span className={styles.locationIcon}>
                ⌂
              </span>

              <span className={styles.locationCopy}>

                <strong>
                  In Studio
                </strong>

                <small>
                  Visit our private beauty studio
                  for your appointment.
                </small>

              </span>

            </button>


            {/* COME TO ME */}

            <button
              type="button"
              className={`${styles.locationCard} ${
                location === 'travel'
                  ? styles.selected
                  : ''
              }`}
              onClick={() =>
                setLocation('travel')
              }
            >

              <span className={styles.radio} />

              <span className={styles.locationIcon}>
                ◇
              </span>

              <span className={styles.locationCopy}>

                <strong>
                  Come To Me
                </strong>

                <small>
                  Have me come to you! Select this
                  option if you want your lash
                  artist to travel to your location.
                </small>

              </span>


              <span className={styles.fee}>
                +$35 Flat Fee
              </span>

            </button>

          </div>


          {/* TRAVEL ADDRESS */}

          {location === 'travel' && (

            <div className={styles.travelFields}>

              <label>

                <span>
                  Service Address <b>*</b>
                </span>

                <input
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                  autoComplete="street-address"
                  placeholder="Enter your full address"
                />

              </label>


              <div className={styles.addressRow}>

                <label>

                  <span>
                    City <b>*</b>
                  </span>

                  <input
                    value={city}
                    onChange={(e) =>
                      setCity(
                        e.target.value
                      )
                    }
                    autoComplete="address-level2"
                    placeholder="City"
                  />

                </label>


                <label>

                  <span>
                    State <b>*</b>
                  </span>

                  <select
                    value="TX"
                    disabled
                    aria-label="State"
                  >

                    <option value="TX">
                      Texas (TX)
                    </option>

                  </select>

                </label>


                <label>

                  <span>
                    Zip Code <b>*</b>
                  </span>

                  <input
                    value={zip}
                    onChange={(e) => {

                      const digits =
                        e.target.value
                          .replace(
                            /\D/g,
                            ''
                          )
                          .slice(
                            0,
                            5
                          );

                      setZip(digits);

                    }}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    placeholder="Zip Code"
                  />

                </label>

              </div>

            </div>

          )}

        </section>


        {/* POLICIES */}

        <section className={styles.policy}>

          <div className={styles.policyTitle}>

            <span>
              !
            </span>

            <h2>
              Important: Lash Appointment Policies
            </h2>

          </div>


          <ul>

            <li>
              All lash appointments must come with
              a clean face and clean lashes.
            </li>

            <li>
              I do not work over previous lash work.
              You must come with no old lashes.
            </li>

            <li>
              You must arrive with no lash extensions,
              glue, or residue.
            </li>

            <li>
              If you arrive with previous lash work,
              your appointment may be rescheduled and
              the booking fee will still be
              non-refundable.
            </li>

          </ul>


          <label className={styles.agreement}>

            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) =>
                setAgreed(
                  e.target.checked
                )
              }
            />

            <span>
              I understand and agree to the above
              lash policies. <b>*</b>
            </span>

          </label>

        </section>


        {/* BOOKING SUMMARY */}

        <section className={styles.summary}>

          <div className={styles.summaryTop}>

            <h2>
              Your Booking Summary
            </h2>

            <button
              type="button"
              onClick={onEdit}
            >
              Edit
            </button>

          </div>


          <div className={styles.summaryBody}>

            <img
              src={selected.photo}
              alt={selected.name}
            />


            <div className={styles.lookCopy}>

              <strong>
                {selected.name}
              </strong>

              <span>
                {selected.tag}
              </span>

            </div>


            <div className={styles.summaryDetails}>

              <div>

                <span>
                  Date
                </span>

                <strong>
                  {formattedDate}
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


              <div>

                <span>
                  Location
                </span>

                <strong>

                  {location === 'studio'
                    ? 'In Studio'
                    : location === 'travel'
                      ? 'Come To Me'
                      : '—'}

                </strong>

              </div>


              {location === 'studio' && (

                <small>
                  Address will be provided after payment
                </small>

              )}

            </div>

          </div>

        </section>


        {/* CONTINUE */}

        <button
          type="button"
          className={styles.continue}
          disabled={!canContinue}
          onClick={handleContinue}
        >

          Continue To Payment

          <span>
            →
          </span>

        </button>


        <div className={styles.secure}>
          ▣ &nbsp; Your Information Is Secure &amp; Private
        </div>

      </main>


      <footer className={styles.footer}>

        <div>

          <strong>
            ◇
          </strong>

          <span>
            Premium
            <br />
            Quality
          </span>

        </div>


        <div>

          <strong>
            ◒
          </strong>

          <span>
            Personalized
            <br />
            Experience
          </span>

        </div>


        <div>

          <strong>
            ♡
          </strong>

          <span>
            Relax
            <br />
            Rejuvenate
          </span>

        </div>


        <div>

          <strong>
            ♛
          </strong>

          <span>
            Real Women
            <br />
            Real Results
          </span>

        </div>

      </footer>

    </div>
  );
}