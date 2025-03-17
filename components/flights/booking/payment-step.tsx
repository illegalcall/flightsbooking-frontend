"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { saveBookingData, getBookingData } from "@/utils/localStorage";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { paymentsApi, getAuthHeaders } from "@/services/api";

interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

interface ContactInfo {
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  address?: Address;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneCountryCode: string;
    phoneNumber: string;
  };
  preferences?: {
    receivePromotions: boolean;
    receiveFlightUpdates: boolean;
  };
}

interface FlightDetails {
  id: string;
  airline: string;
  flightNumber: string;
  origin: {
    code: string;
    city: string;
    name: string;
  };
  destination: {
    code: string;
    city: string;
    name: string;
  };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  price: number;
  cabinClass: string;
  basePrice?: number;
}

interface Passenger {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

interface Seat {
  id?: string;
  passengerId?: number;
  seatNumber: string;
  seatClass: string;
  price: number;
}

interface Addon {
  id: string;
  selected: boolean;
  optionId?: string;
  price: number;
}

interface BookingData {
  flightDetails?: FlightDetails;
  passengers?: Passenger[];
  selectedSeats?: Seat[];
  addons?: Addon[];
  contactInfo?: ContactInfo;
  payment?: PaymentInfo;
  bookingReference?: string;
}

interface PaymentInfo {
  method: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  timestamp: string;
}

interface PaymentStepProps {
  bookingData: BookingData;
  onComplete: (data: { payment: PaymentInfo }) => void;
  onBack: () => void;
}

// Initialize Stripe promise
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export function PaymentStep({
  bookingData,
  onComplete,
  onBack,
}: PaymentStepProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        bookingData={bookingData}
        onComplete={onComplete}
        onBack={onBack}
      />
    </Elements>
  );
}

function PaymentForm({ bookingData, onComplete, onBack }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Calculate prices for the payment
  const calculateSubtotal = useCallback(() => {
    // Base flight price - use basePrice from flightDetails
    const flightPrice =
      bookingData.flightDetails?.basePrice ||
      bookingData.flightDetails?.price ||
      0;

    // Passengers count
    const passengerCount = bookingData.passengers?.length || 1;

    // Seat upgrades
    const seatUpgradesTotal =
      bookingData.selectedSeats?.reduce(
        (total: number, seat: Seat) => total + (seat.price || 0),
        0
      ) || 0;

    // Add-ons
    const addonsTotal =
      bookingData.addons?.reduce(
        (total: number, addon: Addon) => total + (addon.price || 0),
        0
      ) || 0;

    return flightPrice * passengerCount + seatUpgradesTotal + addonsTotal;
  }, [
    bookingData.flightDetails,
    bookingData.passengers,
    bookingData.selectedSeats,
    bookingData.addons,
  ]);

  const calculateTaxes = useCallback((subtotal: number) => {
    return subtotal * 0.12; // 12% tax rate for demo
  }, []);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes(subtotal);
    return subtotal + taxes;
  }, [calculateSubtotal, calculateTaxes]);

  // Create PaymentIntent on component mount
  useEffect(() => {
    console.log("hi");
    const createBookingAndPaymentIntent = async () => {
      try {
        // Calculate the total amount
        const totalAmount = calculateTotal();

        // Get auth token from localStorage

        // Get booking data from localStorage
        const storedBookingData = getBookingData();

        // Validate booking data exists
        if (
          !storedBookingData ||
          !storedBookingData.flightDetails ||
          !storedBookingData.passengers ||
          !storedBookingData.selectedSeats ||
          storedBookingData.passengers.length === 0 ||
          storedBookingData.selectedSeats.length === 0
        ) {
          throw new Error(
            "Incomplete booking data. Please complete all previous steps."
          );
        }

        // Extract needed data for the API request using type assertions to satisfy TypeScript
        // These assertions are safe because we've already checked that these properties exist
        const flightId = (storedBookingData.flightDetails as FlightDetails).id;
        const passengerDetails = storedBookingData.passengers.map(
          (passenger) => ({
            fullName: `${passenger.firstName} ${passenger.lastName}`,
            age: 30, // Note: Age isn't captured in the form, using default
            documentNumber: passenger.passportNumber,
            specialRequests: "", // Note: Special requests aren't captured in the form
          })
        );
        const seatNumbers = storedBookingData.selectedSeats.map(
          (seat) => seat.seatNumber
        );
        // Get the cabin class from the selected seat (first passenger)
        const selectedCabin =
          bookingData?.selectedSeats?.[0]?.seatClass || "Economy";

        // 1. First create the booking
        const bookingResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/bookings`,
          {
            method: "POST",
            headers: await getAuthHeaders(),
            body: JSON.stringify({
              flightId: flightId,
              passengerDetails: passengerDetails,
              seatNumbers: seatNumbers,
              selectedCabin,
            }),
          }
        );

        // Note: This component doesn't handle webhooks directly.
        // The "Invalid webhook payload" error is occurring in the backend.
        // Make sure your NestJS backend is configured to handle raw bodies for Stripe webhooks.
        // See: https://stripe.com/docs/webhooks/signatures for details on webhook signature verification

        if (!bookingResponse.ok) {
          throw new Error(`Booking creation failed: ${bookingResponse.status}`);
        }

        const bookingResponseData = await bookingResponse.json();

        // Save booking ID and reference to localStorage
        if (bookingResponseData && bookingResponseData.id) {
          // Use the booking reference from the API if available, otherwise use the booking ID
          const bookingReference = bookingResponseData.bookingReference || "";

          saveBookingData({
            bookingId: bookingResponseData.id,
            bookingReference: bookingReference,
          });

          console.log(
            "Booking created successfully with ID:",
            bookingResponseData.id,
            "and reference:",
            bookingReference
          );
        } else {
          throw new Error("Invalid response from booking API");
        }

        // 2. Then create payment intent with the booking ID
        const response = await paymentsApi.createPaymentIntent({
          bookingId: bookingResponseData.id,
          amount: totalAmount * 100, // Convert to cents
          currency: "usd",
          customer: {
            email: bookingData.contactInfo?.email || "",
            name: passengerDetails[0]?.fullName || "Customer",
          },
        });

        if (!response.success) {
          throw new Error(`Payment intent creation failed: ${response.error}`);
        }

        // Set the client secret from the API response
        if (
          response &&
          (response as unknown as { clientSecret: string }).clientSecret
        ) {
          setClientSecret(
            (response as unknown as { clientSecret: string }).clientSecret
          );
        } else {
          throw new Error("Invalid response from payment intent API");
        }
      } catch (error) {
        console.error("Error setting up booking and payment:", error);
        toast({
          title: "Setup Error",
          description:
            "Could not initialize booking or payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    createBookingAndPaymentIntent();
  }, [
    bookingData.passengers,
    bookingData.selectedSeats,
    bookingData.contactInfo?.email,
    calculateTotal,
  ]);

  const handlePaymentSubmit = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Stripe has not been properly initialized.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      toast({
        title: "Payment Error",
        description: "Card element not found.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      if (!clientSecret) {
        throw new Error("Payment not initialized properly");
      }

      // Confirm payment with the card details
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: bookingData.passengers?.[0]
                ? `${bookingData.passengers[0].firstName} ${bookingData.passengers[0].lastName}`
                : "Customer",
              email: bookingData.contactInfo?.email || "",
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === "succeeded") {
        // Complete the booking process
        onComplete({
          payment: {
            method: paymentMethod,
            amount: calculateTotal(),
            currency: "USD",
            status: "succeeded",
            transactionId: paymentIntent.id,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment processing failed";
      setPaymentError(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payment</h2>
      <p className="text-muted-foreground">
        Complete your booking by providing payment details.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label
                    htmlFor="credit-card"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">Credit or Debit Card</div>
                    <div className="text-sm text-muted-foreground">
                      Pay securely with your card
                    </div>
                  </Label>
                  <div className="flex space-x-1">
                    <div className="h-8 w-12 bg-slate-200 rounded"></div>
                    <div className="h-8 w-12 bg-slate-200 rounded"></div>
                    <div className="h-8 w-12 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </RadioGroup>

              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Card Details
                </p>
                <div className="space-y-4">
                  <div
                    className="p-3 border rounded-md"
                    data-testid="card-element-container"
                  >
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#424770",
                            "::placeholder": {
                              color: "#aab7c4",
                            },
                          },
                          invalid: {
                            color: "#9e2146",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {paymentError && (
                  <div className="mt-2 text-sm text-red-500">
                    {paymentError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="same-address"
                  className="rounded"
                  checked={true}
                  readOnly
                />
                <Label htmlFor="same-address">Same as contact address</Label>
              </div>

              {bookingData.contactInfo?.address && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium">
                    {bookingData.passengers?.[0]?.firstName}{" "}
                    {bookingData.passengers?.[0]?.lastName}
                  </p>
                  <p>{bookingData.contactInfo.address.street}</p>
                  <p>
                    {bookingData.contactInfo.address.city},
                    {bookingData.contactInfo.address.state &&
                      ` ${bookingData.contactInfo.address.state},`}
                    {bookingData.contactInfo.address.postalCode}
                  </p>
                  <p>{bookingData.contactInfo.address.country}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>
                    Flight ({bookingData.passengers?.length || 1} passenger
                    {(bookingData.passengers?.length || 1) > 1 ? "s" : ""})
                  </span>
                  <span>
                    $
                    {(
                      (bookingData.flightDetails?.basePrice ||
                        bookingData.flightDetails?.price ||
                        0) * (bookingData.passengers?.length || 1)
                    ).toFixed(2)}
                  </span>
                </div>

                {bookingData.selectedSeats &&
                  bookingData.selectedSeats.length > 0 && (
                    <div className="flex justify-between">
                      <span>Seat selection</span>
                      <span>
                        $
                        {bookingData.selectedSeats
                          .reduce((acc, seat) => acc + seat.price, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  )}

                {bookingData.addons && bookingData.addons.length > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons</span>
                    <span>
                      $
                      {bookingData.addons
                        .reduce(
                          (acc, addon) =>
                            addon.selected ? acc + addon.price : acc,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes & fees</span>
                  <span>${calculateTaxes(calculateSubtotal()).toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handlePaymentSubmit}
                className="w-full"
                disabled={isProcessing || !stripe || !elements || !clientSecret}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${calculateTotal().toFixed(2)}`
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              By clicking &quot;Pay&quot;, you agree to our{" "}
              <a href="#" className="underline">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
