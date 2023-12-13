import { Product } from './Product';

export interface PaymentRequestBody {
  cartItems: Product[];
  currency: string;
}
