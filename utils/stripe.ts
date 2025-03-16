import { loadStripe, Stripe, StripeCardElement, PaymentMethod, PaymentIntent } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key from environment variables
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';

// Initialize Stripe promise
let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe instance (creates it if it doesn't exist)
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

/**
 * Create a payment method using Stripe Elements
 */
export const createPaymentMethod = async (
  stripe: Stripe, 
  cardElement: StripeCardElement, 
  billingDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  }
): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> => {
  try {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, paymentMethod };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment method';
    return { success: false, error: errorMessage };
  }
};

/**
 * Confirm a card payment with the Stripe API
 */
export const confirmCardPayment = async (
  stripe: Stripe,
  clientSecret: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string; payment?: PaymentIntent }> => {
  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (paymentIntent.status === 'succeeded') {
      return { success: true, payment: paymentIntent };
    } else {
      return { success: false, error: `Payment status: ${paymentIntent.status}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Payment confirmation failed';
    return { success: false, error: errorMessage };
  }
}; 