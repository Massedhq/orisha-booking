'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PaymentScreen.module.css';

type PaymentMethod = 'card' | 'apple' | 'google' | 'cashapp';
type LocationType = 'studio' | 'travel';

export type PaymentResult = {
  location: LocationType;
  lashKit: boolean;
  totalPaid: number;
  confirmationCode?: string;
  bookingId?: string;
  squarePaymentId?: string;
};

type BookingData = {
  fullName: string;
  phone: string;
  email: string;
  notes?: string;
  lashLook: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceAddress?: string;
  serviceCity?: string;
  serviceState?: string;
  serviceZip?: string;
};

type PaymentScreenProps = {
  location?: LocationType;
  bookingData: BookingData;
  onBack?: () => void;
  onPaymentSuccess?: (result: PaymentResult) => void;
};

export default function PaymentScreen({
  location = 'studio',
  bookingData,
  onBack,
  onPaymentSuccess,
}: PaymentScreenProps) {

  const [selectedLocation, setSelectedLocation] =
    useState<LocationType>(location);

  const [lashKit, setLashKit] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card');

  const [nameOnCard, setNameOnCard] = useState('');
  const [squareReady, setSquareReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const squarePaymentsRef = useRef<any>(null);
  const squareCardRef = useRef<any>(null);
  const squareApplePayRef = useRef<any>(null);
  const squareGooglePayRef = useRef<any>(null);
  const squareCashAppRef = useRef<any>(null);

  const [applePayReady, setApplePayReady] = useState(false);
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [cashAppReady, setCashAppReady] = useState(false);

  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const [agreement, setAgreement] = useState(false);

  const agreementRef = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    agreementRef.current = agreement;
  }, [agreement]);

  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  /* =========================
     PRICING
  ========================= */

  const bookingFee = 5;

  const travelFee =
    selectedLocation === 'travel' ? 35 : 0;

  const lashKitFee =
    lashKit ? 6 : 0;

  const total =
    bookingFee +
    travelFee +
    lashKitFee;

  const money = (amount: number) =>
    `$${amount.toFixed(2)}`;

  /* =========================
     SQUARE SECURE CARD
     Initialize only after the payment screen DOM is mounted.
     This avoids the blank Square iframe caused by development
     remounts and keeps the card alive when payment methods change.
  ========================= */

  useEffect(() => {
    let cancelled = false;
    let localCard: any = null;
    let startTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadSquareScript() {
      if ((window as any).Square) return;

      const existingScript =
        document.getElementById('square-web-payments-sdk');

      if (existingScript) {
        await new Promise<void>((resolve, reject) => {
          if ((window as any).Square) {
            resolve();
            return;
          }

          existingScript.addEventListener(
            'load',
            () => resolve(),
            { once: true }
          );

          existingScript.addEventListener(
            'error',
            () =>
              reject(
                new Error(
                  'Unable to load Square secure payments.'
                )
              ),
            { once: true }
          );
        });

        return;
      }

      const script = document.createElement('script');
      script.id = 'square-web-payments-sdk';
      script.src =
        'https://sandbox.web.squarecdn.com/v1/square.js';
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () =>
          reject(
            new Error(
              'Unable to load Square secure payments.'
            )
          );

        document.head.appendChild(script);
      });
    }

    async function initializeSquare() {
      try {
        setSquareReady(false);
        setPaymentError('');

        const appId =
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        const locationId =
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
          setPaymentError(
            'Square payment configuration is missing.'
          );
          return;
        }

        await loadSquareScript();

        if (cancelled) return;

        const cardContainer =
          document.getElementById(
            'square-card-container'
          );

        if (!cardContainer) {
          throw new Error(
            'Square card container was not found.'
          );
        }

        const payments =
          (window as any).Square.payments(
            appId,
            locationId
          );

        squarePaymentsRef.current = payments;

        cardContainer.innerHTML = '';

        localCard =
          await payments.card({
            style: {
              input: {
                color: '#111111',
                fontSize: '14px',
                fontFamily:
                  'Arial, Helvetica, sans-serif',
              },
              'input::placeholder': {
                color: '#a1a8b1',
              },
              '.input-container': {
                borderColor: '#d7dce1',
                borderRadius: '6px',
              },
              '.input-container.is-focus': {
                borderColor: '#c9933d',
              },
              '.input-container.is-error': {
                borderColor: '#bd2424',
              },
              '.message-text': {
                color: '#bd2424',
              },
              '.message-icon': {
                color: '#bd2424',
              },
            },
          });

        if (cancelled) {
          await localCard.destroy?.();
          return;
        }

        await localCard.attach(
          '#square-card-container'
        );

        if (cancelled) {
          await localCard.destroy?.();
          return;
        }

        squareCardRef.current = localCard;
        setSquareReady(true);
      } catch (error) {
        if (cancelled) return;

        console.error(
          'Square initialization failed:',
          error
        );

        setSquareReady(false);
        setPaymentError(
          'Secure card entry could not be loaded.'
        );
      }
    }

    /*
      Delay one tick so React development-mode's temporary
      mount/unmount finishes before Square attaches its iframe.
    */
    startTimer = setTimeout(
      initializeSquare,
      0
    );

    return () => {
      cancelled = true;

      if (startTimer) {
        clearTimeout(startTimer);
      }

      if (
        localCard &&
        squareCardRef.current === localCard
      ) {
        squareCardRef.current = null;
      }

      localCard?.destroy?.();
    };
  }, []);

  /* =========================
     SQUARE WALLETS
     Initialize the wallet the customer actually selects.
     Card initialization is completely separate and is never
     destroyed when switching payment methods.
  ========================= */

  useEffect(() => {
    const payments = squarePaymentsRef.current;

    if (!payments || !squareReady) return;
    if (paymentMethod === 'card') return;

    let cancelled = false;
    let localWallet: any = null;

    async function initializeSelectedWallet() {
      const locationId =
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

      if (!locationId) {
        setPaymentError(
          'Square location configuration is missing.'
        );
        return;
      }

      const paymentRequest =
        payments.paymentRequest({
          countryCode: 'US',
          currencyCode: 'USD',
          total: {
            amount: total.toFixed(2),
            label: 'Orisha Infinity',
          },
          locationId,
        });

      try {
        if (paymentMethod === 'apple') {
          setApplePayReady(false);

          const applePay =
            await payments.applePay(
              paymentRequest
            );

          if (cancelled) return;

          localWallet = applePay;
          squareApplePayRef.current = applePay;
          setApplePayReady(true);
          return;
        }

        if (paymentMethod === 'google') {
          setGooglePayReady(false);

          const target =
            document.getElementById(
              'square-google-pay-container'
            );

          if (!target) return;

          target.innerHTML = '';

          const googlePay =
            await payments.googlePay(
              paymentRequest
            );

          localWallet = googlePay;

          await googlePay.attach(
            '#square-google-pay-container'
          );

          if (cancelled) {
            await googlePay.destroy?.();
            return;
          }

          squareGooglePayRef.current =
            googlePay;
          setGooglePayReady(true);
          return;
        }

        if (paymentMethod === 'cashapp') {
          setCashAppReady(false);

          const target =
            document.getElementById(
              'square-cash-app-container'
            );

          if (!target) return;

          target.innerHTML = '';

          const cashAppPay =
            await payments.cashAppPay(
              paymentRequest,
              {
                redirectURL:
                  window.location.href,
                referenceId:
                  crypto.randomUUID(),
                locationId,
              }
            );

          localWallet = cashAppPay;

          cashAppPay.addEventListener(
            'ontokenization',
            async (event: any) => {
              if (cancelled) return;

              const tokenResult =
                event?.detail?.tokenResult;

              if (!agreementRef.current) {
                setPaymentError(
                  'Please accept the non-refundable booking fee agreement before paying.'
                );
                return;
              }

              if (processingRef.current) {
                return;
              }

              if (
                tokenResult?.status !== 'OK' ||
                !tokenResult?.token
              ) {
                console.error(
                  'Cash App tokenization failed:',
                  tokenResult
                );

                setPaymentError(
                  tokenResult?.errors?.[0]?.message ||
                    'Cash App payment information could not be verified.'
                );
                return;
              }

              try {
                processingRef.current = true;
                setIsProcessing(true);
                setPaymentError('');

                await submitSquareToken(
                  tokenResult.token
                );
              } catch (error) {
                console.error(
                  'Cash App payment failed:',
                  error
                );

                setPaymentError(
                  error instanceof Error
                    ? error.message
                    : 'Unable to complete Cash App payment.'
                );
              } finally {
                processingRef.current = false;
                setIsProcessing(false);
              }
            }
          );

          await cashAppPay.attach(
            '#square-cash-app-container'
          );

          if (cancelled) {
            await cashAppPay.destroy?.();
            return;
          }

          squareCashAppRef.current =
            cashAppPay;
          setCashAppReady(true);
        }
      } catch (error) {
        if (cancelled) return;

        if (paymentMethod === 'apple') {
          squareApplePayRef.current = null;
          setApplePayReady(false);
        }

        if (paymentMethod === 'google') {
          squareGooglePayRef.current = null;
          setGooglePayReady(false);
        }

        if (paymentMethod === 'cashapp') {
          squareCashAppRef.current = null;
          setCashAppReady(false);
        }

        console.warn(
          `${paymentMethod} payment method is unavailable:`,
          error
        );
      }
    }

    initializeSelectedWallet();

    return () => {
      cancelled = true;

      if (
        paymentMethod === 'apple' &&
        squareApplePayRef.current ===
          localWallet
      ) {
        squareApplePayRef.current = null;
      }

      if (
        paymentMethod === 'google' &&
        squareGooglePayRef.current ===
          localWallet
      ) {
        squareGooglePayRef.current = null;
      }

      if (
        paymentMethod === 'cashapp' &&
        squareCashAppRef.current ===
          localWallet
      ) {
        squareCashAppRef.current = null;
      }

      if (
        paymentMethod !== 'apple'
      ) {
        localWallet?.destroy?.();
      }
    };
  }, [
    squareReady,
    paymentMethod,
    total,
  ]);

  /* =========================
     FORM VALIDATION
  ========================= */

  const billingFormComplete =
    nameOnCard.trim() !== '' &&
    address.trim() !== '' &&
    city.trim() !== '' &&
    state.trim() !== '' &&
    zip.trim() !== '';

  const selectedPaymentReady =
    paymentMethod === 'card'
      ? squareReady && billingFormComplete
      : paymentMethod === 'apple'
        ? applePayReady
        : paymentMethod === 'google'
          ? googlePayReady
          : cashAppReady;

  const canPay =
    agreement &&
    !isProcessing &&
    selectedPaymentReady &&
    paymentMethod !== 'cashapp';

  function getVerificationDetails() {
    const enteredName =
      nameOnCard.trim() ||
      bookingData.fullName.trim();

    const nameParts =
      enteredName.split(/\s+/).filter(Boolean);

    const givenName =
      nameParts[0] || 'Customer';

    const familyName =
      nameParts.length > 1
        ? nameParts.slice(1).join(' ')
        : 'Customer';

    return {
      amount: total.toFixed(2),
      billingContact: {
        givenName,
        familyName,
        email: bookingData.email.trim(),
        addressLines: [
          address.trim(),
          apartment.trim(),
        ].filter(Boolean),
        city: city.trim(),
        state: state.trim(),
        postalCode: zip.trim(),
        countryCode: 'US',
      },
      currencyCode: 'USD',
      intent: 'CHARGE',
      customerInitiated: true,
      sellerKeyedIn: false,
    };
  }

  async function submitSquareToken(
    sourceId: string
  ) {
    const response =
      await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          fullName:
            bookingData.fullName,
          phone:
            bookingData.phone,
          email:
            bookingData.email,
          notes:
            bookingData.notes || '',
          lashLook:
            bookingData.lashLook,
          appointmentDate:
            bookingData.appointmentDate,
          appointmentTime:
            bookingData.appointmentTime,
          location:
            selectedLocation,
          serviceAddress:
            bookingData.serviceAddress || '',
          serviceCity:
            bookingData.serviceCity || '',
          serviceState:
            bookingData.serviceState || '',
          serviceZip:
            bookingData.serviceZip || '',
          lashKit,
          sourceId,
          idempotencyKey:
            crypto.randomUUID(),
        }),
      });

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          'Unable to complete payment.'
      );
    }

    onPaymentSuccess?.({
      location: selectedLocation,
      lashKit,
      totalPaid: total,
      confirmationCode:
        data?.booking?.confirmation_code,
      bookingId:
        data?.booking?.id,
      squarePaymentId:
        data?.booking?.square_payment_id,
    });
  }

  async function handlePayment() {
    if (!canPay) return;

    setIsProcessing(true);
    setPaymentError('');

    try {
      const paymentMethodObject =
        paymentMethod === 'card'
          ? squareCardRef.current
          : paymentMethod === 'apple'
            ? squareApplePayRef.current
            : paymentMethod === 'google'
              ? squareGooglePayRef.current
              : squareCashAppRef.current;

      if (!paymentMethodObject) {
        throw new Error(
          'This payment method is not available on this device.'
        );
      }

      const tokenResult =
        await paymentMethodObject.tokenize();

      if (
        tokenResult.status !== 'OK' ||
        !tokenResult.token
      ) {
        throw new Error(
          tokenResult.errors?.[0]?.message ||
            'Payment information could not be verified.'
        );
      }

      await submitSquareToken(
        tokenResult.token
      );
    } catch (error) {
      console.error(
        'Payment failed:',
        error
      );

      setPaymentError(
        error instanceof Error
          ? error.message
          : 'Unable to complete payment.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className={styles.screen}>

      {/* APPROVED BANNER */}

      <img
        src="/payment-banner.png"
        alt="Orisha Infinity — Secure Your Appointment"
        className={styles.banner}
      />


      <main className={styles.content}>


        {/* =========================
            APPOINTMENT LOCATION
        ========================= */}

        <section className={styles.locationSection}>

          <div className={styles.sectionHeading}>

            <h2>
              Appointment Location
            </h2>

            <p>
              Your selected location is shown below.
              You can review or change it if needed.
            </p>

          </div>


          <div className={styles.locationGrid}>


            {/* IN STUDIO */}

            <button
              type="button"
              className={`${styles.locationCard} ${
                selectedLocation === 'studio'
                  ? styles.locationSelected
                  : ''
              }`}
              onClick={() =>
                setSelectedLocation('studio')
              }
            >

              <span className={styles.radio}>
                <span />
              </span>

              <span className={styles.locationIcon}>
                ⌂
              </span>

              <span className={styles.locationCopy}>

                <strong>
                  In-Studio
                </strong>

                <small>
                  Orisha Infinity Beauty Studio
                </small>

              </span>

            </button>


            {/* COME TO ME */}

            <button
              type="button"
              className={`${styles.locationCard} ${
                selectedLocation === 'travel'
                  ? styles.locationSelected
                  : ''
              }`}
              onClick={() =>
                setSelectedLocation('travel')
              }
            >

              <span className={styles.radio}>
                <span />
              </span>

              <span className={styles.locationIcon}>
                ◆
              </span>

              <span className={styles.locationCopy}>

                <strong>
                  Come To Me
                </strong>

                <small>
                  + $35 Travel Fee
                  <br />
                  I&apos;ll come to your location
                </small>

              </span>

            </button>


          </div>

          {selectedLocation === 'travel' && (
            <div className={styles.serviceAddressReview}>
              <span className={styles.serviceAddressLabel}>
                Come To Me Address
              </span>

              <strong>
                {[
                  bookingData.serviceAddress,
                  bookingData.serviceCity,
                  bookingData.serviceState,
                  bookingData.serviceZip,
                ]
                  .filter(Boolean)
                  .join(', ') ||
                  'No service address was entered.'}
              </strong>

              <small>
                This is the appointment address entered on Contact Info.
              </small>
            </div>
          )}

        </section>


        {/* =========================
            LASH KIT
        ========================= */}

        <label className={styles.lashKit}>

          <input
            type="checkbox"
            checked={lashKit}
            onChange={(e) =>
              setLashKit(e.target.checked)
            }
          />

          <span className={styles.lashKitCopy}>

            <strong>
              Add a Lash Kit to My Order
            </strong>

            <small>
              Everything you need to maintain
              your lashes at home.
            </small>

          </span>

          <strong className={styles.lashKitPrice}>
            $6.00
          </strong>

        </label>


        {/* =========================
            PAYMENT METHOD
        ========================= */}

        <section
          className={styles.paymentMethodSection}
        >

          <div className={styles.paymentHeading}>

            <h2>
              Payment Method
            </h2>

            <span>
              🔒 Secure &amp; Encrypted
            </span>

          </div>


          <div className={styles.paymentMethods}>


            {/* CARD */}

            <button
              type="button"
              className={
                paymentMethod === 'card'
                  ? styles.paymentSelected
                  : ''
              }
              onClick={() =>
                setPaymentMethod('card')
              }
            >

              <span className={styles.cardIcon}>
                <span
                  className={styles.cardStripe}
                />
              </span>

              <strong>
                Credit / Debit Card
              </strong>

            </button>


            {/* APPLE PAY */}

            <button
              type="button"
              className={
                paymentMethod === 'apple'
                  ? styles.paymentSelected
                  : ''
              }
              onClick={() =>
                setPaymentMethod('apple')
              }
            >

              <span
                className={styles.applePayBadge}
                aria-label="Apple Pay"
              >
                <span className={styles.appleLogo}>
                  {'\uF8FF'}
                </span>
                <span className={styles.payWord}>
                  Pay
                </span>
              </span>

              <strong>
                Apple Pay
              </strong>

            </button>


            {/* GOOGLE PAY */}

            <button
              type="button"
              className={
                paymentMethod === 'google'
                  ? styles.paymentSelected
                  : ''
              }
              onClick={() =>
                setPaymentMethod('google')
              }
            >

              <span className={styles.googleIcon}>
                G
              </span>

              <strong>
                Google Pay
              </strong>

            </button>


            {/* CASH APP */}

            <button
              type="button"
              className={
                paymentMethod === 'cashapp'
                  ? styles.paymentSelected
                  : ''
              }
              onClick={() =>
                setPaymentMethod('cashapp')
              }
            >

              <span className={styles.cashAppIcon}>
                $
              </span>

              <strong>
                Cash App
              </strong>

            </button>


          </div>

        </section>


        {/* =========================
            CARD INFORMATION
        ========================= */}

        <div
          style={{
            display:
              paymentMethod === 'card'
                ? 'block'
                : 'none',
          }}
        >

            <section className={styles.formSection}>

              <h2>
                Card Information
              </h2>


              <div className={styles.squareCardShell}>
                <div
                  id="square-card-container"
                  className={styles.squareCardContainer}
                />

                {!squareReady && !paymentError && (
                  <p className={styles.squareLoading}>
                    Loading secure card entry...
                  </p>
                )}
              </div>

              {paymentError && (
                <p className={styles.paymentError}>
                  {paymentError}
                </p>
              )}


              <label className={styles.fullField}>

                <span>
                  Name on Card
                </span>

                <input
                  type="text"
                  autoComplete="cc-name"
                  value={nameOnCard}
                  onChange={(e) =>
                    setNameOnCard(
                      e.target.value
                    )
                  }
                  placeholder="First and Last Name"
                />

              </label>

            </section>


            {/* BILLING ADDRESS */}

            <section className={styles.formSection}>

              <h2>
                Billing Address
              </h2>


              <div className={styles.addressTopRow}>

                <label>

                  <span>
                    Address
                  </span>

                  <input
                    type="text"
                    autoComplete="address-line1"
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    placeholder="Street Address"
                  />

                </label>


                <label>

                  <span>
                    Apartment, Suite, etc.
                    (Optional)
                  </span>

                  <input
                    type="text"
                    autoComplete="address-line2"
                    value={apartment}
                    onChange={(e) =>
                      setApartment(
                        e.target.value
                      )
                    }
                    placeholder="Apt, Suite, etc."
                  />

                </label>

              </div>


              <div
                className={
                  styles.addressBottomRow
                }
              >

                <label>

                  <span>
                    City
                  </span>

                  <input
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) =>
                      setCity(
                        e.target.value
                      )
                    }
                    placeholder="City"
                  />

                </label>


                <label>

                  <span>
                    State
                  </span>

                  <select
                    value={state}
                    onChange={(e) =>
                      setState(
                        e.target.value
                      )
                    }
                    autoComplete="address-level1"
                  >

                    <option value="">
                      State
                    </option>

                    <option value="TX">
                      Texas
                    </option>

                  </select>

                </label>


                <label>

                  <span>
                    ZIP Code
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={zip}
                    onChange={(e) =>
                      setZip(
                        e.target.value
                      )
                    }
                    placeholder="ZIP Code"
                  />

                </label>

              </div>

            </section>

        </div>


        {/* =========================
            WALLET PAYMENT
        ========================= */}

        {paymentMethod !== 'card' && (

          <section className={styles.walletSection}>

            {paymentMethod === 'apple' && (
              <>
                <div className={styles.walletBrand}>
                  Apple Pay
                </div>

                {applePayReady ? (
                  <button
                    type="button"
                    className={styles.applePayButton}
                    onClick={handlePayment}
                    disabled={
                      !agreement ||
                      isProcessing
                    }
                  >
                    <span>{'\uF8FF'}</span>
                    Pay
                  </button>
                ) : (
                  <p>
                    Apple Pay is not available
                    on this device or browser.
                  </p>
                )}
              </>
            )}

            {paymentMethod === 'google' && (
              <>
                <div className={styles.walletBrand}>
                  Google Pay
                </div>

                <div
                  id="square-google-pay-container"
                  className={styles.squareWalletContainer}
                  onClick={
                    agreement && !isProcessing
                      ? handlePayment
                      : undefined
                  }
                />

                {!googlePayReady && (
                  <p>
                    Google Pay is not available
                    on this device or browser.
                  </p>
                )}
              </>
            )}

            {paymentMethod === 'cashapp' && (
              <>
                <div className={styles.walletBrand}>
                  Cash App
                </div>

                <div
                  id="square-cash-app-container"
                  className={styles.squareWalletContainer}
                />

                {!cashAppReady && (
                  <p>
                    Cash App Pay is not available
                    on this device or browser.
                  </p>
                )}
              </>
            )}

            {paymentError && (
              <p className={styles.paymentError}>
                {paymentError}
              </p>
            )}

          </section>

        )}


        {/* =========================
            ORDER TOTAL
        ========================= */}

        <section className={styles.orderTotal}>

          <div className={styles.totalHeading}>

            <div>

              <span>
                Order Summary
              </span>

              <h2>
                Total Due Today
              </h2>

            </div>

            <strong className={styles.bigTotal}>
              {money(total)}
            </strong>

          </div>


          <div className={styles.totalLines}>

            <div>

              <span>
                Booking Fee
              </span>

              <strong>
                {money(bookingFee)}
              </strong>

            </div>


            {selectedLocation === 'travel' && (

              <div>

                <span>
                  Come To Me Travel Fee
                </span>

                <strong>
                  {money(travelFee)}
                </strong>

              </div>

            )}


            {lashKit && (

              <div>

                <span>
                  Lash Kit
                </span>

                <strong>
                  {money(lashKitFee)}
                </strong>

              </div>

            )}

          </div>


          <div className={styles.totalDivider} />


          <div className={styles.totalFinal}>

            <span>
              Total
            </span>

            <strong>
              {money(total)}
            </strong>

          </div>

        </section>


        {/* =========================
            AGREEMENT
        ========================= */}

        <label className={styles.agreement}>

          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) =>
              setAgreement(
                e.target.checked
              )
            }
          />

          <span>

            <strong>
              <b>*</b>{' '}
              I understand that the $5
              booking fee is non-refundable
              once my booking is confirmed.
            </strong>

            <small>
              This fee secures my appointment
              time and cannot be refunded,
              transferred, or applied to future
              bookings if I do not attend.
            </small>

          </span>

        </label>


        {/* =========================
            BUTTONS
        ========================= */}

        <div className={styles.actions}>

          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
          >
            ← <span>Back</span>
          </button>


          <button
            type="button"
            className={styles.payButton}
            disabled={!canPay}
            onClick={handlePayment}
          >

            <span className={styles.payButtonText}>
              {isProcessing
                ? 'Processing...'
                : `Pay ${money(total)} & Complete Booking`}
            </span>

            <span className={styles.payArrow}>
              →
            </span>

          </button>

        </div>


        <div className={styles.secureMessage}>
          🔒 Your Payment Is Secure &amp; Private
        </div>


      </main>

    </div>
  );
}