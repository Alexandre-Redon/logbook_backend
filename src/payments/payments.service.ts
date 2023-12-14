import { Injectable } from '@nestjs/common';
import { PaymentRequestBody } from './types/PaymentRequestBody';
import Stripe from 'stripe';

interface PaymentResult {
  paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
  sessionId: string;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createPayment(
    paymentRequestBody: PaymentRequestBody,
  ): Promise<PaymentResult> {
    let sumAmount = 0;
    console.log(paymentRequestBody);

    if (
      !paymentRequestBody.cartItems ||
      !Array.isArray(paymentRequestBody.cartItems)
    ) {
      throw new Error('Invalid cartItems in the request.');
    }

    paymentRequestBody.cartItems.forEach((product) => {
      sumAmount += product.price * product.quantity;
    });

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: sumAmount,
        currency: paymentRequestBody.currency || 'eur',
      });

      console.log('PaymentIntent created:', paymentIntent);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Commande',
              },
              unit_amount: sumAmount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:5173/success',
        cancel_url: 'http://localhost:5173/cancel',
      });

      return { paymentIntent, sessionId: session.id };
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw error;
    }
  }
}
