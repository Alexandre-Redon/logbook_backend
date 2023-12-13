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

    // Vérifiez que cartItems est défini et est un tableau
    if (
      !paymentRequestBody.cartItems ||
      !Array.isArray(paymentRequestBody.cartItems)
    ) {
      throw new Error('Invalid cartItems in the request.');
    }

    // Calculez le montant total à partir des éléments du panier
    paymentRequestBody.cartItems.forEach((product) => {
      sumAmount += product.price * product.quantity;
    });

    // Utilisez le montant total pour créer le paiement avec Stripe
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: sumAmount,
        currency: paymentRequestBody.currency || 'eur',
      });

      console.log('PaymentIntent created:', paymentIntent);

      // Créez une session de paiement avec Stripe et obtenez l'ID de session
      // mettre les produits dans la session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Commande', // Mettez le nom de votre produit ici
              },
              unit_amount: sumAmount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:5173/', // Remplacez par votre URL de réussite
        cancel_url: 'http://localhost:5173/', // Remplacez par votre URL d'annulation
      });

      // Ajoutez l'ID de session à la réponse
      return { paymentIntent, sessionId: session.id };
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw error;
    }
  }
}
